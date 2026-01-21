import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { Payment } from '../entities/Payment.js';

export class PaymentRepository {
  private repository: Repository<Payment>;

  constructor() {
    this.repository = AppDataSource.getRepository(Payment);
  }

  async findById(id: string): Promise<Payment | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByPayPalOrderId(paypalOrderId: string): Promise<Payment | null> {
    return this.repository.findOne({
      where: { paypalOrderId },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(paymentData: Partial<Payment>): Promise<Payment> {
    const payment = this.repository.create(paymentData);
    return this.repository.save(payment);
  }

  async update(id: string, updates: Partial<Payment>): Promise<Payment | null> {
    const payment = await this.findById(id);
    if (!payment) return null;

    Object.assign(payment, updates);
    return this.repository.save(payment);
  }

  async updateByPayPalOrderId(
    paypalOrderId: string,
    updates: Partial<Payment>
  ): Promise<Payment | null> {
    const payment = await this.findByPayPalOrderId(paypalOrderId);
    if (!payment) return null;

    Object.assign(payment, updates);
    return this.repository.save(payment);
  }
}
