import { Router } from "express";
import {
  createReceipt,
  getReceipts,
  getReceiptById,
  updateReceipt,
  cancelReceipt,
  confirmReceipt,
} from "../controllers/receipt.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createReceipt);
router.get("/", verifyJWT, getReceipts);
router.get("/:id", verifyJWT, getReceiptById);
router.put("/:id", verifyJWT, updateReceipt);
router.post("/:id/cancel", verifyJWT, cancelReceipt);
router.post("/:id/confirm", verifyJWT, confirmReceipt);

export default router;
