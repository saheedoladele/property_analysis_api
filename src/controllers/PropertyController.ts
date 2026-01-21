import { Request, Response } from 'express';
import { PropertyService } from '../services/PropertyService';

export class PropertyController {
  private propertyService: PropertyService;

  constructor() {
    this.propertyService = new PropertyService();
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const properties = await this.propertyService.getAllByUserId(req.user!.userId);
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const property = await this.propertyService.getById(req.params.id as string, req.user!.userId);
      res.json(property);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const property = await this.propertyService.create(req.user!.userId, req.body);
      res.status(201).json(property);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const property = await this.propertyService.update(
        req.params.id as string,
        req.user!.userId,
        req.body
      );
      res.json(property);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.propertyService.delete(req.params.id as string, req.user!.userId);
      res.json({ message: 'Property deleted successfully' });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };
}
