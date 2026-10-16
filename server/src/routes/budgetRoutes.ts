import { Router } from "express";

import {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
} from "../controllers/budgetController";

import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Create budget
router.post("/", authenticateToken, createBudget);

// Get all budgets
router.get("/", authenticateToken, getBudgets);

// Get single budget
router.get("/:id", authenticateToken, getBudgetById);

// Update budget
router.put("/:id", authenticateToken, updateBudget);

// Delete budget
router.delete("/:id", authenticateToken, deleteBudget);

export default router;