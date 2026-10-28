import { revalidatePath } from "next/cache";
import { authorize, error, json, readBody } from "@/lib/schedule-api";
import type { Raw } from "@/lib/schedule-input";
import { siteOrigin } from "@/lib/site-origin";
import {
  createTrackingLink,
  defaultCampaign,
  findTrackingLink,
  isAllowedDestination,
  listTrackingLinks,
  loadLinkOptions,
  normalizeSlug,
  OPEN_SELECTS,
  shortUrl,
  snapToOption,
  UTM_SELECT_FIELDS,
  UTM_VALUE_MAX,
  validateSlug,
  type UtmSelectField,
} from "@/lib/tracking-links";

export const dynamic = "force-dynamic";

const str = (body: Raw, key: string) => {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
};

/** Every short link, newest first, with its /go/ URL. */
export async function GET(request: Request) {
  const access = await authorize("links.manage");
  if (access instanceof Response) return access;
  const origin = siteOrigin(request);
  try {
    const links = await listTrackingLinks();
    return json({
      links: links.map((link) => ({
        ...link,
        shortUrl: shortUrl(origin, link.slug),
      })),
    });
  } catch (err) {
    return failed(err);
  }
}

/**
 * Creates one link, checked as the /backstage/links form checks it:
 * `{destination, slug, source, medium, placement, campaign?, internalName?}`.
 * UTM values snap to Airtable's spelling; campaign must already be a choice
 * and defaults to the form's. A taken slug's 409 carries the `existing` link.
 */
export async function POST(request: Request) {
  const access = await authorize("links.manage");
  if (access instanceof Response) return access;
  const body = await readBody(request);
  if (body instanceof Response) return body;

  const origin = siteOrigin(request);
  const destination = str(body, "destination");
  if (!isAllowedDestination(destination, origin)) {
    return error(
      `Destination must be an https link on ${new URL(origin).host}.`,
      400,
      "destination",
    );
  }

  try {
    const options = await loadLinkOptions();
    const utm = {} as Record<UtmSelectField, string>;
    for (const field of UTM_SELECT_FIELDS) {
      const given = str(body, field);
      const value =
        field === "campaign" && !given
          ? defaultCampaign(options)
          : snapToOption(given, options[field]);
      if (!value) return error("Required.", 400, field);
      if (value.length > UTM_VALUE_MAX)
        return error(`At most ${UTM_VALUE_MAX} characters.`, 400, field);
      if (!OPEN_SELECTS.has(field) && !options[field].includes(value))
        return error(`Pick a ${field} from the list.`, 400, field);
      utm[field] = value;
    }

    const slug = normalizeSlug(str(body, "slug"));
    if (!slug) return error("Required.", 400, "slug");
    const slugProblem = validateSlug(slug);
    if (slugProblem) return error(slugProblem, 400, "slug");
    const existing = await findTrackingLink(slug);
    if (existing) {
      return json(
        {
          error: "That short name is already taken.",
          field: "slug",
          existing: {
            destination: existing.destination,
            shortUrl: shortUrl(origin, existing.slug),
          },
        },
        409,
      );
    }

    const link = await createTrackingLink({
      slug,
      destination,
      ...utm,
      internalName: str(body, "internalName").slice(0, 120),
      createdBy: access.name,
    });
    revalidatePath("/backstage/links");
    return json(
      {
        slug: link.slug,
        shortUrl: shortUrl(origin, link.slug),
        destination: link.destination,
      },
      201,
    );
  } catch (err) {
    return failed(err);
  }
}

function failed(err: unknown): Response {
  console.error("[links api] Airtable call failed:", err);
  return error(err instanceof Error ? err.message : String(err), 502);
}
