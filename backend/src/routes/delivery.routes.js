import { Router } from "express";
import {
  createDeliveryOrder,
  getDeliveryOrders,
  getDeliveryOrderById,
  updateDeliveryOrder,
  pickDeliveryOrder,
  packDeliveryOrder,
  cancelDeliveryOrder,
  confirmDeliveryOrder,
} from "../controllers/delivery.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createDeliveryOrder);
router.get("/", verifyJWT, getDeliveryOrders);
router.get("/:id", verifyJWT, getDeliveryOrderById);
router.put("/:id", verifyJWT, updateDeliveryOrder);
router.post("/:id/pick", verifyJWT, pickDeliveryOrder);
router.post("/:id/pack", verifyJWT, packDeliveryOrder);
router.post("/:id/cancel", verifyJWT, cancelDeliveryOrder);
router.post("/:id/confirm", verifyJWT, confirmDeliveryOrder);

export default router;
