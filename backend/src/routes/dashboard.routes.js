import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/summary", verifyJWT, getDashboardSummary);

export default router;
