import assert from "node:assert/strict";
import { once } from "node:events";
import { randomBytes } from "node:crypto";
import { format } from "node:util";
import { after, before, test, mock } from "node:test";
import jwt from "jsonwebtoken";
import { getSharedFriend } from "../mock-permissions.js";

const buyerPhone = "447700900001";
const otherBuyerPhone = "447700900002";
const nativeFetch = globalThis.fetch;
const shopifyRequests = [];
const logs = [];
let server;
let baseUrl;

before(async () => {
  // Test-process values only: no credentials or OTP flow needed, no Shopify calls.
  process.env.JWT_SECRET = randomBytes(32).toString("hex");
  process.env.SHOPIFY_ACCESS_TOKEN = "synthetic-test-token";
  process.env.NODE_ENV = "test";
  mock.method(console, "log", (...args) => logs.push(format(...args)));
  mock.method(console, "error", (...args) => logs.push(format(...args)));
  mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://dustid-test.myshopify.com/admin/api/2026-07/graphql.json");
    shopifyRequests.push(JSON.parse(options.body));
    return Response.json({
      data: {
        draftOrderCreate: {
          draftOrder: { id: "test-order", invoiceUrl: "https://example.com/test-invoice" },
          userErrors: [],
        },
      },
    });
  });

  const { default: app } = await import("../app.js");
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server?.listening) {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  }
  mock.restoreAll();
});

async function request(path, { phone = buyerPhone, body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (phone !== null || token !== undefined) {
    headers.Authorization = `Bearer ${token ?? jwt.sign({ phoneNumber: phone }, process.env.JWT_SECRET)}`;
  }
  const response = await nativeFetch(`${baseUrl}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, body: await response.json() };
}

function draftBody(id) {
  return {
    shop: "dustid-test.myshopify.com",
    items: [{ variant_id: 123, quantity: 1 }],
    contact: { id },
  };
}

test("helper requires an explicit buyer/recipient grant and friend membership", () => {
  const friend = { id: "recipient", shared: true };
  const buyer = { id: "buyer", friends: [friend] };
  const grant = { buyerId: buyer.id, recipientId: friend.id, state: "shared" };
  assert.equal(getSharedFriend(buyer, friend.id, [grant]), friend);
  for (const state of ["revoked", "not_shared", undefined, "unknown"]) {
    assert.equal(getSharedFriend(buyer, friend.id, [{ ...grant, state }]), undefined);
  }
  assert.equal(getSharedFriend(buyer, friend.id, []), undefined);
  assert.equal(getSharedFriend(buyer, friend.id, [{ ...grant, buyerId: "other" }]), undefined);
  assert.equal(getSharedFriend(buyer, "other", [grant]), undefined);
  assert.equal(getSharedFriend({ ...buyer, friends: [] }, friend.id, [grant]), undefined);
  assert.equal(getSharedFriend(undefined, friend.id), undefined);
  assert.equal(getSharedFriend(buyer, { id: friend.id }, [grant]), undefined);
});

test("friend lists include only this buyer's shared recipients and never addresses", async () => {
  for (const [phone, expected] of [[buyerPhone, "uk-friend001"], [otherBuyerPhone, "uk-friend002"]]) {
    const result = await request("/friends", { phone });
    assert.equal(result.status, 200);
    assert.deepEqual(result.body.friends.map((friend) => friend.id), [expected]);
    assert.deepEqual(Object.keys(result.body.friends[0]).sort(), ["email", "id", "name", "phone"]);
  }
});

test("shared recipient details remain accessible", async () => {
  const result = await request("/friends/uk-friend001");
  assert.equal(result.status, 200);
  assert.equal(result.body.address.country_code, "GB");
  assert.equal(result.body.address.zip, "SW1A 1AA");
});

for (const id of ["uk-friend002", "uk-friend003", "friend201", "unknown"]) {
  test(`recipient details deny revoked, unshared or unrelated ID: ${id}`, async () => {
    const result = await request(`/friends/${id}`);
    assert.equal(result.status, 403);
    assert.deepEqual(result.body, { message: "Recipient address is not shared with you." });
  });
}

test("sharing with one buyer cannot authorize another buyer", async () => {
  const result = await request("/friends/uk-friend001", { phone: otherBuyerPhone });
  assert.equal(result.status, 403);
  const shared = await request("/friends/uk-friend002", { phone: otherBuyerPhone });
  assert.equal(shared.status, 200);
});

test("missing permission records deny details and draft orders", async () => {
  const phone = otherBuyerPhone;
  const count = shopifyRequests.length;
  assert.equal((await request("/friends/uk-friend003", { phone })).status, 403);
  assert.equal((await request("/api/draft-order", { phone, body: draftBody("uk-friend003") })).status, 403);
  assert.equal(shopifyRequests.length, count);
});

test("search uses the token identity and ignores a spoofed legacy phone number", async () => {
  for (const body of [{}, { phoneNumber: otherBuyerPhone }, { phoneNumber: "254723456789" }]) {
    const result = await request("/search", { body });
    assert.equal(result.status, 200);
    assert.deepEqual(result.body.results, [
      { id: "uk-friend001", name: "Robin Example", email: "robin@example.com" },
    ]);
  }
  const filtered = await request("/search", { body: { query: " ROBIN " } });
  assert.equal(filtered.body.results.length, 1);
  for (const query of ["Taylor", "Morgan"]) {
    const hidden = await request("/search", { body: { query } });
    assert.equal(hidden.status, 200);
    assert.deepEqual(hidden.body.results, []);
  }
});

test("profile cannot bypass permissions or expose another buyer's data", async () => {
  const own = await request("/profile", { body: { phoneNumber: buyerPhone } });
  assert.equal(own.status, 200);
  assert.equal(own.body.contact.phoneNumber, buyerPhone);
  assert.equal(own.body.contact.email, "alex@example.com");
  assert.equal(own.body.contact.billing_address.first_name, "Alex");
  assert.equal(own.body.contact.billing_address.phone, "442079460011");
  assert.deepEqual(own.body.contact.friends.map((friend) => friend.id), ["uk-friend001"]);
  assert.equal("address" in own.body.contact.friends[0], false);
  const other = await request("/profile", { body: { phoneNumber: otherBuyerPhone } });
  assert.equal(other.status, 403);
  assert.equal("contact" in other.body, false);
});

test("draft orders use the authenticated buyer's phone instead of email, ignore forged fields and preserve success format", async () => {
  const forged = { address1: "CLIENT-OVERRIDE", first_name: "CLIENT-OVERRIDE" };
  const body = draftBody("uk-friend001");
  Object.assign(body.contact, {
    name: "CLIENT-OVERRIDE", email: "CLIENT-OVERRIDE@example.com", address: forged, delivery_address: forged,
    shipping_address: forged, shared: true, buyerId: "uk-buyer002", checkoutPhoneNumber: "CLIENT-OVERRIDE",
  });
  Object.assign(body, { email: "CLIENT-OVERRIDE@example.com", billing_address: forged, billingAddress: forged, phoneNumber: "254712345678", checkoutPhoneNumber: "CLIENT-OVERRIDE", buyerId: "contact001" });
  const result = await request("/api/draft-order", { body });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, {
    invoice_url: "https://example.com/test-invoice", message: "Draft order created successfully.",
  });
  const input = shopifyRequests.at(-1).variables.input;
  assert.equal(Object.hasOwn(input, "email"), false);
  assert.equal(input.shippingAddress.address1, "1 Fictional Test Close");
  assert.equal(input.shippingAddress.firstName, "Robin");
  assert.equal(input.shippingAddress.countryCode, "GB");
  assert.equal(input.billingAddress.address1, "10 Fictional Test Close");
  assert.equal(input.billingAddress.firstName, "Alex");
  assert.equal(input.billingAddress.lastName, "Sample");
  assert.equal(input.phone, "+442079460001");
  assert.notEqual(input.phone, `+${buyerPhone}`);
  assert.equal(input.shippingAddress.phone, "+442079460101");
  assert.equal(input.billingAddress.phone, "+442079460011");
  assert.notEqual(input.phone, input.billingAddress.phone);
  assert.notEqual(input.phone, input.shippingAddress.phone);
  assert.equal(input.shippingAddress.zip, "SW1A 1AA");
  assert.equal(input.billingAddress.zip, "SW1A 1AA");
  assert.equal(input.shippingAddress.province, "England");
  assert.equal(input.billingAddress.province, "England");
  assert.equal(JSON.stringify(input).includes("CLIENT-OVERRIDE"), false);
});

for (const id of ["uk-friend002", "uk-friend003", "friend201", "unknown"]) {
  test(`draft order cannot bypass permissions with client address/sharing data: ${id}`, async () => {
    const count = shopifyRequests.length;
    const body = draftBody(id);
    Object.assign(body.contact, {
      address: { address1: "CLIENT-OVERRIDE" }, shared: true, state: "shared", buyerId: "uk-buyer002",
    });
    const result = await request("/api/draft-order", { body });
    assert.equal(result.status, 403);
    assert.equal(shopifyRequests.length, count);
  });
}

test("draft order grants are buyer-specific and missing recipient IDs are rejected", async () => {
  const count = shopifyRequests.length;
  const denied = await request("/api/draft-order", {
    phone: otherBuyerPhone, body: draftBody("uk-friend001"),
  });
  assert.equal(denied.status, 403);
  const body = draftBody(undefined);
  body.contact.address = { address1: "CLIENT-OVERRIDE" };
  const missing = await request("/api/draft-order", { body });
  assert.equal(missing.status, 400);
  assert.equal(shopifyRequests.length, count);
  const allowed = await request("/api/draft-order", {
    phone: otherBuyerPhone, body: draftBody("uk-friend002"),
  });
  assert.equal(allowed.status, 200);
  const input = shopifyRequests.at(-1).variables.input;
  assert.equal(Object.hasOwn(input, "email"), false);
  assert.equal(input.shippingAddress.firstName, "Taylor");
  assert.equal(input.phone, "+441134960002");
  assert.notEqual(input.phone, `+${otherBuyerPhone}`);
  assert.equal(input.shippingAddress.phone, "+441134960102");
  assert.equal(input.billingAddress.phone, "+441134960002");
  assert.equal(input.shippingAddress.zip, "LS1 1UR");
  assert.equal(input.billingAddress.zip, "LS1 1UR");
  assert.equal(input.shippingAddress.province, "England");
  assert.equal(input.billingAddress.province, "England");
});

test("spoofed UK buyer fields cannot replace a Kenyan buyer's Shopify contact details", async () => {
  const phone = "254712345678";
  const body = { ...draftBody("friend101"), buyerId: "uk-buyer001", phoneNumber: buyerPhone, email: "alex@example.com" };
  const result = await request("/api/draft-order", { phone, body });
  assert.equal(result.status, 200);
  assert.equal(shopifyRequests.at(-1).variables.input.phone, `+${phone}`);
  assert.equal(Object.hasOwn(shopifyRequests.at(-1).variables.input, "email"), false);
});

test("numeric recipient IDs are rejected before Shopify; stable string IDs still work", async () => {
  const count = shopifyRequests.length;
  const numeric = await request("/api/draft-order", { body: draftBody(1) });
  assert.equal(numeric.status, 400);
  assert.equal(shopifyRequests.length, count);
  const shared = await request("/api/draft-order", { body: draftBody("uk-friend001") });
  assert.equal(shared.status, 200);
  assert.equal(shopifyRequests.length, count + 1);
});

test("all existing Kenyan friend grants still allow details and draft orders", async () => {
  const fixtures = [
    ["254712345678", ["friend101", "friend102"]], ["254723456789", ["friend201"]],
    ["254734567890", []], ["254745678901", ["friend401"]],
    ["254756789012", ["friend501", "friend502", "friend503"]], ["254767890123", []],
    ["254778901234", ["friend701"]], ["254789012345", []],
    ["254790123456", ["friend901"]], ["254701234567", ["friend1001", "friend1002"]],
  ];
  for (const [phone, ids] of fixtures) {
    const list = await request("/friends", { phone });
    assert.equal(list.status, 200);
    assert.deepEqual(list.body.friends.map((friend) => friend.id), ids);
    for (const id of ids) {
      const details = await request(`/friends/${id}`, { phone });
      assert.equal(details.status, 200);
      assert.equal(details.body.address.country, "Kenya");
      const order = await request("/api/draft-order", { phone, body: draftBody(id) });
      assert.equal(order.status, 200);
      assert.equal(shopifyRequests.at(-1).variables.input.phone, `+${phone}`);
      assert.equal(Object.hasOwn(shopifyRequests.at(-1).variables.input, "email"), false);
    }
  }
});

test("protected routes reject missing and invalid tokens without creating orders", async () => {
  const count = shopifyRequests.length;
  for (const [path, body] of [
    ["/friends", undefined], ["/friends/uk-friend001", undefined], ["/search", {}],
    ["/profile", { phoneNumber: buyerPhone }], ["/api/draft-order", draftBody("uk-friend001")],
  ]) {
    assert.equal((await request(path, { phone: null, body })).status, 401);
    assert.equal((await request(path, { token: "invalid-test-token", body })).status, 403);
  }
  assert.equal(shopifyRequests.length, count);
});

test("an authenticated identity outside the mock data receives no access", async () => {
  const phone = "447700900099";
  assert.equal((await request("/friends", { phone })).status, 404);
  assert.equal((await request("/friends/uk-friend001", { phone })).status, 404);
  assert.equal((await request("/search", { phone, body: { phoneNumber: buyerPhone } })).status, 404);
  const count = shopifyRequests.length;
  assert.equal((await request("/api/draft-order", { phone, body: draftBody("uk-friend001") })).status, 403);
  assert.equal(shopifyRequests.length, count);
});

test("draft-order failures return only safe messages without logging sensitive details", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => Response.json({
    errors: [{ message: "CLIENT-OVERRIDE", extensions: { address: { address1: "CLIENT-OVERRIDE" } } }],
  }));
  assert.deepEqual(await request("/api/draft-order", { body: draftBody("uk-friend001") }), {
    status: 500, body: { message: "Failed to create draft order." },
  });
  fetchMock.mock.mockImplementation(async () => Response.json({
    data: { draftOrderCreate: { userErrors: [{ field: ["shippingAddress", "zip"], message: "CLIENT-OVERRIDE" }] } },
  }));
  assert.deepEqual(await request("/api/draft-order", { body: draftBody("uk-friend001") }), {
    status: 500, body: { message: "Failed to create draft order." },
  });
  assert.deepEqual(console.error.mock.calls.at(-1).arguments, [
    "[dustid] Shopify draft order was rejected.",
    { fields: [["shippingAddress", "zip"]], missingInvoiceUrl: true },
  ]);
  fetchMock.mock.mockImplementation(async () => Response.json({
    data: { draftOrderCreate: { userErrors: [], draftOrder: { id: "test-order" } } },
  }));
  assert.deepEqual(await request("/api/draft-order", { body: draftBody("uk-friend001") }), {
    status: 500, body: { message: "Failed to create draft order." },
  });
  assert.deepEqual(console.error.mock.calls.at(-1).arguments, [
    "[dustid] Shopify draft order was rejected.",
    { fields: [], missingInvoiceUrl: true },
  ]);
  fetchMock.mock.mockImplementation(async () => { throw new Error("CLIENT-OVERRIDE"); });
  assert.deepEqual(await request("/api/draft-order", { body: draftBody("uk-friend001") }), {
    status: 500, body: { message: "Internal server error." },
  });
});

test("console capture detects sensitive address data in nested object arguments", () => {
  const start = logs.length;
  try {
    for (const method of ["log", "error"]) {
      console[method]("Synthetic capture check:", {
        contact: { address: { address1: "NESTED-ADDRESS-MARKER" } },
      });
    }
    assert.equal(logs.length, start + 2);
    for (const output of logs.slice(start)) {
      assert.match(output, /NESTED-ADDRESS-MARKER/);
    }
  } finally {
    logs.splice(start);
  }
});

test("contact and draft-order requests do not log addresses, tokens or client payloads", async () => {
  await request("/pre-fill-checkout", { phone: null, body: { contact: {
    id: "uk-friend001", address: { address1: "CLIENT-OVERRIDE" },
  } } });
  const output = logs.join("\n");
  for (const sensitive of [
    "CLIENT-OVERRIDE", "Fictional Test Close", "Imaginary Demo Lane", "Pretend Sample Road",
    "Shipping Address", "Billing Address", "Generated OTP", process.env.JWT_SECRET,
    process.env.SHOPIFY_ACCESS_TOKEN,
    "alex@example.com", "casey@example.com",
  ]) {
    assert.equal(output.includes(sensitive), false);
  }
});
