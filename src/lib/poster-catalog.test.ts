import { afterEach, expect, it, vi } from "vitest";
vi.mock("@/env", () => ({ env: { AIRTABLE_API_KEY: "fixture-only" } }));
vi.mock("@/lib/tracking-links", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/tracking-links")>()),
  listTrackingLinks: vi.fn().mockResolvedValue([]),
}));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});
it("reads only Area / City across every page and shares concurrent reads", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      Response.json({
        records: [
          { fields: { "Area / City": "Oakland", Private: "never returned" } },
        ],
        offset: "page2",
      }),
    )
    .mockResolvedValueOnce(
      Response.json({ records: [{ fields: { "Area / City": "Berkeley" } }] }),
    );
  vi.stubGlobal("fetch", fetcher);
  const { loadPosterCatalog } = await import("./poster-catalog");
  const [catalog, concurrent] = await Promise.all([
    loadPosterCatalog(),
    loadPosterCatalog(),
  ]);
  expect(catalog).toEqual(concurrent);
  expect(catalog.map((item) => item.label)).toEqual([
    "Generic poster",
    "Berkeley",
    "Oakland",
  ]);
  expect(fetcher).toHaveBeenCalledTimes(2);
  for (const [url, init] of fetcher.mock.calls) {
    expect(new URL(url).searchParams.getAll("fields[]")).toEqual([
      "Area / City",
    ]);
    expect(init.method).toBeUndefined();
  }
  expect(new URL(fetcher.mock.calls[1][0]).searchParams.get("offset")).toBe(
    "page2",
  );
  expect(JSON.stringify(catalog)).not.toContain("never returned");
});
it("fails closed and retries after Airtable fails", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(new Response("private error", { status: 403 }))
    .mockResolvedValueOnce(Response.json({ records: [] }));
  vi.stubGlobal("fetch", fetcher);
  const { loadPosterCatalog } = await import("./poster-catalog");
  await expect(loadPosterCatalog()).rejects.toThrow(
    "Poster catalog unavailable",
  );
  await expect(loadPosterCatalog()).resolves.toEqual([
    { value: "generic", label: "Generic poster", available: false, slug: null },
  ]);
});
