import { Router } from 'express';
import { SubscriptionController } from '../controllers/SubscriptionController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validation.js';
import { z } from 'zod';
import { SubscriptionPlan } from '../types/index.js';

const router = Router();
const subscriptionController = new SubscriptionController();

// Validation schema
const createSubscriptionSchema = z.object({
  plan: z.nativeEnum(SubscriptionPlan),
  stripeSubscriptionId: z.string().optional(),
});

/**
 * GET /api/subscriptions
 * Get subscription status for the authenticated user
 */
router.get('/', authenticate, asyncHandler(subscriptionController.get));

/**
 * POST /api/subscriptions
 * Create a new subscription
 */
router.post(
  '/',
  authenticate,
  validate(createSubscriptionSchema),
  asyncHandler(subscriptionController.create)
);

/**
 * DELETE /api/subscriptions
 * Cancel subscription
 */
router.delete('/', authenticate, asyncHandler(subscriptionController.cancel));

export default router;
