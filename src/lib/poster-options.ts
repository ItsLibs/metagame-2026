import {
  isAllowedDestination,
  validateSlug,
  type TrackingLink,
} from "@/lib/tracking-links";

export const POSTER_ORIGIN = "https://metagame.games";
export const GENERIC_AREA = "generic";
export const GENERIC_PLACEMENT = "Generic poster";
export type PosterOption = { value: string; label: string; available: boolean };
export type PosterChoice = PosterOption & { slug: string | null };

const placeholders = new Set([
  "bay area — venue tbd",
  "bay area — individual stores tbd",
  "east bay — venue tbd",
]);
const key = (value: string) => value.trim().toLowerCase();

export function posterAreas(values: unknown[]): string[] {
  const areas = new Map<string, string>();
  for (const value of values) {
    if (typeof value !== "string") continue;
    const label = value.trim();
    if (label && !placeholders.has(key(label))) areas.set(key(label), label);
  }
  return [...areas.values()].sort((a, b) => a.localeCompare(b, "en"));
}

export function isPosterLink(link: TrackingLink, placement: string): boolean {
  if (
    !link.active ||
    link.template ||
    validateSlug(link.slug) ||
    link.source !== "poster" ||
    link.medium !== "print" ||
    link.campaign !== "metagame-2026" ||
    key(link.placement) !== key(placement) ||
    !isAllowedDestination(link.destination, POSTER_ORIGIN)
  )
    return false;
  const destination = new URL(link.destination);
  // Poster attribution must not inherit person/venue-specific query parameters.
  return (
    destination.pathname === "/" &&
    !destination.search &&
    ["", "#tickets"].includes(destination.hash)
  );
}

export function posterChoices(
  areas: string[],
  links: TrackingLink[],
): PosterChoice[] {
  return [
    {
      value: GENERIC_AREA,
      label: "Generic poster",
      placement: GENERIC_PLACEMENT,
    },
    ...areas.map((label) => ({
      value: `area:${label}`,
      label,
      placement: label,
    })),
  ].map(({ value, label, placement }) => {
    const candidates = links.filter((link) => isPosterLink(link, placement));
    const link = candidates.length === 1 ? candidates[0] : null;
    // Duplicate slugs make /go's first-record lookup ambiguous, even if only
    // one of those records matches this area.
    const unique =
      link &&
      links.filter((other) => key(other.slug) === key(link.slug)).length === 1;
    return {
      value,
      label,
      available: !!unique,
      slug: unique ? link.slug : null,
    };
  });
}
