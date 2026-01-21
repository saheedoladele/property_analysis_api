import { Request, Response } from 'express';
import { DealAuditService } from '../services/DealAuditService';

export class DealAuditController {
  private dealAuditService: DealAuditService;

  constructor() {
    this.dealAuditService = new DealAuditService();
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const dealAudit = await this.dealAuditService.create(req.body);
      res.status(201).json({
        message: 'Deal audit booking submitted successfully',
        id: dealAudit.id,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
