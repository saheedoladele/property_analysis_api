import { Router } from "express";
import { AnalysisController } from "../controllers/AnalysisController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { validate } from "../middleware/validation";
import { z } from "zod";

const router = Router();
const analysisController = new AnalysisController();

// Validation schema
const createAnalysisSchema = z.object({
  propertyId: z.string().uuid().optional(),
  analysisData: z.record(z.any()),
});

const updateAnalysisSchema = z.object({
  analysisData: z.record(z.any()),
});

/**
 * GET /api/analyses
 * Get all analyses for the authenticated user
 */
router.get("/", authenticate, asyncHandler(analysisController.getAll));

/**
 * GET /api/analyses/:id
 * Get a specific analysis
 */
router.get("/:id", authenticate, asyncHandler(analysisController.getById));

/**
 * POST /api/analyses
 * Create a new analysis
 */
router.post(
  "/",
  authenticate,
  validate(createAnalysisSchema),
  asyncHandler(analysisController.create)
);

/**
 * PUT /api/analyses/:id
 * Update an analysis
 */
router.put(
  "/:id",
  authenticate,
  validate(updateAnalysisSchema),
  asyncHandler(analysisController.update)
);

/**
 * DELETE /api/analyses/:id
 * Delete an analysis
 */
router.delete("/:id", authenticate, asyncHandler(analysisController.delete));

export default router;
