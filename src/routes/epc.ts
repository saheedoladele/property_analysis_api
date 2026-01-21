import { Router } from "express";
import { EPCController } from "../controllers/EPCController";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();
const epcController = new EPCController();

/**
 * GET /api/epc/postcode/:postcode?limit=...
 * Get EPC data by postcode (returns best match)
 */
router.get("/postcode/:postcode", asyncHandler(epcController.getByPostcode));

/**
 * GET /api/epc/all/:postcode?limit=...
 * Get all EPC records for a postcode
 */
router.get("/all/:postcode", asyncHandler(epcController.getAllByPostcode));

/**
 * GET /api/epc/address?address=...&postcode=...
 * Get EPC data by address
 */
router.get("/address", asyncHandler(epcController.getByAddress));

export default router;
