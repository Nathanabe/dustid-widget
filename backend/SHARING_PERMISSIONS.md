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

Names, emails, UK-style phone numbers, street addresses and postcode-format strings
are synthetic test data, not delivery destinations. Login phone numbers use the
existing digits-only international format (no `+`).

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
  fields. Shipping and billing come from server fixtures. Successful responses
  retain `invoice_url` and `message`.
- `/profile` now requires authentication and the buyer's own phone number; nested
  friends are shared summaries without addresses. This closes the existing
  unauthenticated route around the recipient permission checks. The buyer still
  receives their own billing address.

Contact/address payload logging was removed from draft orders and the echo-only
`/pre-fill-checkout` route. Draft-order error logs no longer dump upstream data or
exception objects. No new OTP, token or address logging was added.

## Limitations and coordination with Nathan

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
