import { Request, Response } from "express";
import { EPCService } from "../services/EPCService.js";

export class EPCController {
  private epcService: EPCService;

  constructor() {
    this.epcService = new EPCService();
  }

  /**
   * GET /api/epc/postcode/:postcode?limit=...
   * Get EPC data by postcode
   */
  getByPostcode = async (req: Request, res: Response): Promise<void> => {
    try {
      const postcode = req.params.postcode as string;
      const limit = parseInt(req.query.limit as string) || 10;

      const epcData = await this.epcService.getEPCByPostcode(postcode, limit);

      if (!epcData) {
        res.status(404).json({ error: "No EPC data found for this postcode" });
        return;
      }

      res.json(epcData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * GET /api/epc/all/:postcode?limit=...
   * Get all EPC records for a postcode
   */
  getAllByPostcode = async (req: Request, res: Response): Promise<void> => {
    try {
      const postcode = req.params.postcode as string;
      const limit = parseInt(req.query.limit as string) || 50;

      const epcRecords = await this.epcService.getAllEPCByPostcode(postcode, limit);

      res.json({
        postcode,
        count: epcRecords.length,
        records: epcRecords,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * GET /api/epc/address?address=...&postcode=...
   * Get EPC data by address
   */
  getByAddress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { address, postcode } = req.query;

      if (!address || !postcode) {
        res.status(400).json({
          error: "Both address and postcode are required",
        });
        return;
      }

      const epcData = await this.epcService.getEPCByAddress(
        address as string,
        postcode as string
      );

      if (!epcData) {
        res.status(404).json({ error: "No EPC data found for this address" });
        return;
      }

      res.json(epcData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
