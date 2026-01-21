import { Request, Response } from "express";
import { AnalysisService } from "../services/AnalysisService.js";

export class AnalysisController {
  private analysisService: AnalysisService;

  constructor() {
    this.analysisService = new AnalysisService();
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const analyses = await this.analysisService.getAllByUserId(
        req.user!.userId
      );
      res.json(analyses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const analysis = await this.analysisService.getById(
        req.params.id as string,
        req.user!.userId
      );
      res.json(analysis);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const analysis = await this.analysisService.create(
        req.user!.userId,
        req.body
      );
      res.status(201).json(analysis);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const analysis = await this.analysisService.update(
        req.params.id as string,
        req.user!.userId,
        req.body
      );
      res.json(analysis);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.analysisService.delete(req.params.id as string, req.user!.userId);
      res.json({ message: "Analysis deleted successfully" });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };
}
