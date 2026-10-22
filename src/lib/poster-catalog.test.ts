import { afterEach, expect, it, vi } from "vitest";
import { berkeley } from "./poster-options.test";
vi.mock("@/lib/tracking-links", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/tracking-links")>()),
  listTrackingLinks: vi.fn(),
}));
import { listTrackingLinks } from "@/lib/tracking-links";
afterEach(() => vi.resetModules());
it("builds the catalog from tracking links once and shares concurrent reads", async () => {
  vi.mocked(listTrackingLinks).mockResolvedValue([berkeley]);
  const { loadPosterCatalog } = await import("./poster-catalog");
  const [catalog, concurrent] = await Promise.all([
    loadPosterCatalog(),
    loadPosterCatalog(),
  ]);
  expect(catalog).toEqual(concurrent);
  expect(catalog.map((item) => item.label)).toEqual(["Berkeley"]);
  expect(listTrackingLinks).toHaveBeenCalledTimes(1);
});
it("fails closed and retries after Airtable fails", async () => {
  vi.mocked(listTrackingLinks)
    .mockRejectedValueOnce(new Error("private error"))
    .mockResolvedValueOnce([]);
  const { loadPosterCatalog } = await import("./poster-catalog");
  await expect(loadPosterCatalog()).rejects.toThrow(
    "Poster catalog unavailable",
  );
  await expect(loadPosterCatalog()).resolves.toEqual([]);
});
