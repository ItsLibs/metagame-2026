import {
  normalizeCustomCode,
  PromoError,
  PURPOSES,
  type MintResult,
} from "@/lib/promo-codes";
import {
  amountOffCoupons,
  findStripeCode,
  listStripeCodes,
  mintStripeCode,
} from "@/lib/promo-codes-stripe";
import { authorize, error, json, readBody } from "@/lib/schedule-api";
import type { Raw } from "@/lib/schedule-input";

export const dynamic = "force-dynamic";

const CODE = /^[A-Za-z0-9-]+$/;

const str = (body: Raw, key: string) => {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
};

const message = (err: unknown) =>
  err instanceof Error ? err.message : String(err);

/**
 * `?code=`: whether that code exists on Stripe, `{exists, active?}`, so a
 * caller can check before minting. Without it, every code /backstage/promo
 * minted, newest first.
 */
export async function GET(request: Request) {
  const access = await authorize("promo.manage");
  if (access instanceof Response) return access;
  const code = new URL(request.url).searchParams.get("code")?.trim();
  try {
    if (code === undefined) return json({ codes: await listStripeCodes() });
    if (!CODE.test(code))
      return error("Letters, digits, and dashes only.", 400, "code");
    const found = await findStripeCode(normalizeCustomCode(code));
    return json(
      found ? { exists: true, active: found.active } : { exists: false },
    );
  } catch (err) {
    return failed(err);
  }
}

/**
 * Mints one code, checked as the /backstage/promo form checks it:
 * `{name, purpose, customCode?, maxUses?, email?, notes?}` plus the coupon as
 * `couponId` or `amountOffUsd`. `purpose` must be one of the form's dropdown
 * options. `maxUses` left out or null is unlimited, since a poster's code is
 * shared; a number caps it. A custom code that already exists on Stripe is a
 * 409.
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
  if (!(PURPOSES as readonly string[]).includes(purpose))
    return error(`One of: ${PURPOSES.join(", ")}.`, 400, "purpose");
  const { maxUses = null } = body;
  if (maxUses !== null && !(Number.isInteger(maxUses) && Number(maxUses) >= 1))
    return error("A whole number, at least 1, or null.", 400, "maxUses");
  const customCode = normalizeCustomCode(str(body, "customCode"));
  if (customCode && !CODE.test(customCode))
    return error("Letters, digits, and dashes only.", 400, "customCode");
  let couponId = str(body, "couponId");
  const { amountOffUsd } = body;
  if (amountOffUsd !== undefined) {
    if (couponId)
      return error(
        "Send couponId or amountOffUsd, not both.",
        400,
        "amountOffUsd",
      );
    if (typeof amountOffUsd !== "number" || !(amountOffUsd > 0))
      return error("A dollar amount above 0.", 400, "amountOffUsd");
  }

  try {
    if (customCode) {
      const existing = await findStripeCode(customCode);
      if (existing) {
        const archived = existing.active ? "" : " (archived)";
        return error(
          `Code ${customCode} already exists${archived}.`,
          409,
          "customCode",
        );
      }
    }
    if (typeof amountOffUsd === "number") {
      const ids = await amountOffCoupons(Math.round(amountOffUsd * 100));
      if (ids.length !== 1) {
        const usd = `$${amountOffUsd}`;
        return error(
          ids.length
            ? `${ids.length} active coupons take ${usd} off (${ids.join(", ")}); send couponId.`
            : `No active coupon takes ${usd} off.`,
          400,
          "amountOffUsd",
        );
      }
      couponId = ids[0];
    }

    const minted = await mintStripeCode({
      name,
      email: str(body, "email"),
      customCode,
      maxUses: maxUses as number | null,
      purpose,
      notes: str(body, "notes"),
      couponId: couponId || undefined,
      issuedBy: access.name,
    });
    return json(summary(minted), minted.reused ? 200 : 201);
  } catch (err) {
    return failed(err);
  }
}

const summary = (m: MintResult) => ({
  code: m.code,
  id: m.id,
  active: m.active,
  couponId: m.couponId,
  max: m.max,
  test: m.test,
  ...(m.reused && { reused: true }),
});

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
