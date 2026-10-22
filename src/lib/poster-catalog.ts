import "server-only";
import { env } from "@/env";
import { airtableConfig } from "@/lib/airtable-config";
import { listTrackingLinks } from "@/lib/tracking-links";
import {
  posterAreas,
  posterChoices,
  type PosterChoice,
} from "@/lib/poster-options";

async function readCatalog(): Promise<PosterChoice[]> {
  if (!env.AIRTABLE_API_KEY) throw new Error("Poster catalog unavailable");
  const values: unknown[] = [];
  let offset: string | undefined;
  do {
    const params = new URLSearchParams({
      "fields[]": "Area / City",
      pageSize: "100",
    });
    if (offset) params.set("offset", offset);
    const response = await fetch(
      `https://api.airtable.com/v0/${airtableConfig.baseId}/tblwmzJBpXq6GYsdY?${params}`,
      {
        headers: { Authorization: `Bearer ${env.AIRTABLE_API_KEY}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) throw new Error("Poster catalog unavailable");
    const page = (await response.json()) as {
      records: { fields: Record<string, unknown> }[];
      offset?: string;
    };
    values.push(...page.records.map((record) => record.fields["Area / City"]));
    offset = page.offset;
  } while (offset);
  return posterChoices(posterAreas(values), await listTrackingLinks());
}

let cached: { expires: number; promise: Promise<PosterChoice[]> } | undefined;
export function loadPosterCatalog(): Promise<PosterChoice[]> {
  if (!cached || cached.expires <= Date.now()) {
    const promise = readCatalog().catch((error) => {
      cached = undefined;
      throw error;
    });
    cached = { expires: Date.now() + 60_000, promise };
  }
  return cached.promise;
}
