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
const stripe = vi.hoisted(() => ({
  promotionCodes: { create: vi.fn(), list: vi.fn(), update: vi.fn() },
}));
vi.mock("@/lib/stripe-promo", () => ({
  getPromoStripe: vi.fn(() => stripe),
  promoMode: () => "test",
}));
import { GET, POST } from "./route";
import { getPromoStripe } from "@/lib/stripe-promo";

const KEY = "mg_promo";
const flyer = {
  name: "Victory Point Cafe",
  purpose: "Flyer",
  customCode: "VICTORYPOINTCAFE",
  unlimited: true,
  couponId: "flyer100",
};
const promo = (overrides = {}) => ({
  id: "promo_1",
  code: "VICTORYPOINTCAFE",
  max_redemptions: null,
  metadata: { name: "Victory Point Cafe", source: "comp-tool" },
  times_redeemed: 0,
  active: true,
  created: 1,
  ...overrides,
});
const send = (body: unknown, key: string | null = KEY) => {
  auth.headers = new Headers(key ? { "x-api-key": key } : {});
  return POST(
    new Request("https://metagame.games/api/admin/promo", {
      method: "POST",
      headers: auth.headers,
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  auth.keys = { [KEY]: ["promo.manage"], mg_links: ["links.manage"] };
  stripe.promotionCodes.create.mockImplementation(async (params) =>
    promo({ code: params.code, metadata: params.metadata }),
  );
});

it("needs a key whose account holds promo.manage", async () => {
  const none = await send(flyer, null);
  expect(none.status).toBe(401);
  expect(await none.json()).toEqual({ error: "Send an API key in x-api-key." });
  expect((await send(flyer, "mg_revoked")).status).toBe(401);
  const other = await send(flyer, "mg_links");
  expect(other.status).toBe(403);
  expect((await other.json()).error).toContain("promo.manage");
  auth.headers = new Headers();
  expect((await GET()).status).toBe(401);
  expect(stripe.promotionCodes.create).not.toHaveBeenCalled();
});

it("mints the custom code under the key owner's name", async () => {
  const response = await send(flyer);
  expect(response.status).toBe(201);
  expect((await response.json()).minted).toMatchObject({
    code: "VICTORYPOINTCAFE",
    name: "Victory Point Cafe",
    reused: false,
    max: null,
    test: true,
  });
  const params = stripe.promotionCodes.create.mock.calls[0][0];
  expect(params).toMatchObject({
    code: "VICTORYPOINTCAFE",
    promotion: { type: "coupon", coupon: "flyer100" },
    metadata: { purpose: "Flyer", issued_by: "Libi" },
  });
  expect(params).not.toHaveProperty("max_redemptions");
});

it("caps uses at 1 unless told otherwise", async () => {
  await send({ ...flyer, unlimited: undefined });
  expect(stripe.promotionCodes.create.mock.calls[0][0].max_redemptions).toBe(1);
  await send({ ...flyer, unlimited: false, uses: 25 });
  expect(stripe.promotionCodes.create.mock.calls[1][0].max_redemptions).toBe(
    25,
  );
});

it.each([
  ["a blank name", { name: " " }],
  ["a missing purpose", { purpose: undefined }],
  ["a custom code with a space", { customCode: "VICTORY POINT" }],
  ["zero uses", { uses: 0, unlimited: false }],
  ["uses that aren't a number", { uses: "many", unlimited: false }],
])("refuses %s before Stripe", async (_, change) => {
  const field = Object.keys(change)[0];
  const body = { ...flyer, ...change };
  const response = await send(body);
  expect(response.status).toBe(400);
  expect((await response.json()).field).toBe(field);
  expect(stripe.promotionCodes.create).not.toHaveBeenCalled();
});

it("refuses a body that isn't a JSON object", async () => {
  expect((await send("name=Victory")).status).toBe(400);
  expect((await send([flyer])).status).toBe(400);
});

it("409s a code that already belongs to someone else, reuses one that doesn't", async () => {
  stripe.promotionCodes.create.mockRejectedValue(
    Object.assign(new Error("already exists"), {
      code: "resource_already_exists",
    }),
  );
  stripe.promotionCodes.list.mockResolvedValue({
    data: [promo({ metadata: { name: "Someone Else", source: "comp-tool" } })],
  });
  const taken = await send(flyer);
  expect(taken.status).toBe(409);
  expect(await taken.json()).toMatchObject({ field: "customCode" });

  stripe.promotionCodes.list.mockResolvedValue({
    data: [
      promo({
        metadata: {
          name: "Victory Point Cafe",
          source: "comp-tool",
          purpose: "Flyer",
        },
      }),
    ],
  });
  const again = await send(flyer);
  expect(again.status).toBe(200);
  expect((await again.json()).minted.reused).toBe(true);
});

it("pins an unknown coupon on couponId and says when Stripe is off", async () => {
  stripe.promotionCodes.create.mockRejectedValue(
    Object.assign(new Error("No such coupon: 'nope'"), {
      type: "StripeInvalidRequestError",
      param: "promotion[coupon]",
    }),
  );
  const unknown = await send({ ...flyer, couponId: "nope" });
  expect(unknown.status).toBe(400);
  expect(await unknown.json()).toEqual({
    error: "No such coupon: 'nope'",
    field: "couponId",
  });

  vi.mocked(getPromoStripe).mockReturnValueOnce(null);
  expect((await send(flyer)).status).toBe(503);
});

it("lists only the codes the promo tool minted", async () => {
  stripe.promotionCodes.list.mockReturnValue({
    autoPagingToArray: async () => [
      promo(),
      promo({ id: "promo_2", code: "OTHER", metadata: {} }),
    ],
  });
  auth.headers = new Headers({ "x-api-key": KEY });
  const response = await GET();
  expect(response.status).toBe(200);
  const { codes } = await response.json();
  expect(codes.map((c: { code: string }) => c.code)).toEqual([
    "VICTORYPOINTCAFE",
  ]);
});
