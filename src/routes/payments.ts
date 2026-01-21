import { Router, Request, Response } from 'express';
import { PaymentController } from '../controllers/PaymentController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validation.js';
import { z } from 'zod';
import { PaymentService } from '../services/PaymentService.js';
import { PayPalService } from '../services/PayPalService.js';

const router = Router();
const paymentController = new PaymentController();
const paymentService = new PaymentService();
const paypalService = new PayPalService();

// Validation schemas
const createOrderSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3).optional().default('GBP'),
});

const captureSchema = z.object({
  orderId: z.string().min(1),
});

/**
 * POST /api/payments/create-order
 * Create a PayPal order
 */
router.post(
  '/create-order',
  authenticate,
  validate(createOrderSchema),
  asyncHandler(paymentController.createOrder)
);

/**
 * POST /api/payments/capture
 * Capture a PayPal payment
 */
router.post(
  '/capture',
  authenticate,
  validate(captureSchema),
  asyncHandler(paymentController.capture)
);

/**
 * GET /api/payments
 * Get all payments for the authenticated user
 */
router.get('/', authenticate, asyncHandler(paymentController.getAll));

/**
 * GET /api/payments/:id
 * Get a specific payment by ID
 */
router.get('/:id', authenticate, asyncHandler(paymentController.getById));

/**
 * POST /api/payments/webhook
 * PayPal webhook handler
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
      console.error('PAYPAL_WEBHOOK_ID not configured');
      res.status(500).json({ error: 'Webhook not configured' });
      return;
    }

    // Verify webhook signature
    // Note: PayPal webhook verification requires the raw body as string
    // Express.json() middleware parses it, so we need to get raw body
    // For now, we'll verify with the parsed body, but in production you may want
    // to use express.raw() middleware for webhook routes
    const isValid = await paypalService.verifyWebhook(
      req.headers as Record<string, string | string[] | undefined>,
      JSON.stringify(req.body),
      webhookId
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      res.status(400).json({ error: 'Invalid webhook signature' });
      return;
    }

    // Handle webhook event
    await paymentService.handleWebhook(req.body);

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message || 'Webhook processing failed' });
  }
});

export default router;
