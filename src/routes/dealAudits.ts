import { Router } from 'express';
import { DealAuditController } from '../controllers/DealAuditController';
import { optionalAuthenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();
const dealAuditController = new DealAuditController();

// Validation schema
const createDealAuditSchema = z.object({
  userEmail: z.string().email(),
  userName: z.string().min(1),
  userPhone: z.string().optional(),
  propertyAddress: z.string().min(1),
  propertyPostcode: z.string().min(1),
  askingPrice: z.string().optional(),
  additionalNotes: z.string().optional(),
  bookingDate: z.string().datetime().optional(),
});

/**
 * POST /api/deal-audits
 * Submit a deal audit booking
 */
router.post(
  '/',
  optionalAuthenticate,
  validate(createDealAuditSchema),
  asyncHandler(dealAuditController.create)
);

export default router;
