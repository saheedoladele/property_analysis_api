import { SubscriptionRepository } from '../repositories/SubscriptionRepository.js';
import { SubscriptionDto, CreateSubscriptionDto, SubscriptionPlan, SubscriptionStatus } from '../types/index.js';

export class SubscriptionService {
  private subscriptionRepository: SubscriptionRepository;

  constructor() {
    this.subscriptionRepository = new SubscriptionRepository();
  }

  async getByUserId(userId: string): Promise<SubscriptionDto> {
    const subscription = await this.subscriptionRepository.findActiveByUserId(userId);

    if (!subscription) {
      // Return free plan if no subscription found
      return {
        id: '',
        userId,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return this.toDto(subscription);
  }

  async create(userId: string, data: CreateSubscriptionDto): Promise<SubscriptionDto> {
    // Cancel any existing active subscriptions
    await this.subscriptionRepository.cancelActiveSubscriptions(userId);

    // Create new subscription
    const subscription = await this.subscriptionRepository.create({
      userId,
      plan: data.plan,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      stripeSubscriptionId: data.stripeSubscriptionId,
    });

    return this.toDto(subscription);
  }

  async cancel(userId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    await this.subscriptionRepository.update(subscription.id, {
      status: SubscriptionStatus.CANCELLED,
    });
  }

  private toDto(subscription: any): SubscriptionDto {
    return {
      id: subscription.id,
      userId: subscription.userId,
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
}
