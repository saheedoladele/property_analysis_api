import { Router } from "express";
import { LandRegistryController } from "../controllers/LandRegistryController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();
const landRegistryController = new LandRegistryController();

/**
 * GET /api/land-registry/postcode?postcode=...&limit=...
 * Get sold prices and property details by postcode
 */
router.get("/postcode", asyncHandler(landRegistryController.searchByPostcode));

/**
 * GET /api/land-registry/search?postcode=...&paon=...&street=...&limit=...&minDate=...&maxDate=...
 * Search for property information by address components
 */
router.get("/search", asyncHandler(landRegistryController.search));

/**
 * GET /api/land-registry/property?postcode=...&paon=...&street=...
 * Get property information for a specific address
 */
router.get("/property", asyncHandler(landRegistryController.getProperty));

/**
 * GET /api/land-registry/most-recent?postcode=...&paon=...&street=...
 * Get the most recent sale for a property
 */
router.get("/most-recent", asyncHandler(landRegistryController.getMostRecent));

/**
 * GET /api/land-registry/comparables?postcode=...&propertyType=...&limit=...
 * Get comparable sales
 */
router.get("/comparables", asyncHandler(landRegistryController.getComparables));

export default router;
