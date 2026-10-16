import { Request, Response } from "express";
import pool from "../config/db";

// CREATE BUDGET
export const createBudget = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const userId = user.id;

    const {
      category_id,
      amount,
      month,
      year,
    } = req.body || {};

    if (!amount || !month || !year) {
      return res.status(400).json({
        message:
          "Amount, month and year are required",
      });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({
        message:
          "Month must be between 1 and 12",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message:
          "Amount must be greater than 0",
      });
    }

    const result = await pool.query(
      `INSERT INTO budgets
       (user_id, category_id, amount, month, year)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        userId,
        category_id || null,
        amount,
        month,
        year,
      ]
    );

    res.status(201).json({
      message:
        "Budget created successfully",
      budget: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Create budget error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET ALL BUDGETS
export const getBudgets = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const userId = user.id;

    const result = await pool.query(
      `SELECT
        b.id,
        b.amount,
        b.month,
        b.year,
        b.created_at,
        c.name AS category,

        COALESCE(
          SUM(
            CASE
              WHEN t.type = 'expense'
              THEN t.amount
              ELSE 0
            END
          ),
          0
        ) AS spent

       FROM budgets b

       LEFT JOIN categories c
       ON b.category_id = c.id

       LEFT JOIN transactions t
       ON t.user_id = b.user_id
       AND t.type = 'expense'
       AND EXTRACT(
         MONTH FROM t.transaction_date
       ) = b.month
       AND EXTRACT(
         YEAR FROM t.transaction_date
       ) = b.year
       AND (
         b.category_id IS NULL
         OR t.category_id = b.category_id
       )

       WHERE b.user_id = $1

       GROUP BY
         b.id,
         b.amount,
         b.month,
         b.year,
         b.created_at,
         c.name

       ORDER BY
         b.year DESC,
         b.month DESC`,
      [userId]
    );

    res.json({
      message:
        "Budgets fetched successfully",

      budgets: result.rows,
    });
  } catch (error) {
    console.error(
      "Get budgets error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET ONE BUDGET
export const getBudgetById = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const userId = user.id;

    const budgetId = String(
      req.params.id
    );

    const result = await pool.query(
      `SELECT
        b.id,
        b.amount,
        b.month,
        b.year,
        b.created_at,
        c.name AS category,

        COALESCE(
          SUM(
            CASE
              WHEN t.type = 'expense'
              THEN t.amount
              ELSE 0
            END
          ),
          0
        ) AS spent

       FROM budgets b

       LEFT JOIN categories c
       ON b.category_id = c.id

       LEFT JOIN transactions t
       ON t.user_id = b.user_id
       AND t.type = 'expense'
       AND EXTRACT(
         MONTH FROM t.transaction_date
       ) = b.month
       AND EXTRACT(
         YEAR FROM t.transaction_date
       ) = b.year
       AND (
         b.category_id IS NULL
         OR t.category_id = b.category_id
       )

       WHERE
         b.id = $1
         AND b.user_id = $2

       GROUP BY
         b.id,
         b.amount,
         b.month,
         b.year,
         b.created_at,
         c.name`,
      [
        budgetId,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    res.json({
      message:
        "Budget fetched successfully",

      budget: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Get budget error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// UPDATE BUDGET
export const updateBudget = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const userId = user.id;

    const budgetId = String(
      req.params.id
    );

    const {
      category_id,
      amount,
      month,
      year,
    } = req.body || {};

    if (!amount || !month || !year) {
      return res.status(400).json({
        message:
          "Amount, month and year are required",
      });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({
        message:
          "Month must be between 1 and 12",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message:
          "Amount must be greater than 0",
      });
    }

    const result = await pool.query(
      `UPDATE budgets
       SET
         category_id = $1,
         amount = $2,
         month = $3,
         year = $4

       WHERE
         id = $5
         AND user_id = $6

       RETURNING *`,
      [
        category_id || null,
        amount,
        month,
        year,
        budgetId,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    res.json({
      message:
        "Budget updated successfully",

      budget: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update budget error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// DELETE BUDGET
export const deleteBudget = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const userId = user.id;

    const budgetId = String(
      req.params.id
    );

    const result = await pool.query(
      `DELETE FROM budgets
       WHERE
         id = $1
         AND user_id = $2
       RETURNING id`,
      [
        budgetId,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    res.json({
      message:
        "Budget deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete budget error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};