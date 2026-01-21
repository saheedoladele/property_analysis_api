import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * Create a payment order
   * POST /api/payments/create-order
   */
  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { amount, currency = 'GBP' } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({ error: 'Invalid amount' });
        return;
      }

      const result = await this.paymentService.createOrder(
        req.user!.userId,
        amount,
        currency
      );

      res.json(result);
    } catch (error: any) {
      console.error('Create order error:', error);
      res.status(500).json({ error: error.message || 'Failed to create order' });
    }
  };

  /**
   * Capture a payment
   * POST /api/payments/capture
   */
  capture = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        res.status(400).json({ error: 'Order ID is required' });
        return;
      }

      const payment = await this.paymentService.capturePayment(
        req.user!.userId,
        orderId
      );

      res.json(payment);
    } catch (error: any) {
      console.error('Capture payment error:', error);
      res.status(500).json({ error: error.message || 'Failed to capture payment' });
    }
  };

  /**
   * Get payment by ID
   * GET /api/payments/:id
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.getById(id as string, req.user!.userId);

      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      res.json(payment);
    } catch (error: any) {
      console.error('Get payment error:', error);
      res.status(500).json({ error: error.message || 'Failed to get payment' });
    }
  };

  /**
   * Get all payments for the authenticated user
   * GET /api/payments
   */
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const payments = await this.paymentService.getByUserId(req.user!.userId);
      res.json(payments);
    } catch (error: any) {
      console.error('Get payments error:', error);
      res.status(500).json({ error: error.message || 'Failed to get payments' });
    }
  };
}
