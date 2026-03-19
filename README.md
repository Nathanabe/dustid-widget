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
- Please remember to do the same on root folder for front-end, and do the same in `backend/` folder in another terminal for back-end.

## Notes

- The widget expects a `placeholder.svg` image to be available at `/placeholder.svg` for avatars. Place this in your `public/` directory.
- You can pass `userName` and other options to `window.DustidWidget` for customization.

- Please remember to setup .env files in both root directory (front-end) and `backend/` directory (back-end). You can use these for development:
1. `.env`:
```
VITE_API_BASE_URL=http://localhost:3000
```
Change `VITE_API_BASE_URL` to different base URL for production.

2. `back-end/.env`:
```
# Environment
NODE_ENV=development
PORT=3000

# CORS config
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
CORS_CREDENTIALS=true
```
For production environment:
- change `NODE_ENV` to `production`.
- change `CORS_ORIGINS` to different URLs.