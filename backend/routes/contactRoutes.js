import express from 'express';
import { getContacts } from '../controllers/contactController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getContacts);

export default router;

