import { Router } from "express";
import {
  getStockMovements,
  getStockMovementById,
} from "../controllers/ledger.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyJWT, getStockMovements);
router.get("/:id", verifyJWT, getStockMovementById);

export default router;

