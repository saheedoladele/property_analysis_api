import { Router } from 'express';
import { ContactController } from '../controllers/ContactController.js';
import { optionalAuthenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validation.js';
import { z } from 'zod';

const router = Router();
const contactController = new ContactController();

// Validation schema
const createContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1),
});

/**
 * POST /api/contact
 * Submit a contact form
 */
router.post(
  '/',
  optionalAuthenticate,
  validate(createContactSchema),
  asyncHandler(contactController.create)
);

export default router;
