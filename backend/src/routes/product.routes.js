import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductStockByLocation,
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createProduct);
router.get("/", verifyJWT, getProducts);
router.get("/:productId/stock", verifyJWT, getProductStockByLocation);

export default router;
