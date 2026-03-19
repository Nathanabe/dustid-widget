# DustID Widget

A shareable, embeddable React widget for DustID login/address, ready for Shopify and other platforms.

## Usage

1. Add a mount div where you want the widget to appear:

```html
<div id="dustid-root"></div>
```

2. Add the widget script (host your built `dist/dustid-widget.umd.js` on a CDN):

```html
<script src="https://cdn.yourdomain.com/dustid-widget.umd.js"></script>
<script>
  window.DustidWidget({ mountId: "dustid-root" });
</script>
```

## Development

- `yarn install` or `npm install`
- `yarn dev` or `npm run dev` (for local development)
- `yarn build` or `npm run build` (to build distributable files in `dist/`)

Start the backend server:

```bash
cd backend
node server.js
```

The backend runs on `http://localhost:5000` by default (configurable via the `PORT` environment variable).

## Notes

- The widget expects a `placeholder.svg` image to be available at `/placeholder.svg` for avatars. Place this in your `public/` directory.
- You can pass `userName` and other options to `window.DustidWidget` for customization.

---

## API Endpoints

Base URL: `http://localhost:5000`

---

### `GET /`

Health check / welcome route.

**Response**

```
200 OK
Welcome to the Contact Verification API!
```

---

### `POST /verify`

Looks up a phone number in the database and generates a one-time password (OTP) for it.

**Request Body**

| Field         | Type   | Required | Description                              |
|---------------|--------|----------|------------------------------------------|
| `phoneNumber` | string | Yes      | Full phone number including country code (e.g. `254712345678`) |

**Responses**

| Status | Body                                  | Condition                        |
|--------|---------------------------------------|----------------------------------|
| 200    | `{ "message": "OTP sent successfully." }` | Phone number found, OTP generated |
| 400    | `{ "message": "Phone number is required." }` | `phoneNumber` missing            |
| 404    | `{ "message": "Phone number not found." }` | Number not in the database       |

**Example**

```json
// POST /verify
{
  "phoneNumber": "254712345678"
}

// 200 OK
{
  "message": "OTP sent successfully."
}
```

---

### `POST /validate-otp`

Validates a previously generated OTP for a given phone number.

**Request Body**

| Field         | Type   | Required | Description                              |
|---------------|--------|----------|------------------------------------------|
| `phoneNumber` | string | Yes      | Full phone number including country code |
| `otp`         | string | Yes      | 6-digit OTP received from `/verify`      |

**Responses**

| Status | Body                                          | Condition                    |
|--------|-----------------------------------------------|------------------------------|
| 200    | `{ "message": "OTP validated successfully." }` | OTP matches                  |
| 400    | `{ "message": "Phone number and OTP are required." }` | Missing fields           |
| 401    | `{ "message": "Invalid OTP." }`               | OTP does not match           |

**Example**

```json
// POST /validate-otp
{
  "phoneNumber": "254712345678",
  "otp": "482910"
}

// 200 OK
{
  "message": "OTP validated successfully."
}
```

---

### `GET /friends/:friendId/address`

Returns the shipping address of a specific friend by their ID.

**URL Parameters**

| Parameter  | Type   | Description          |
|------------|--------|----------------------|
| `friendId` | string | The friend's unique ID (e.g. `friend101`) |

**Responses**

| Status | Body                                  | Condition              |
|--------|---------------------------------------|------------------------|
| 200    | `{ "address": { ... } }`             | Friend found           |
| 404    | `{ "message": "Friend not found." }` | No match for `friendId` |

**Address Object Fields**

| Field        | Type   | Description              |
|--------------|--------|--------------------------|
| `first_name` | string | Friend's first name      |
| `last_name`  | string | Friend's last name       |
| `address1`   | string | Street address           |
| `address2`   | string | Apartment / unit (optional) |
| `city`       | string | City                     |
| `province`   | string | Province / county        |
| `zip`        | string | Postal code              |
| `country`    | string | Country                  |
| `phone`      | string | Friend's phone number    |

**Example**

```json
// GET /friends/friend101/address

// 200 OK
{
  "address": {
    "address1": "123 Main St",
    "city": "Nairobi",
    "province": "Nairobi",
    "zip": "00100",
    "country": "Kenya",
    "first_name": "Bob",
    "last_name": "Smith",
    "phone": "254700111222"
  }
}
```

---

### `POST /search`

Searches a contact's friends list by name or email.

**Request Body**

| Field         | Type   | Required | Description                              |
|---------------|--------|----------|------------------------------------------|
| `phoneNumber` | string | Yes      | Phone number of the authenticated contact |
| `query`       | string | Yes      | Search term matched against friend name or email |

**Responses**

| Status | Body                                                    | Condition                          |
|--------|---------------------------------------------------------|------------------------------------|
| 200    | `{ "results": [ ... ] }`                               | Search completed (may be empty)    |
| 400    | `{ "message": "Phone number and search query are required." }` | Missing fields              |
| 404    | `{ "message": "Contact not found." }`                  | `phoneNumber` not in the database  |

**Result Item Fields**

| Field     | Type   | Description           |
|-----------|--------|-----------------------|
| `id`      | string | Friend's unique ID    |
| `name`    | string | Friend's full name    |
| `email`   | string | Friend's email        |
| `address` | object | Friend's address (see address fields above) |

**Example**

```json
// POST /search
{
  "phoneNumber": "254712345678",
  "query": "bob"
}

// 200 OK
{
  "results": [
    {
      "id": "friend101",
      "name": "Bob Smith",
      "email": "bob.smith@example.com",
      "address": {
        "address1": "123 Main St",
        "city": "Nairobi",
        "province": "Nairobi",
        "zip": "00100",
        "country": "Kenya",
        "first_name": "Bob",
        "last_name": "Smith",
        "phone": "254700111222"
      }
    }
  ]
}
```

---

## ESLint Configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
