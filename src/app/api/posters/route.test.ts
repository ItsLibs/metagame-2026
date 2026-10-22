import { beforeEach, expect, it, vi } from "vitest";
vi.mock("@/lib/poster-catalog", () => ({ loadPosterCatalog: vi.fn() }));
vi.mock("@/lib/tracking-links", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/tracking-links")>()),
  findTrackingLink: vi.fn(),
}));
vi.mock("@/lib/poster-pdf", () => ({
  createPosterPdf: vi.fn().mockResolvedValue(new Uint8Array([37, 80, 68, 70])),
}));
import { GET } from "./route";
import { loadPosterCatalog } from "@/lib/poster-catalog";
import { findTrackingLink, type TrackingLink } from "@/lib/tracking-links";
import { createPosterPdf } from "@/lib/poster-pdf";
const link = {
  slug: "berkeley",
  destination: "https://metagame.games/",
  source: "poster",
  medium: "print",
  campaign: "metagame-2026",
  placement: "Berkeley",
  active: true,
  template: false,
} as TrackingLink;
const request = (query = "area=area:Berkeley&design=d20&size=letter") =>
  new Request(`http://localhost/api/posters?${query}`);
it("uses the existing admin workflow's Generic poster placement", async () => {
  vi.mocked(loadPosterCatalog).mockResolvedValue([
    {
      value: "generic",
      label: "Generic poster",
      available: true,
      slug: "poster",
    },
  ]);
  vi.mocked(findTrackingLink).mockResolvedValue({
    ...link,
    slug: "poster",
    placement: "Generic poster",
  });
  expect(
    (await GET(request("area=generic&design=chess&size=letter"))).status,
  ).toBe(200);
  expect(createPosterPdf).toHaveBeenCalledWith("chess", "letter", "poster");
});
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(loadPosterCatalog).mockResolvedValue([
    {
      value: "area:Berkeley",
      label: "Berkeley",
      available: true,
      slug: "berkeley",
    },
  ]);
  vi.mocked(findTrackingLink).mockResolvedValue(link);
});
it("downloads without login and never accepts an arbitrary URL or slug", async () => {
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("application/pdf");
  expect(createPosterPdf).toHaveBeenCalledWith("d20", "letter", "berkeley");
  expect(
    (
      await GET(
        request(
          "area=mox-post&design=d20&size=letter&url=https://evil.example",
        ),
      )
    ).status,
  ).toBe(409);
});
it("rejects missing, inactive, or changed mappings before PDF generation", async () => {
  for (const result of [
    null,
    { ...link, active: false },
    { ...link, placement: "Mox" },
  ]) {
    vi.mocked(findTrackingLink).mockResolvedValue(result);
    expect((await GET(request())).status).toBe(409);
  }
  expect(createPosterPdf).not.toHaveBeenCalled();
});
it("rejects invalid designs and hides provider errors", async () => {
  expect(
    (await GET(request("area=generic&design=../../secret&size=letter"))).status,
  ).toBe(400);
  vi.mocked(loadPosterCatalog).mockRejectedValue(
    new Error("private provider detail"),
  );
  const response = await GET(request());
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("private");
});
it("rejects chess 13x19 before reading Airtable or generating a PDF", async () => {
  expect(
    (await GET(request("area=area:Berkeley&design=chess&size=13x19"))).status,
  ).toBe(400);
  expect(loadPosterCatalog).not.toHaveBeenCalled();
  expect(findTrackingLink).not.toHaveBeenCalled();
  expect(createPosterPdf).not.toHaveBeenCalled();
});
it.each([
  ["d20", "letter"],
  ["d20", "13x19"],
  ["chess", "letter"],
])("allows %s %s", async (design, size) => {
  expect(
    (await GET(request(`area=area:Berkeley&design=${design}&size=${size}`)))
      .status,
  ).toBe(200);
  expect(createPosterPdf).toHaveBeenCalledWith(design, size, "berkeley");
});
