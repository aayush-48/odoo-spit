import { Router } from "express";
import {
  createStockAdjustment,
  confirmStockAdjustment,
} from "../controllers/stockAdjustment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createStockAdjustment);
router.post("/:id/confirm", verifyJWT, confirmStockAdjustment);

export default router;
