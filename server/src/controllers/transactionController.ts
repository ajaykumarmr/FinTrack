import { Request, Response } from "express";
import pool from "../config/db";

// CREATE TRANSACTION
export const createTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const userId = user.id;

    const {
      category_id,
      amount,
      type,
      description,
      transaction_date,
    } = req.body || {};

    // Check required fields
    if (!category_id || !amount || !type) {
      return res.status(400).json({
        message: "Category, amount and type are required",
      });
    }

    // Validate transaction type
    if (type !== "income" && type !== "expense") {
      return res.status(400).json({
        message: "Type must be income or expense",
      });
    }

    // Create transaction
    const result = await pool.query(
      `INSERT INTO transactions
       (user_id, category_id, amount, type, description, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        category_id,
        amount,
        type,
        description || null,
        transaction_date || new Date(),
      ]
    );

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error("Create transaction error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET ALL TRANSACTIONS
export const getTransactions = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const userId = user.id;

    const result = await pool.query(
      `SELECT
        t.id,
        t.amount,
        t.type,
        t.description,
        t.transaction_date,
        t.created_at,
        c.name AS category
       FROM transactions t
       LEFT JOIN categories c
       ON t.category_id = c.id
       WHERE t.user_id = $1
       ORDER BY t.transaction_date DESC`,
      [userId]
    );

    res.json({
      message: "Transactions fetched successfully",
      transactions: result.rows,
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET SINGLE TRANSACTION
export const getTransactionById = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const userId = user.id;

    const transactionId = req.params.id;

    const result = await pool.query(
      `SELECT
        t.id,
        t.amount,
        t.type,
        t.description,
        t.transaction_date,
        t.created_at,
        c.name AS category
       FROM transactions t
       LEFT JOIN categories c
       ON t.category_id = c.id
       WHERE t.id = $1 AND t.user_id = $2`,
      [transactionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json({
      message: "Transaction fetched successfully",
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error("Get transaction error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// UPDATE TRANSACTION
export const updateTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const userId = user.id;

    const transactionId = req.params.id;

    const {
      category_id,
      amount,
      type,
      description,
      transaction_date,
    } = req.body || {};

    if (!category_id || !amount || !type) {
      return res.status(400).json({
        message: "Category, amount and type are required",
      });
    }

    if (type !== "income" && type !== "expense") {
      return res.status(400).json({
        message: "Type must be income or expense",
      });
    }

    const result = await pool.query(
      `UPDATE transactions
       SET
         category_id = $1,
         amount = $2,
         type = $3,
         description = $4,
         transaction_date = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        category_id,
        amount,
        type,
        description || null,
        transaction_date || new Date(),
        transactionId,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json({
      message: "Transaction updated successfully",
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error("Update transaction error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// DELETE TRANSACTION
export const deleteTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const userId = user.id;

    const transactionId = req.params.id;

    const result = await pool.query(
      `DELETE FROM transactions
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [transactionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};