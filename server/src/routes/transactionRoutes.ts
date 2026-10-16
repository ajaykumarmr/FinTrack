import { Router } from "express";
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController";

import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Create transaction
router.post("/", authenticateToken, createTransaction);

// Get all transactions
router.get("/", authenticateToken, getTransactions);

// Get single transaction
router.get("/:id", authenticateToken, getTransactionById);

// Update transaction
router.put("/:id", authenticateToken, updateTransaction);

// Delete transaction
router.delete("/:id", authenticateToken, deleteTransaction);

export default router;