import { Router } from "express";
import {
  createTransfer,
  getTransfers,
  confirmTransfer,
} from "../controllers/transfer.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createTransfer);
router.get("/", verifyJWT, getTransfers);
router.post("/:id/confirm", verifyJWT, confirmTransfer);

export default router;
