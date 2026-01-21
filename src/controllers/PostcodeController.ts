import { Request, Response } from "express";
import { PostcodeService } from "../services/PostcodeService";

export class PostcodeController {
  private postcodeService: PostcodeService;

  constructor() {
    this.postcodeService = new PostcodeService();
  }

  /**
   * GET /api/postcodes/autocomplete?q=...
   * Autocomplete postcode suggestions
   */
  autocomplete = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length < 2) {
        res.json([]);
        return;
      }

      const results = await this.postcodeService.autocompletePostcode(query);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * GET /api/postcodes/:postcode
   * Lookup full postcode details
   */
  lookup = async (req: Request, res: Response): Promise<void> => {
    try {
      const postcode = req.params.postcode as string;
      const result = await this.postcodeService.lookupPostcode(postcode);

      if (!result) {
        res.status(404).json({ error: "Postcode not found" });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * POST /api/postcodes/validate
   * Validate postcode
   */
  validate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { postcode } = req.body;
      if (!postcode) {
        res.status(400).json({ error: "Postcode is required" });
        return;
      }

      const isValid = await this.postcodeService.validatePostcode(postcode);
      res.json({ valid: isValid, postcode });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * POST /api/postcodes/bulk
   * Bulk postcode lookup
   */
  bulkLookup = async (req: Request, res: Response): Promise<void> => {
    try {
      const { postcodes } = req.body;
      if (!Array.isArray(postcodes) || postcodes.length === 0) {
        res.status(400).json({ error: "Postcodes array is required" });
        return;
      }

      if (postcodes.length > 100) {
        res.status(400).json({ error: "Maximum 100 postcodes allowed per request" });
        return;
      }

      const results = await this.postcodeService.bulkLookupPostcodes(postcodes);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * GET /api/postcodes/:postcode/nearest?radius=...&limit=...
   * Get nearest postcodes
   */
  nearest = async (req: Request, res: Response): Promise<void> => {
    try {
      const postcode = req.params.postcode as string;
      const radius = parseInt(req.query.radius as string) || 1000;
      const limit = parseInt(req.query.limit as string) || 10;

      const results = await this.postcodeService.getNearestPostcodes(
        postcode,
        radius,
        limit
      );

      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
