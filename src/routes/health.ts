import { Router } from "express";
import { HealthController } from "../controllers/HealthController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();
const healthController = new HealthController();

/**
 * GET /api/health
 * Comprehensive health check with all service statuses
 */
router.get("/", asyncHandler(healthController.check));

/**
 * GET /api/health/live
 * Liveness probe - simple check if server is running
 */
router.get("/live", asyncHandler(healthController.liveness));

/**
 * GET /api/health/ready
 * Readiness probe - check if server is ready to accept requests
 */
router.get("/ready", asyncHandler(healthController.readiness));

export default router;
