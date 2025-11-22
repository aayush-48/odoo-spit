import { Router } from "express";
import {
  createTransfer,
  getTransfers,
  getTransferById,
  updateTransfer,
  cancelTransfer,
  confirmTransfer,
} from "../controllers/transfer.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createTransfer);
router.get("/", verifyJWT, getTransfers);
router.get("/:id", verifyJWT, getTransferById);
router.put("/:id", verifyJWT, updateTransfer);
router.post("/:id/cancel", verifyJWT, cancelTransfer);
router.post("/:id/confirm", verifyJWT, confirmTransfer);

export default router;
