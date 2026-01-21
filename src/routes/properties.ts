import { Router } from "express";
import { PropertyController } from "../controllers/PropertyController";
import { PropertySearchController } from "../controllers/PropertySearchController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { validate } from "../middleware/validation";
import { z } from "zod";

const router = Router();
const propertyController = new PropertyController();
const propertySearchController = new PropertySearchController();

// Validation schemas
const createPropertySchema = z.object({
  address: z.string().min(1),
  postcode: z.string().min(1),
  propertyType: z.string().optional(),
  tenure: z.string().optional(),
  analysisData: z.record(z.any()).optional(),
});

const updatePropertySchema = z.object({
  address: z.string().min(1).optional(),
  postcode: z.string().min(1).optional(),
  propertyType: z.string().optional(),
  tenure: z.string().optional(),
  analysisData: z.record(z.any()).optional(),
});

/**
 * POST /api/properties/search
 * Search for property by postcode (combines Land Registry, EPC, and Postcode data)
 * Public endpoint - no authentication required
 */
router.post(
  "/search",
  validate(
    z.object({
      postcode: z.string().min(1, "Postcode is required"),
      userQuery: z.string().optional(),
    })
  ),
  asyncHandler(propertySearchController.search)
);

/**
 * GET /api/properties
 * Get all properties for the authenticated user
 */
router.get("/", authenticate, asyncHandler(propertyController.getAll));

/**
 * GET /api/properties/:id
 * Get a specific property
 */
router.get("/:id", authenticate, asyncHandler(propertyController.getById));

/**
 * POST /api/properties
 * Create a new property
 */
router.post(
  "/",
  authenticate,
  validate(createPropertySchema),
  asyncHandler(propertyController.create)
);

/**
 * PUT /api/properties/:id
 * Update a property
 */
router.put(
  "/:id",
  authenticate,
  validate(updatePropertySchema),
  asyncHandler(propertyController.update)
);

/**
 * DELETE /api/properties/:id
 * Delete a property
 */
router.delete("/:id", authenticate, asyncHandler(propertyController.delete));

export default router;
