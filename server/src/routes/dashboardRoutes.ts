import { Router } from "express";

import {
  getDashboardSummary,
  getDashboardAnalytics,
} from "../controllers/dashboardController";

import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Dashboard summary
router.get("/", authenticateToken, getDashboardSummary);

// Dashboard analytics
router.get(
  "/analytics",
  authenticateToken,
  getDashboardAnalytics
);

export default router;