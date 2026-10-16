import { Router } from "express";

import { getCategories } from "../controllers/categoryController";

import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/",
  authenticateToken,
  getCategories
);

export default router;