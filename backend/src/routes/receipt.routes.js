import { Router } from "express";
import {
  createReceipt,
  getReceipts,
  confirmReceipt,
} from "../controllers/receipt.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createReceipt);
router.get("/", verifyJWT, getReceipts);
router.post("/:id/confirm", verifyJWT, confirmReceipt);

export default router;
