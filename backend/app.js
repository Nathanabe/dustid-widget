import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";
import OpenApiValidator from "express-openapi-validator";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { authenticateToken } from "./middleware/auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// safer swagger path handling for Vercel
const apiSpecPath = path.join(__dirname, "swagger.yaml");

const app = express();

// parse JSON bodies before OpenAPI validation
app.use(express.json());

// load OpenAPI spec
const apiSpecRaw = fs.readFileSync(apiSpecPath, "utf8");
const swaggerDocument = yaml.load(apiSpecRaw);

const prod = process.env.NODE_ENV === "production";
const shopifyApiKey = process.env.SHOPIFY_API_KEY;
const shopifyScopes = process.env.SHOPIFY_SCOPES || "read_products";
const shopifyHost = process.env.SHOPIFY_HOST || process.env.HOST || `https://localhost:${process.env.PORT || 5000}`;

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [];

const allowCredentials = process.env.CORS_CREDENTIALS === "true";

const corsOptions = {
  origin: (origin, callback) => {
    // allow non-browser requests (curl, mobile apps)
    if (!origin) return callback(null, true);

    // allow all origins if using *
    if (allowedOrigins.includes("*")) {
      return callback(null, true);
    }

    // check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Block unknown origins in production
    if (prod && allowedOrigins.length > 0) {
      return callback(new Error("CORS blocked"));
    }

    // Dev: allow unknown origins
    callback(null, true);
  },
  credentials: allowCredentials,
  allowedHeaders: ["Content-Type", "Authorization", "shop"],
  methods: ["GET", "POST", "OPTIONS"],
};

app.use(cors(corsOptions));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend running successfully",
  });
});

// Serve Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Shopify auth starter route
app.get("/api/auth", (req, res) => {
  const shop = req.query.shop?.toString().trim();
  const embedded = req.query.embedded?.toString();

  if (!shop) {
    return res.status(400).json({ message: "Missing required shop query parameter." });
  }

  if (!shopifyApiKey) {
    return res.status(500).json({ message: "Shopify API key is not configured." });
  }

  const shopDomainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-.]*$/;
  if (!shopDomainPattern.test(shop)) {
    return res.status(400).json({ message: "Invalid shop domain." });
  }

  const redirectUri = `${shopifyHost.replace(/\/$/, "")}/api/auth/callback`;
  const state = crypto.randomBytes(16).toString("hex");

  const authUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  authUrl.searchParams.set("client_id", shopifyApiKey);
  authUrl.searchParams.set("scope", shopifyScopes);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);

  if (embedded) {
    authUrl.searchParams.set("embedded", "1");
  }

  res.redirect(authUrl.toString());
});

// Install OpenAPI validator
app.use(
  OpenApiValidator.middleware({
    apiSpec: apiSpecPath,
    validateRequests: true,
    validateResponses: true,
  })
);

// Basic route for home page
app.get("/", (req, res) => {
  res.status(200).send(`
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Contact Verification API</title>
    </head>
    <body>
      <h1>Welcome to the Contact Verification API!</h1>
      <p>Explore the <a href="./docs/">API documentation</a>.</p>
    </body>
    </html>
  `);
});

// VERIFY OTP REQUEST
app.post("/verify", (req, res) => {
  const { phoneNumber } = req.body;

  const foundContact = contactsDB.find(
    (contact) => contact.phoneNumber === phoneNumber
  );

  if (!foundContact) {
    return res.status(404).json({
      message: "Phone number not found.",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  console.log(`Generated OTP for ${phoneNumber}: ${otp}`);

  const existing = otpStore.find(
    (entry) => entry.phoneNumber === phoneNumber
  );

  if (existing) {
    existing.otp = otp;
  } else {
    otpStore.push({ phoneNumber, otp });
  }

  if (prod) {
    console.log(`Send OTP ${otp} to phone number ${phoneNumber}`);
  }

  return res.status(200).json({
    message: "OTP sent successfully.",
  });
});

// VALIDATE OTP
app.post("/validate-otp", (req, res) => {
  const { phoneNumber, otp } = req.body;

  const record = otpStore.find(
    (entry) => entry.phoneNumber === phoneNumber
  );

  // For demo purposes, we skip actual OTP validation
  if (record /*&& record.otp === otp*/) {
    const token = jwt.sign(
      { phoneNumber },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "OTP validated successfully.",
      token,
    });
  }

  return res.status(401).json({
    message: "Invalid OTP.",
  });
});

// Get friend list (Author: Muhammad)
app.get("/friends", authenticateToken, (req, res) => {
  const contact = contactsDB.find((c) => c.phoneNumber === req.user.phoneNumber);
  if (!contact) {
    return res.status(404).json({ message: "Contact not found." });
  }

  const friends = (contact.friends || []).map((f) => ({
    id: f.id,
    name: f.name,
    email: f.email,
    address: f.address,
  }));

  return res.status(200).json({ friends });
});

// GET FRIEND DETAILS
app.get("/friends/:friendId", authenticateToken, (req, res) => {
  const { friendId } = req.params;

  const contact = contactsDB.find(
    (c) => c.phoneNumber === req.user.phoneNumber
  );

  if (!contact) {
    return res.status(404).json({
      message: "Contact not found.",
    });
  }

  const friend = contact.friends.find(
    (f) => f.id === friendId
  );

  if (!friend) {
    return res.status(403).json({
      message:
        "Cannot access details of users who are not in your friend list.",
    });
  }

  return res.status(200).json(friend);
});

// SEARCH FRIENDS
app.post("/search", authenticateToken, (req, res) => {
  const { phoneNumber, query } = req.body;

  const contact = contactsDB.find(
    (contact) => contact.phoneNumber === phoneNumber
  );

  if (!contact) {
    return res.status(404).json({
      message: "Contact not found.",
    });
  }

  const friends = contact.friends || [];

  const q = query?.toString().trim().toLowerCase();

  const filtered = q
    ? friends.filter(
        (friend) =>
          (friend.name || "").toLowerCase().includes(q) ||
          (friend.email || "").toLowerCase().includes(q)
      )
    : friends;

  const results = filtered.slice(0, 20).map((friend) => ({
    id: friend.id,
    name: friend.name,
    email: friend.email,
  }));

  return res.status(200).json({ results });
});

// PRE-FILL CHECKOUT
app.post("/pre-fill-checkout", (req, res) => {
  const { contact } = req.body;

  console.log("📦 Received contact:", contact);

  res.json({ message: "pre-fill-checkout received", contact });
});

function buildAddressPayload(addressLike = {}, fallbackName = "") {
  const address = addressLike || {};
  const [firstName, ...restParts] = String(
    address.first_name || address.firstName || fallbackName || ""
  )
    .trim()
    .split(/\s+/);
  const lastName = String(
    address.last_name || address.lastName || restParts.join(" ") || ""
  ).trim();

  return {
    first_name: firstName || "",
    last_name: lastName || "",
    address1: address.address1 || address.address || address.street || address.line1 || "",
    address2: address.address2 || address.line2 || "",
    city: address.city || "",
    province: address.province || address.state || "",
    zip: address.zip || address.postal_code || address.postcode || "",
    country: address.country || "",
    country_code: address.country_code || address.countryCode || "",
    phone: address.phone || "",
  };
}

function buildShopifyCheckoutUrl(shop, contact) {
  const rawShop = String(shop || "").trim();
  if (!rawShop) return null;

  let domain = rawShop.toLowerCase();
  const shopDomainPattern = /^[a-z0-9][a-z0-9-.]*$/;

  if (!domain.endsWith(".myshopify.com")) {
    if (!shopDomainPattern.test(domain)) return null;
    domain = `${domain}.myshopify.com`;
  }

  const [firstName, ...nameParts] = String(contact?.name || "").trim().split(" ");
  const lastName = nameParts.join(" ");
  const address = contact?.address || {};

  const params = new URLSearchParams();
  if (contact?.email) params.set("checkout[email]", String(contact.email));
  if (firstName) params.set("checkout[shipping_address][first_name]", firstName);
  if (lastName) params.set("checkout[shipping_address][last_name]", lastName || String(contact.name));
  if (address.address1 || address.street || address.line1) {
    params.set(
      "checkout[shipping_address][address1]",
      String(address.address1 || address.street || address.line1),
    );
  }
  if (address.address2 || address.line2) {
    params.set(
      "checkout[shipping_address][address2]",
      String(address.address2 || address.line2),
    );
  }
  if (address.city) params.set("checkout[shipping_address][city]", String(address.city));
  if (address.province || address.state) {
    params.set(
      "checkout[shipping_address][province]",
      String(address.province || address.state),
    );
  }
  if (address.zip || address.postal_code || address.postcode) {
    params.set(
      "checkout[shipping_address][zip]",
      String(address.zip || address.postal_code || address.postcode),
    );
  }
  if (address.country_code) {
    params.set("checkout[shipping_address][country_code]", String(address.country_code));
  } else if (address.country) {
    params.set("checkout[shipping_address][country]", String(address.country));
  }
  if (address.phone || contact?.phone) {
    params.set("checkout[shipping_address][phone]", String(address.phone || contact.phone));
  }
  if (address.company) {
    params.set("checkout[shipping_address][company]", String(address.company));
  }

  const query = params.toString();
  return `https://${domain}/checkout${query ? `?${query}` : ""}`;
}

// DRAFT ORDER
app.post("/api/draft-order", authenticateToken, async (req, res) => {
  const { shop, items, contact } = req.body;
  console.log(`user body: ${JSON.stringify(req.user)}`);
  console.log(`contact: ${JSON.stringify(contact)}`);
  if (!shop || !items || !contact) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!accessToken) {
    return res.status(500).json({ message: "Shopify access token not configured." });
  }

  try {
    const authContact = req.user?.phoneNumber
      ? contactsDB.find((entry) => entry.phoneNumber === req.user.phoneNumber)
      : null;
    const selectedContact = contact || authContact || {};
    const senderContact = authContact || {};
    const shippingAddressSource =
      selectedContact?.delivery_address ||
      selectedContact?.shipping_address ||
      selectedContact?.address ||
      {};
    const billingAddressSource =
      req.body?.billing_address ||
      req.body?.billingAddress ||
      senderContact?.billing_address ||
      senderContact?.billingAddress ||
      senderContact?.delivery_address ||
      senderContact?.shipping_address ||
      senderContact?.address ||
      {};

    const shippingAddress = buildAddressPayload(shippingAddressSource, selectedContact?.name || "");
    const billingAddress = buildAddressPayload(billingAddressSource, senderContact?.name || selectedContact?.name || "");
    const hasBillingAddress = Object.values(billingAddress).some((value) => String(value || "").trim() !== "");

    console.log(`Shipping Address: ${JSON.stringify(shippingAddress)}`);
    console.log(`Billing Address: ${JSON.stringify(billingAddress)}`);
    const response = await fetch(`https://${shop}/admin/api/2024-01/draft_orders.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        draft_order: {
          line_items: items.map((item) => ({
            variant_id: item.variant_id,
            quantity: item.quantity,
          })),
          shipping_address: shippingAddress,
          ...(hasBillingAddress ? { billing_address: billingAddress } : {}),
          note: `Dustid gift for ${selectedContact?.name || "customer"}`,
          tags: "dustid-gift",
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[dustid] Shopify draft order error:", data);
      return res.status(500).json({ message: "Failed to create draft order.", error: data });
    }

    return res.status(200).json({
      invoice_url: data.draft_order.invoice_url,
      message: "Draft order created successfully.",
    });
    console.log("[dustid] Draft order created successfully:", data);
  } catch (err) {
    console.error("[dustid] Draft order exception:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// PROFILE
app.post("/profile", (req, res) => {
  const { phoneNumber } = req.body;

  const contact = contactsDB.find(
    (c) => c.phoneNumber === phoneNumber
  );

  if (!contact) {
    return res.status(404).json({
      message: "Contact not found.",
    });
  }

  return res.status(200).json({ contact });
});

// Global error handler
app.use((err, req, res, next) => {
  if (err && err.status && err.errors) {
    return res.status(err.status).json({
      message: err.message,
      errors: err.errors,
    });
  }

  console.error(err);

  res.status(500).json({
    message: "Internal Server Error",
  });
});

const otpStore = []; // temporary in-memory OTP storage

const contactsDB = [
  {
    id: "contact001",
    phoneNumber: "254712345678",
    name: "Alice Johnson",
    billing_address: {
      first_name: "Alice",
      last_name: "Johnson",
      address1: "14 Riverside Drive",
      address2: "House 2A",
      city: "Nairobi",
      province: "Nairobi",
      zip: "00100",
      country: "Kenya",
      country_code: "KE",
      phone: "254700100101",
    },
    friends: [
      {
        id: "friend101",
        name: "Bob Smith",
        email: "bob.smith@example.com",
        address: {
          address1: "123 Main St",
          city: "Nairobi",
          province: "Nairobi",
          zip: "00100",
          country: "Kenya",
          first_name: "Bob",
          last_name: "Smith",
          phone: "254700111222",
        },
      },
      {
        id: "friend102",
        name: "Charlie Brown",
        email: "charlie.b@example.com",
        address: {
          address1: "45 Some Road",
          address2: "Apt 5",
          city: "Mombasa",
          province: "Mombasa",
          zip: "80100",
          country: "Kenya",
          first_name: "Charlie",
          last_name: "Brown",
          phone: "254700333444",
        },
      },
    ],
  },
  {
    id: "contact002",
    phoneNumber: "254723456789",
    name: "David Lee",
    billing_address: {
      first_name: "David",
      last_name: "Lee",
      address1: "88 Thika Road",
      address2: "Block C",
      city: "Thika",
      province: "Kiambu",
      zip: "01000",
      country: "Kenya",
      country_code: "KE",
      phone: "254700100201",
    },
    friends: [
      {
        id: "friend201",
        name: "Eve Davis",
        email: "eve.d@example.com",
        address: {
          address1: "789 Elm Ave",
          city: "Kisumu",
          province: "Kisumu",
          zip: "40100",
          country: "Kenya",
          first_name: "Eve",
          last_name: "Davis",
          phone: "254700555666",
        },
      },
    ],
  },
  {
    id: "contact003",
    phoneNumber: "254734567890",
    name: "Fiona Green",
    billing_address: {
      first_name: "Fiona",
      last_name: "Green",
      address1: "33 Lang'ata Road",
      address2: "Gate B",
      city: "Nairobi",
      province: "Nairobi",
      zip: "00509",
      country: "Kenya",
      country_code: "KE",
      phone: "254700100301",
    },
    friends: [], // No friends for Fiona
  },
  {
    id: "contact004",
    phoneNumber: "254745678901",
    name: "George White",
    billing_address: {
      first_name: "George",
      last_name: "White",
      address1: "10 Pine Lane",
      address2: "Villa 6",
      city: "Eldoret",
      province: "Uasin Gishu",
      zip: "30100",
      country: "Kenya",
      country_code: "KE",
      phone: "254700100401",
    },
    friends: [
      {
        id: "friend401",
        name: "Hannah Black",
        email: "hannah.b@example.com",
        address: {
          address1: "10 Pine Lane",
          city: "Eldoret",
          province: "Uasin Gishu",
          zip: "30100",
          country: "Kenya",
          first_name: "Hannah",
          last_name: "Black",
          phone: "254700777888",
        },
      },
    ],
  },
  {
    id: "contact005",
    phoneNumber: "254756789012",
    name: "Ivy Rose",
    billing_address: {
      first_name: "Ivy",
      last_name: "Rose",
      address1: "22 River Road",
      address2: "Plot 14",
      city: "Nakuru",
      province: "Nakuru",
      zip: "20100",
      country: "Kenya",
      country_code: "KE",
      phone: "254700100501",
    },
    friends: [
      {
        id: "friend501",
        name: "Jack Stone",
        email: "jack.s@example.com",
        address: {
          address1: "22 River Road",
          city: "Nakuru",
          province: "Nakuru",
          zip: "20100",
          country: "Kenya",
          first_name: "Jack",
          last_name: "Stone",
          phone: "254700999000",
        },
      },
      {
        id: "friend502",
        name: "Karen Sky",
        email: "karen.s@example.com",
        address: {
          address1: "33 Hilltop Way",
          city: "Nyeri",
          province: "Nyeri",
          zip: "10100",
          country: "Kenya",
          first_name: "Karen",
          last_name: "Sky",
          phone: "254700111000",
        },
      },
      {
        id: "friend503",
        name: "Liam Ocean",
        email: "liam.o@example.com",
        address: {
          address1: "44 Valley View",
          city: "Meru",
          province: "Meru",
          zip: "60100",
          country: "Kenya",
          first_name: "Liam",
          last_name: "Ocean",
          phone: "254700222000",
        },
      },
    ],
  },
  {
    id: "contact006",
    phoneNumber: "254767890123",
    name: "Mia Park",
    billing_address: {
      first_name: "Mia",
      last_name: "Park",
      address1: "5 Upper Hill Plaza",
      address2: "Office 8",
      city: "Nairobi",
      province: "Nairobi",
      zip: "00200",
      country: "Kenya",
      country_code: "KE",
      phone: "254700100601",
    },
    friends: [],
  },
  {
    id: "contact007",
    phoneNumber: "254778901234",
    name: "Noah King",
    billing_address: {
      first_name: "Noah",
      last_name: "King",
      address1: "55 Castle St",
      address2: "",
      city: "Thika",
      province: "Kiambu",
      zip: "00100",
      country: "Kenya",
      country_code: "KE",
      phone: "254700100701",
    },
    friends: [
      {
        id: "friend701",
        name: "Olivia Queen",
        email: "olivia.q@example.com",
        address: {
          address1: "55 Castle St",
          city: "Thika",
          province: "Kiambu",
          zip: "00100",
          country: "Kenya",
          first_name: "Olivia",
          last_name: "Queen",
          phone: "254700333000",
        },
      },
    ],
  },
  {
    id: "contact008",
    phoneNumber: "254789012345",
    name: "Peter Lion",
    billing_address: {
      first_name: "Peter",
      last_name: "Lion",
      address1: "19 Kijabe Street",
      address2: "Suite 1",
      city: "Nairobi",
      province: "Nairobi",
      zip: "00100",
      country: "Kenya",
      country_code: "KE",
      phone: "254700100801",
    },
    friends: [],
  },
  {
    id: "contact009",
    phoneNumber: "254790123456",
    name: "Quinn Bear",
    billing_address: {
      first_name: "Quinn",
      last_name: "Bear",
      address1: "66 Forest Rd",
      address2: "House 9",
      city: "Machakos",
      province: "Machakos",
      zip: "90100",
      country: "Kenya",
      country_code: "KE",
      phone: "254700100901",
    },
    friends: [
      {
        id: "friend901",
        name: "Rachel Fox",
        email: "rachel.f@example.com",
        address: {
          address1: "66 Forest Rd",
          city: "Machakos",
          province: "Machakos",
          zip: "90100",
          country: "Kenya",
          first_name: "Rachel",
          last_name: "Fox",
          phone: "254700444000",
        },
      },
    ],
  },
  {
    id: "contact010",
    phoneNumber: "254701234567",
    name: "Sam Wolf",
    billing_address: {
      first_name: "Sam",
      last_name: "Wolf",
      address1: "77 Ocean View",
      address2: "Villa 3",
      city: "Diani",
      province: "Kwale",
      zip: "80401",
      country: "Kenya",
      country_code: "KE",
      phone: "254700101001",
    },
    friends: [
      {
        id: "friend1001",
        name: "Tina Dove",
        email: "tina.d@example.com",
        address: {
          address1: "77 Ocean View",
          city: "Diani",
          province: "Kwale",
          zip: "80401",
          country: "Kenya",
          first_name: "Tina",
          last_name: "Dove",
          phone: "254700555000",
        },
      },
      {
        id: "friend1002",
        name: "Uma Zebra",
        email: "uma.z@example.com",
        address: {
          address1: "88 Desert Dr",
          city: "Malindi",
          province: "Kilifi",
          zip: "80200",
          country: "Kenya",
          first_name: "Uma",
          last_name: "Zebra",
          phone: "254700666000",
        },
      },
    ],
  },
];

export default app;
