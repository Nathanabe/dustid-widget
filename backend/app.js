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

const otpStore = []; // temporary in-memory OTP storage

const contactsDB = [
  {
    id: "contact001",
    phoneNumber: "254712345678",
    name: "Alice Johnson",
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
    ],
  },
];

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

// DRAFT ORDER
app.post("/api/draft-order", (req, res) => {
  const { shop, items, contact } = req.body;

  if (!shop || !items || !contact) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const fakeInvoiceUrl = `https://${shop}/cart`;

  return res.status(200).json({
    invoice_url: fakeInvoiceUrl,
    message: "Draft order created successfully.",
  });
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

export default app;
