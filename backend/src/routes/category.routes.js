import { Router } from "express";
import {
  createCategory,
  getCategories,
} from "../controllers/category.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createCategory);
router.get("/", verifyJWT, getCategories);

export default router;
