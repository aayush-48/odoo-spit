import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductStockByLocation,
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createProduct);
router.get("/", verifyJWT, getProducts);
router.get("/:productId", verifyJWT, getProductById);
router.put("/:productId", verifyJWT, updateProduct);
router.delete("/:productId", verifyJWT, deleteProduct);
router.get("/:productId/stock", verifyJWT, getProductStockByLocation);

export default router;
