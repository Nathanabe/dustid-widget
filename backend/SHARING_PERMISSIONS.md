# Mock address permissions

Run `npm test` from `backend` (Node's built-in test runner). Tests sign temporary
test tokens, use a localhost server and mock all Shopify requests. They do not
exercise OTP or create real orders.

`mock-permissions.js` explicitly grants access for a buyer ID and recipient ID.
Only `shared` permits access, and the recipient must also be in that buyer's
friend list. `revoked`, `not_shared`, absent grants and unknown IDs deny access.
Existing Kenyan relationships have explicit shared grants. To simulate revocation,
change the existing pair's state; do not append a second grant for the same pair.
These are static in-memory fixtures, with no persistence or permission-editing API.

## Synthetic UK fixtures

Names, emails and street addresses are synthetic test data, not delivery destinations.
Login phone numbers remain in the existing digits-only international format (no `+`).
Address phones use the geographic drama ranges reserved by
[Ofcom](https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbers-for-drama);
these differ from the mobile login numbers. UK regions use `England`. Postcodes
use published public-institution examples for [London](https://www.royal.uk/contact),
[Leeds](https://www.leeds.gov.uk/licensing/alcohol-and-entertainment/premises-licence)
and [Manchester](https://www.manchester.gov.uk/contact-us/location), with fictional
street addresses.

Draft orders use the authenticated buyer's server-side `checkoutPhoneNumber`,
falling back to their login phone, normalized with a leading `+`. Shopify rejected
Alex's synthetic mobile login number at the top-level `phone` field in the live
checkout test on 2026-11-23. UK fixtures therefore use explicit geographic
checkout contact numbers. Login/OTP/JWT numbers stay unchanged, and
client-supplied contact-number overrides are ignored. No top-level
`email` is sent, so UK buyers follow Alice's phone-based checkout flow. UK profile
emails (`alex@example.com` and `casey@example.com`) remain in the mock data but are
not used for the checkout contact. Buyer names remain in the billing address;
shipping and billing address phones remain separate from the checkout contact.

| Buyer | Login phone | Checkout contact | Billing phone |
| --- | --- | --- | --- |
| Alex Sample | 447700900001 | +442079460001 | +442079460011 |
| Casey Demo | 447700900002 | +441134960002 | +441134960002 |

Robin's shipping phone is `+442079460101`. Alex's contact, billing and recipient
shipping phones are deliberately separate, as in Alice's fixture.

Checkout contact names come from the Shopify customer profile. When preparing a
new phone-only fixture, check that the Shopify profile has the buyer's name:
Shopify can initially use the shipping recipient's name. The Alex phone-only
profile in the current test store was corrected to Alex Sample with the owner's
approval. This profile setup is not automated by the mock backend.

### Validation and deployed version

On 2026-11-23, a live `draftOrderCreate` call for Alex to Robin returned HTTP 200
with an invoice URL. The store owner subsequently completed a new test checkout
and confirmed Alex's contact `+442079460001`, billing `+442079460011`, and Robin's
shipping `+442079460101` on the order confirmation page. The 25 backend tests also
passed inside the `linux/amd64` Docker image; those tests mock Shopify calls.

The Render service uses
`dustidlite/dustid-backend:separate-billing-20261123`, with image index digest
`sha256:9f333163cdd9c60085d6e2f83d426635462d350179c841c18b44ec8fd8d5f6f3`.
Existing drafts retain their old data; create a fresh draft to test fixture changes.

| Buyer phone | Recipient ID | State |
| --- | --- | --- |
| 447700900001 | uk-friend001 | shared |
| 447700900001 | uk-friend002 | revoked |
| 447700900001 | uk-friend003 | not_shared |
| 447700900002 | uk-friend001 | revoked |
| 447700900002 | uk-friend002 | shared |
| 447700900002 | uk-friend003 | no grant (denied) |

## API changes

- `/friends` and `/search` include only shared recipients, without addresses.
- `/friends/:friendId` returns the address only for the authenticated buyer's
  shared recipient; denied and unknown recipient IDs receive the same 403 response.
- `/search` identifies the buyer from the token. The legacy body `phoneNumber`
  is optional and ignored, preserving existing callers.
- `/api/draft-order` requires `contact.id`, checks sharing before resolving any
  address or calling Shopify, and ignores other client contact and billing address
  fields, including client email. Shipping, billing and buyer contact phone come
  from server fixtures. Successful responses
  retain `invoice_url` and `message`.
- `/profile` now requires authentication and the buyer's own phone number; nested
  friends are shared summaries without addresses. This closes the existing
  unauthenticated route around the recipient permission checks. The buyer still
  receives their own billing address.

Contact/address payload logging was removed from draft orders and the echo-only
`/pre-fill-checkout` route. Draft-order error logs no longer dump upstream data or
exception objects. No new OTP, token or address logging was added.

## Limitations and coordination with Nathan

- When replacing fixtures with the Laravel API, resolve the authenticated buyer's
  email and billing address separately from the authorized recipient's shipping
  address. The API must supply a usable buyer email or phone for Contact prefill;
  adding email to the mock does not connect Laravel.
- OTP authentication and its middleware are unchanged. `/validate-otp` currently
  skips comparing the submitted OTP with the stored code. `/verify` logs generated
  OTPs, including in production. Anyone able to obtain a token for another mock
  buyer can act as that buyer; these permission checks do not establish identity
  securely. Real OTP validation/delivery and removal of OTP logging need separate work.
- The separate Shopify Draft Order handler remains unchanged and still trusts
  client-supplied addresses. Nathan needs to apply buyer/recipient authorization
  and authoritative address resolution there, rechecking permission when creating
  the order. This change does **not** provide complete end-to-end security.
- Coordinate the stable recipient-ID handoff with Nathan: clients must send the
  selected server ID as `contact.id` and handle denied/revoked recipients. The
  existing `src/utils/api.ts` search mapping substitutes numeric indices for string
  IDs; the widget was left unchanged as requested. Those indices cannot authorize
  an order. Callers relying on addresses inside contact lists or profiles must use
  the authorized friend-detail endpoint instead.
- `/pre-fill-checkout` still echoes client input; it does not retrieve stored
  addresses, grant permissions or create orders. Its payload is not authoritative.
- The mock draft-order route still accepts a client-supplied `shop` hostname.
  Trusted-shop validation and credential scoping need separate coordination before
  production use; this task does not change Shopify integration or deployment.
- Revocation prevents future access; it cannot retract an address already returned
  to an authorized client or an order already created. No real Shopify checkout or
  external handler was exercised by these tests.
