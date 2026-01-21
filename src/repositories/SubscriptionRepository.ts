import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { Subscription, SubscriptionStatus } from '../entities/Subscription.js';

export class SubscriptionRepository {
  private repository: Repository<Subscription>;

  constructor() {
    this.repository = AppDataSource.getRepository(Subscription);
  }

  async findById(id: string): Promise<Subscription | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByUserId(userId: string): Promise<Subscription | null> {
    return this.repository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async create(subscriptionData: Partial<Subscription>): Promise<Subscription> {
    const subscription = this.repository.create(subscriptionData);
    return this.repository.save(subscription);
  }

  async update(id: string, updates: Partial<Subscription>): Promise<Subscription | null> {
    const subscription = await this.findById(id);
    if (!subscription) return null;

    Object.assign(subscription, updates);
    return this.repository.save(subscription);
  }

  async cancelActiveSubscriptions(userId: string): Promise<void> {
    const activeSubscriptions = await this.repository.find({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    for (const subscription of activeSubscriptions) {
      subscription.status = SubscriptionStatus.CANCELLED;
      await this.repository.save(subscription);
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
