import { PaymentRepository } from '../repositories/PaymentRepository.js';
import { PayPalService } from './PayPalService.js';
import { SubscriptionService } from './SubscriptionService.js';
import { PaymentDto, CreatePaymentDto } from '../types/index.js';
import { SubscriptionPlan } from '../entities/Subscription.js';

export class PaymentService {
  private paymentRepository: PaymentRepository;
  private paypalService: PayPalService;
  private subscriptionService: SubscriptionService;

  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.paypalService = new PayPalService();
    this.subscriptionService = new SubscriptionService();
  }

  /**
   * Create a payment order
   */
  async createOrder(userId: string, amount: number, currency: string = 'GBP'): Promise<{
    orderId: string;
    approvalUrl: string;
  }> {
    // Create PayPal order
    const paypalOrder = await this.paypalService.createOrder(amount, currency);

    // Create payment record in database
    const payment = await this.paymentRepository.create({
      userId,
      paypalOrderId: paypalOrder.orderId,
      amount,
      currency,
      status: 'PENDING',
    });

    return {
      orderId: paypalOrder.orderId,
      approvalUrl: paypalOrder.approvalUrl,
    };
  }

  /**
   * Capture a payment and activate subscription
   */
  async capturePayment(
    userId: string,
    orderId: string
  ): Promise<PaymentDto> {
    // Capture the PayPal order
    const captureResult = await this.paypalService.captureOrder(orderId);

    // Find payment record
    const payment = await this.paymentRepository.findByPayPalOrderId(orderId);
    if (!payment) {
      throw new Error('Payment record not found');
    }

    if (payment.userId !== userId) {
      throw new Error('Payment does not belong to this user');
    }

    // Update payment status
    const updatedPayment = await this.paymentRepository.updateByPayPalOrderId(orderId, {
      status: captureResult.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED',
    });

    if (!updatedPayment) {
      throw new Error('Failed to update payment');
    }

    // If payment is completed, activate premium subscription
    if (updatedPayment.status === 'COMPLETED') {
      await this.subscriptionService.create(userId, {
        plan: SubscriptionPlan.PREMIUM,
      });
    }

    return this.toDto(updatedPayment);
  }

  /**
   * Handle webhook event
   */
  async handleWebhook(event: any): Promise<void> {
    const eventType = event.event_type;
    const resource = event.resource;

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const orderId = resource?.supplementary_data?.related_ids?.order_id;
      if (orderId) {
        const payment = await this.paymentRepository.findByPayPalOrderId(orderId);
        if (payment && payment.status === 'PENDING') {
          await this.paymentRepository.updateByPayPalOrderId(orderId, {
            status: 'COMPLETED',
          });

          // Activate premium subscription
          await this.subscriptionService.create(payment.userId, {
            plan: SubscriptionPlan.PREMIUM,
          });
        }
      }
    } else if (eventType === 'PAYMENT.CAPTURE.DENIED' || eventType === 'PAYMENT.CAPTURE.REFUNDED') {
      const orderId = resource?.supplementary_data?.related_ids?.order_id;
      if (orderId) {
        await this.paymentRepository.updateByPayPalOrderId(orderId, {
          status: 'FAILED',
        });
      }
    }
  }

  /**
   * Get payment by ID
   */
  async getById(id: string, userId: string): Promise<PaymentDto | null> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment || payment.userId !== userId) {
      return null;
    }
    return this.toDto(payment);
  }

  /**
   * Get all payments for a user
   */
  async getByUserId(userId: string): Promise<PaymentDto[]> {
    const payments = await this.paymentRepository.findByUserId(userId);
    return payments.map((payment) => this.toDto(payment));
  }

  private toDto(payment: any): PaymentDto {
    return {
      id: payment.id,
      userId: payment.userId,
      paypalOrderId: payment.paypalOrderId,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
