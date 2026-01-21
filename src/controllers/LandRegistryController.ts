import { Request, Response } from "express";
import { LandRegistryService } from "../services/LandRegistryService.js";

export class LandRegistryController {
  private landRegistryService: LandRegistryService;

  constructor() {
    this.landRegistryService = new LandRegistryService();
  }

  /**
   * GET /api/land-registry/postcode?postcode=...&limit=...
   * Get sold prices and property details by postcode
   */
  searchByPostcode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { postcode, limit } = req.query;

      if (
        !postcode ||
        typeof postcode !== "string" ||
        postcode.trim().length === 0
      ) {
        res.status(400).json({ error: "Postcode is required" });
        return;
      }

      const searchLimit = limit ? parseInt(limit as string) : 100;
      const cleanPostcode = postcode.trim().replace(/\s+/g, "").toUpperCase();

      const records = await this.landRegistryService.getSoldPricesByPostcode(
        cleanPostcode,
        searchLimit
      );

      res.json({
        postcode: cleanPostcode,
        count: records.length,
        records,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * GET /api/land-registry/search?postcode=...&paon=...&street=...&limit=...&minDate=...&maxDate=...
   * Search for property information by address components
   */
  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const { postcode, paon, street, limit, minDate, maxDate } = req.query;

      if (!postcode && !paon && !street) {
        res.status(400).json({
          error: "At least one of postcode, paon, or street must be provided",
        });
        return;
      }

      const records = await this.landRegistryService.searchByAddress({
        postcode: postcode as string | undefined,
        paon: paon as string | undefined,
        street: street as string | undefined,
        limit: limit ? parseInt(limit as string) : 100,
        minDate: minDate as string | undefined,
        maxDate: maxDate as string | undefined,
      });

      res.json({
        count: records.length,
        records,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * GET /api/land-registry/property?postcode=...&paon=...&street=...
   * Get property information for a specific address
   */
  getProperty = async (req: Request, res: Response): Promise<void> => {
    try {
      const { postcode, paon, street, limit } = req.query;

      if (!postcode) {
        res.status(400).json({ error: "Postcode is required" });
        return;
      }

      const records = await this.landRegistryService.getPropertyByAddress(
        postcode as string,
        paon as string | undefined,
        street as string | undefined,
        limit ? parseInt(limit as string) : 50
      );

      res.json({
        count: records.length,
        records,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * GET /api/land-registry/most-recent?postcode=...&paon=...&street=...
   * Get the most recent sale for a property
   */
  getMostRecent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { postcode, paon, street } = req.query;

      if (!postcode) {
        res.status(400).json({ error: "Postcode is required" });
        return;
      }

      const record = await this.landRegistryService.getMostRecentSale(
        postcode as string,
        paon as string | undefined,
        street as string | undefined
      );

      if (!record) {
        res.status(404).json({ error: "No sale records found" });
        return;
      }

      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * GET /api/land-registry/comparables?postcode=...&propertyType=...&limit=...
   * Get comparable sales
   */
  getComparables = async (req: Request, res: Response): Promise<void> => {
    try {
      const { postcode, propertyType, limit } = req.query;

      if (!postcode) {
        res.status(400).json({ error: "Postcode is required" });
        return;
      }

      const records = await this.landRegistryService.getComparableSales(
        postcode as string,
        propertyType as string | undefined,
        limit ? parseInt(limit as string) : 20
      );

      res.json({
        postcode,
        propertyType: propertyType || "all",
        count: records.length,
        records,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
