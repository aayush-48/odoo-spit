import { Router } from "express";
import {
  createDeliveryOrder,
  getDeliveryOrders,
  confirmDeliveryOrder,
} from "../controllers/delivery.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createDeliveryOrder);
router.get("/", verifyJWT, getDeliveryOrders);
router.post("/:id/confirm", verifyJWT, confirmDeliveryOrder);

export default router;
