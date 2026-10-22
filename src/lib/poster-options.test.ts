import { describe, expect, it } from "vitest";
import { isPosterLink, posterAreas, posterChoices } from "./poster-options";
import type { TrackingLink } from "./tracking-links";

export const berkeley: TrackingLink = {
  id: "recW2dLVFSsIrLxaN",
  slug: "berkeley",
  destination: "https://metagame.games/",
  source: "poster",
  medium: "print",
  campaign: "metagame-2026",
  placement: "Berkeley",
  internalName: "",
  createdBy: "",
  createdAt: "",
  active: true,
  template: false,
};

describe("public poster options", () => {
  it("deduplicates area labels and excludes blanks and the approved placeholders", () => {
    expect(
      posterAreas([
        " Berkeley ",
        "Berkeley",
        null,
        "",
        "Oakland",
        "Bay Area — venue TBD",
        "Bay Area — individual stores TBD",
        "East Bay — venue TBD",
      ]),
    ).toEqual(["Berkeley", "Oakland"]);
  });
  it("does not infer slugs or reuse venue/person placements", () => {
    const choices = posterChoices(
      ["Berkeley", "Oakland"],
      [berkeley, { ...berkeley, slug: "mox-post", placement: "Mox" }],
    );
    expect(choices).toEqual([
      {
        value: "generic",
        label: "Generic poster",
        available: false,
        slug: null,
      },
      {
        value: "area:Berkeley",
        label: "Berkeley",
        available: true,
        slug: "berkeley",
      },
      { value: "area:Oakland", label: "Oakland", available: false, slug: null },
    ]);
  });
  it("rejects duplicate placements and duplicate slugs", () => {
    for (const duplicate of [
      { ...berkeley, slug: "berkeley-2" },
      { ...berkeley, active: false },
    ]) {
      expect(
        posterChoices(["Berkeley"], [berkeley, duplicate])[1].available,
      ).toBe(false);
    }
  });
  it.each([
    { active: false },
    { template: true },
    { source: "discord" },
    { medium: "qr" },
    { campaign: "other" },
    { placement: "Mox" },
    { slug: "bad/slug" },
    { destination: "https://evil.example/" },
    { destination: "https://metagame.games/go/mox-post" },
    { destination: "https://metagame.games/?person=someone" },
  ])("rejects unsafe/incomplete mapping %j", (change) => {
    expect(isPosterLink({ ...berkeley, ...change }, "Berkeley")).toBe(false);
  });
  it("allows a reusable generic link only when configured", () => {
    expect(
      posterChoices(
        [],
        [{ ...berkeley, slug: "fixture-generic", placement: "Generic poster" }],
      )[0].available,
    ).toBe(true);
  });
});
