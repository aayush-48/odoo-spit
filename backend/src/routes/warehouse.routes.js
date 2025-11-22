import { Router } from "express";
import {
  createWarehouse,
  getWarehouses,
  createLocation,
  getLocationsByWarehouse,
} from "../controllers/warehouse.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createWarehouse);
router.get("/", verifyJWT, getWarehouses);

router.post("/:warehouseId/locations", verifyJWT, createLocation);
router.get("/:warehouseId/locations", verifyJWT, getLocationsByWarehouse);

export default router;
