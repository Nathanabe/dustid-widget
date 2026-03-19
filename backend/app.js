import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";
import OpenApiValidator from 'express-openapi-validator';
import jwt from "jsonwebtoken";
import { authenticateToken } from "./middleware/auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// parse JSON bodies before OpenAPI validation
app.use(express.json());

// load OpenAPI spec
const apiSpecPath = path.join(__dirname, "swagger.yaml");
const apiSpecRaw = fs.readFileSync(apiSpecPath, "utf8");
const swaggerDocument = yaml.load(apiSpecRaw);

const prod = process.env.NODE_ENV === "production";

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [];

const allowCredentials = process.env.CORS_CREDENTIALS === "true";

const corsOptions = {
  origin: (origin, callback) => {
    // allow non-browser requests (curl, mobile apps)
    if (!origin) return callback(null, true);

    // check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Block unknown origins in production
    if (prod) {
      return callback(new Error("CORS blocked"));
    }

    // Dev: allow unknown origins
    callback(null, origin);
  },
  credentials: allowCredentials,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "OPTIONS"],
};

app.use(cors(corsOptions));

// Serve Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Install OpenAPI validator (requests + optional responses)
app.use(
  OpenApiValidator.middleware({
    apiSpec: './swagger.yaml',
    validateRequests: true, // (default)
    validateResponses: true, // false by default
  }),
);

// Basic route for home page
app.get('/', (req, res) => {
    res.status(200).send(
        `<!doctype html>
        <html lang="en">
        <head><meta charset="utf-8"><title>Contact Verification API</title></head>
        <body>
          <h1>Welcome to the Contact Verification API!</h1>
          <p>Explore the <a href="./docs/">API documentation</a>.</p>
        </body>
        </html>`
    );
});

app.post("/verify", (req, res) => {
  const { phoneNumber } = req.body;

  /* handled by OpenAPI Validator middleware
  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required." });
  }
  */

  const foundContact = contactsDB.find(
    (contact) => contact.phoneNumber === phoneNumber
  );
  if (!foundContact) {
    console.log(`Phone number ${phoneNumber} not found in contactsDB.`);
    return res.status(404).json({ message: "Phone number not found." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  console.log(`Generated OTP for ${phoneNumber}: ${otp}`);
  // Store OTP in memory (to be replaced with a cache)
  const existing = otpStore.find((entry) => entry.phoneNumber === phoneNumber);
  if (existing) {
    existing.otp = otp;
  } else {
    otpStore.push({ phoneNumber, otp });
  }

  if (prod) {
    // TODO: In production environment, integrate with SMS API to send OTP
    // don't forget to return a response here.
    console.log(`Send OTP ${otp} to phone number ${phoneNumber}`);
  }
  // development environment: always success
  return res.status(200).json({ message: "OTP sent successfully." });
});



app.post("/validate-otp", (req, res) => {
  const { phoneNumber, otp } = req.body;

  /* handled by OpenAPI Validator middleware
  if (!phoneNumber || !otp) {
    console.log(`Validation failed: Missing phoneNumber or OTP. Received phoneNumber: ${phoneNumber}, OTP: ${otp}`);
    return res
      .status(400)
      .json({ message: "Phone number and OTP are required." });
  }
  */

  const record = otpStore.find((entry) => entry.phoneNumber === phoneNumber);

  if (record && record.otp === otp) {
    const token = jwt.sign(
      { phoneNumber },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.status(200).json({ message: "OTP validated successfully.", token });
  } else {
    console.log(`OTP validation failed for phone number ${phoneNumber}. Expected OTP: ${record ? record.otp : 'N/A'}, Received OTP: ${otp}`);
    return res.status(401).json({ message: "Invalid OTP." });
  }
});


app.get("/friends/:friendId", authenticateToken, (req, res) => {
  const { friendId } = req.params;

  const contact = contactsDB.find((c) => c.phoneNumber === req.user.phoneNumber);
  if (!contact) {
    return res.status(404).json({ message: "Contact not found." });
  }

  const friend = contact.friends.find((f) => f.id === friendId);
  if (!friend) {
    return res.status(403).json({ message: "Cannot access details of users who are not in your friend list." });
  }

  return res.status(200).json(friend);
});


app.post("/search", authenticateToken, (req, res) => {
  const { phoneNumber, query } = req.body;
  /* handled by OpenAPI Validator middleware
  if (!phoneNumber) {
    console.log("Search failed: Missing phoneNumber in request body.");
    return res.status(400).json({ message: "Phone number is required." });
  }
  */
  const contact = contactsDB.find(
    (contact) => contact.phoneNumber === phoneNumber
  );
  if (!contact) {
    console.log(`Search failed: Contact with phone number ${phoneNumber} not found.`);
    return res.status(404).json({ message: "Contact not found." });
  }

  // Return contacts in a lightweight form, limiting size to keep payloads reasonable.
  // When query is empty, return the first N friends so the dropdown can show defaults.
  const friends = contact.friends || [];
  const q = query?.toString().trim().toLowerCase();

  const filtered = q
    ? friends.filter(
        (friend) =>
          (friend.name || "").toLowerCase().includes(q) ||
          (friend.email || "").toLowerCase().includes(q)
      )
    : friends;

  const results = filtered
    .slice(0, 20) // limit result size to keep payloads reasonable
    .map((friend) => ({
      id: friend.id,
      name: friend.name,
      email: friend.email, //we don't need the address yet, only use it later for checkout endpoint
    }));

  return res.status(200).json({ results });
});


// profile endpoint returns contact object for a given phoneNumber
app.post("/profile", (req, res) => {
  const { phoneNumber } = req.body;
  /* handled by OpenAPI Validator middleware
  if (!phoneNumber) {
    console.log("Profile retrieval failed: Missing phoneNumber in request body.");
    return res.status(400).json({ message: "Phone number is required." });
  }
  */
  const contact = contactsDB.find((c) => c.phoneNumber === phoneNumber);
  if (!contact) return res.status(404).json({ message: "Contact not found." });
  return res.status(200).json({ contact });
});



// Global error handler — place after routes and after OpenAPI validator
app.use((err, req, res, next) => {
  if (err && err.status && err.errors) {
    return res.status(err.status).json({ message: err.message, errors: err.errors });
  }
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

const otpStore = []; // [{ phoneNumber, otp }]

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
    friends: [], // No friends for Fiona
  },
  {
    id: "contact004",
    phoneNumber: "254745678901",
    name: "George White",
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
    friends: [],
  },
  {
    id: "contact007",
    phoneNumber: "254778901234",
    name: "Noah King",
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
    friends: [],
  },
  {
    id: "contact009",
    phoneNumber: "254790123456",
    name: "Quinn Bear",
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

