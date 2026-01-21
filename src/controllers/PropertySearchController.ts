import { Request, Response } from "express";
import { PropertySearchService } from "../services/PropertySearchService.js";

export class PropertySearchController {
  private propertySearchService: PropertySearchService;

  constructor() {
    this.propertySearchService = new PropertySearchService();
  }

  /**
   * POST /api/properties/search
   * Search for property by postcode (combines Land Registry, EPC, and Postcode data)
   */
  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const { postcode, userQuery } = req.body;

      if (!postcode) {
        res.status(400).json({ error: "Postcode is required" });
        return;
      }

      const result = await this.propertySearchService.searchByPostcode(
        postcode,
        userQuery
      );

      if (!result) {
        res.status(404).json({ error: "Property not found" });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
