import { PromoError } from "@/lib/promo-codes";
import { listStripeCodes, mintStripeCode } from "@/lib/promo-codes-stripe";
import { authorize, error, json, readBody } from "@/lib/schedule-api";
import type { Raw } from "@/lib/schedule-input";

export const dynamic = "force-dynamic";

const str = (body: Raw, key: string) => {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
};

const message = (err: unknown) =>
  err instanceof Error ? err.message : String(err);

/** Every code /backstage/promo minted, newest first. */
export async function GET() {
  const access = await authorize("promo.manage");
  if (access instanceof Response) return access;
  try {
    return json({ codes: await listStripeCodes() });
  } catch (err) {
    return failed(err);
  }
}

/**
 * Mints one code, checked as the /backstage/promo form checks it:
 * `{name, purpose, email?, customCode?, uses?, unlimited?, notes?, couponId?}`.
 * Re-sending the same code for the same guest reuses it (200, `reused`);
 * a custom code that belongs to someone else is a 409.
 */
export async function POST(request: Request) {
  const access = await authorize("promo.manage");
  if (access instanceof Response) return access;
  const body = await readBody(request);
  if (body instanceof Response) return body;

  const name = str(body, "name");
  if (!name) return error("Required.", 400, "name");
  const purpose = str(body, "purpose");
  if (!purpose) return error("Required.", 400, "purpose");
  const unlimited = body.unlimited === true;
  const uses = Number(body.uses ?? 1);
  if (!unlimited && !(Number.isInteger(uses) && uses >= 1))
    return error("A whole number, at least 1.", 400, "uses");
  const customCode = str(body, "customCode");
  if (customCode && !/^[A-Za-z0-9-]+$/.test(customCode))
    return error("Letters, digits, and dashes only.", 400, "customCode");

  try {
    const minted = await mintStripeCode({
      name,
      email: str(body, "email"),
      customCode,
      maxUses: unlimited ? null : uses,
      purpose,
      notes: str(body, "notes"),
      couponId: str(body, "couponId") || undefined,
      issuedBy: access.name,
    });
    return json({ minted }, minted.reused ? 200 : 201);
  } catch (err) {
    return failed(err);
  }
}

function failed(err: unknown): Response {
  if (err instanceof PromoError) {
    if (err.code === "config") return error(err.message, 503);
    const field = err.code === "collision" ? "customCode" : undefined;
    return error(err.message, 409, field);
  }
  // Stripe refusing the request (an unknown coupon, say) is the caller's to fix.
  const { type, param } = err as { type?: string; param?: string };
  if (type === "StripeInvalidRequestError") {
    const field = param?.includes("coupon") ? "couponId" : undefined;
    return error(message(err), 400, field);
  }
  console.error("[promo api] Stripe call failed:", err);
  return error(message(err), 502);
}
