import { Request, Response } from 'express';
import { SubscriptionService } from '../services/SubscriptionService.js';

export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  get = async (req: Request, res: Response): Promise<void> => {
    try {
      const subscription = await this.subscriptionService.getByUserId(req.user!.userId);
      res.json(subscription);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const subscription = await this.subscriptionService.create(req.user!.userId, req.body);
      res.status(201).json(subscription);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  cancel = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.subscriptionService.cancel(req.user!.userId);
      res.json({ message: 'Subscription cancelled successfully' });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };
}
