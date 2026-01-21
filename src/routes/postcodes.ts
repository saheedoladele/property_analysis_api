import { Router } from "express";
import { PostcodeController } from "../controllers/PostcodeController";
import { asyncHandler } from "../middleware/errorHandler";
import { validate } from "../middleware/validation";
import { z } from "zod";

const router = Router();
const postcodeController = new PostcodeController();

// Validation schemas
const validatePostcodeSchema = z.object({
  postcode: z.string().min(1),
});

const bulkLookupSchema = z.object({
  postcodes: z.array(z.string().min(1)).min(1).max(100),
});

/**
 * POST /api/postcodes/validate
 * Validate postcode
 */
router.post(
  "/validate",
  validate(validatePostcodeSchema),
  asyncHandler(postcodeController.validate)
);

/**
 * POST /api/postcodes/bulk
 * Bulk postcode lookup
 */
router.post(
  "/bulk",
  validate(bulkLookupSchema),
  asyncHandler(postcodeController.bulkLookup)
);

/**
 * GET /api/postcodes/autocomplete?q=...
 * Autocomplete postcode suggestions
 * Must come before /:postcode route
 */
router.get("/autocomplete", asyncHandler(postcodeController.autocomplete));

/**
 * GET /api/postcodes/:postcode/nearest?radius=...&limit=...
 * Get nearest postcodes
 * Must come before /:postcode route
 */
router.get("/:postcode/nearest", asyncHandler(postcodeController.nearest));

/**
 * GET /api/postcodes/:postcode
 * Lookup full postcode details
 * Must come last to avoid catching other routes
 */
router.get("/:postcode", asyncHandler(postcodeController.lookup));

export default router;
