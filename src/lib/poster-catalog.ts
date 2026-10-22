import "server-only";
import { listTrackingLinks } from "@/lib/tracking-links";
import { posterChoices, type PosterChoice } from "@/lib/poster-options";

let cached: { expires: number; promise: Promise<PosterChoice[]> } | undefined;
export function loadPosterCatalog(): Promise<PosterChoice[]> {
  if (!cached || cached.expires <= Date.now()) {
    const promise = listTrackingLinks()
      .then(posterChoices)
      .catch(() => {
        cached = undefined;
        throw new Error("Poster catalog unavailable");
      });
    cached = { expires: Date.now() + 60_000, promise };
  }
  return cached.promise;
}
