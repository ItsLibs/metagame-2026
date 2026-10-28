import { beforeEach, expect, it, vi } from "vitest";
// Better Auth and the permission store are faked; the gate in access.ts and
// admin-auth.ts is real, so these run the x-api-key path end to end.
const auth = vi.hoisted(() => ({
  headers: new Headers(),
  /** key → the permissions its account holds */
  keys: {} as Record<string, string[]>,
}));
vi.mock("next/headers", () => ({ headers: async () => auth.headers }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  API_KEY_HEADER: "x-api-key",
  accountsConfigured: () => true,
  accountLabel: (user: { name: string }) => user.name,
  getAuth: () => ({
    api: {
      getSession: async ({ headers }: { headers: Headers }) => {
        const key = headers.get("x-api-key") ?? "";
        return key in auth.keys
          ? { user: { id: key, name: "Libi", role: "user" } }
          : null;
      },
      verifyApiKey: async ({ body }: { body: { key: string } }) => ({
        valid: body.key in auth.keys,
      }),
    },
  }),
}));
vi.mock("@/lib/permission-store", () => ({
  userAccess: async (userId: string) => ({
    admin: false,
    roles: [],
    grants: auth.keys[userId],
    roleIds: [],
  }),
}));
vi.mock("@/lib/tracking-links", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/tracking-links")>()),
  loadLinkOptions: vi.fn(),
  findTrackingLink: vi.fn(),
  createTrackingLink: vi.fn(),
  listTrackingLinks: vi.fn(),
}));
import { GET, POST } from "./route";
import { revalidatePath } from "next/cache";
import {
  createTrackingLink,
  findTrackingLink,
  listTrackingLinks,
  loadLinkOptions,
  type NewTrackingLink,
  type TrackingLink,
} from "@/lib/tracking-links";

const KEY = "mg_links";
const flyer = {
  destination: "https://metagame.games/",
  slug: "Victory Point Cafe",
  source: "poster",
  medium: "PRINT",
  campaign: "metagame-2026",
  placement: "Victory Point Cafe",
  internalName: "Flyer: Victory Point Cafe",
};
const send = (body: unknown, key: string | null = KEY) => {
  auth.headers = new Headers(key ? { "x-api-key": key } : {});
  return POST(
    new Request("https://metagame.games/api/admin/links", {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(body),
    }),
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  auth.keys = { [KEY]: ["links.manage"], mg_promo: ["promo.manage"] };
  vi.mocked(loadLinkOptions).mockResolvedValue({
    source: ["Poster", "Discord"],
    medium: ["print"],
    campaign: ["metagame-2026"],
    placement: [],
  });
  vi.mocked(findTrackingLink).mockResolvedValue(null);
  vi.mocked(createTrackingLink).mockImplementation(
    async (link: NewTrackingLink) => ({
      ...link,
      id: "rec1",
      createdAt: "2026-10-28T00:00:00.000Z",
      active: true,
      template: false,
    }),
  );
});

it("needs a key whose account holds links.manage", async () => {
  const none = await send(flyer, null);
  expect(none.status).toBe(401);
  expect(await none.json()).toEqual({ error: "Send an API key in x-api-key." });
  expect((await send(flyer, "mg_revoked")).status).toBe(401);
  const other = await send(flyer, "mg_promo");
  expect(other.status).toBe(403);
  expect((await other.json()).error).toContain("links.manage");
  auth.headers = new Headers({ "x-api-key": "mg_promo" });
  expect(
    (await GET(new Request("https://metagame.games/api/admin/links"))).status,
  ).toBe(403);
  expect(createTrackingLink).not.toHaveBeenCalled();
});

it("creates the link with Airtable's spelling under the key owner's name", async () => {
  const response = await send(flyer);
  expect(response.status).toBe(201);
  expect(await response.json()).toMatchObject({
    link: { slug: "victory-point-cafe" },
    shortUrl: "https://metagame.games/go/victory-point-cafe",
  });
  expect(createTrackingLink).toHaveBeenCalledWith({
    slug: "victory-point-cafe",
    destination: "https://metagame.games/",
    source: "Poster",
    medium: "print",
    campaign: "metagame-2026",
    placement: "Victory Point Cafe",
    internalName: "Flyer: Victory Point Cafe",
    createdBy: "Libi",
  });
  expect(revalidatePath).toHaveBeenCalledWith("/backstage/links");
});

it("409s a short name that's taken", async () => {
  vi.mocked(findTrackingLink).mockResolvedValue({
    slug: "victory-point-cafe",
  } as TrackingLink);
  const response = await send(flyer);
  expect(response.status).toBe(409);
  expect(await response.json()).toEqual({
    error: "That short name is already taken.",
    field: "slug",
  });
  expect(createTrackingLink).not.toHaveBeenCalled();
});

it.each([
  ["an off-site destination", { destination: "https://evil.example/" }],
  ["a plain-http destination", { destination: "http://metagame.games/" }],
  ["a loop back into /go/", { destination: "https://metagame.games/go/x" }],
  ["an empty source", { source: "" }],
  ["a medium over 100 characters", { medium: "x".repeat(101) }],
  ["an unknown campaign", { campaign: "metagame-2027" }],
  ["an empty slug", { slug: "" }],
  ["a too-short slug", { slug: "vp" }],
  ["a slug with an accent", { slug: "café" }],
])("refuses %s", async (_, change) => {
  const field = Object.keys(change)[0];
  const body = { ...flyer, ...change };
  const response = await send(body);
  expect(response.status).toBe(400);
  expect((await response.json()).field).toBe(field);
  expect(createTrackingLink).not.toHaveBeenCalled();
});

it("reports an Airtable failure as a 502", async () => {
  vi.mocked(loadLinkOptions).mockRejectedValue(
    new Error("Airtable is not configured"),
  );
  const response = await send(flyer);
  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({
    error: "Airtable is not configured",
  });
});

it("lists links with their short URLs", async () => {
  vi.mocked(listTrackingLinks).mockResolvedValue([
    { slug: "victory-point-cafe", active: true } as TrackingLink,
  ]);
  auth.headers = new Headers({ "x-api-key": KEY });
  const response = await GET(
    new Request("https://metagame.games/api/admin/links"),
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    links: [
      {
        slug: "victory-point-cafe",
        active: true,
        shortUrl: "https://metagame.games/go/victory-point-cafe",
      },
    ],
  });
});
