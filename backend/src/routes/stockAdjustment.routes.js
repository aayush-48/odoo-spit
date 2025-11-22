import { Router } from "express";
import {
  createStockAdjustment,
  getStockAdjustments,
  getStockAdjustmentById,
  updateStockAdjustment,
  cancelStockAdjustment,
  confirmStockAdjustment,
} from "../controllers/stockAdjustment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createStockAdjustment);
router.get("/", verifyJWT, getStockAdjustments);
router.get("/:id", verifyJWT, getStockAdjustmentById);
router.put("/:id", verifyJWT, updateStockAdjustment);
router.post("/:id/cancel", verifyJWT, cancelStockAdjustment);
router.post("/:id/confirm", verifyJWT, confirmStockAdjustment);

export default router;
