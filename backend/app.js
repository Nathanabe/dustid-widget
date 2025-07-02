import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());




app.use(bodyParser.json());

// Basic route for home page
app.get('/', (req, res) => {
    res.status(200).send('Welcome to the Contact Verification API!');
});

// --- 4. `verify` Endpoint ---
// This endpoint will receive a phone number and return contact details.
app.post('/verify', (req, res) => {
  const phoneNumber = req.body.phoneNumber; // Extract phoneNumber from the request body
console.log(phoneNumber)
    // Validate input
    if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required.' });
    }

    // Find the contact in our mock database
    const foundContact = contactsDB.find(contact => contact.phoneNumber === phoneNumber);

    if (foundContact) {
        // If contact is found, return their details and friends
        res.status(200).json({
            message: 'Contact verified successfully!',
            contact: {
                id: foundContact.id,
                name: foundContact.name,
                phoneNumber: foundContact.phoneNumber,
                friends: foundContact.friends
            }
        });
    } else {
        // If contact is not found
        res.status(404).json({ message: 'Phone number not found.' });
    }
});

export default app;


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

