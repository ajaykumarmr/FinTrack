import { Request, Response } from "express";
import pool from "../config/db";

/*
  GET /api/dashboard

  Returns:
  - Total income
  - Total expenses
  - Balance
  - Transaction count
*/
export const getDashboardSummary = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;

    const result = await pool.query(
      `
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN type = 'income' THEN amount
              ELSE 0
            END
          ),
          0
        ) AS "totalIncome",

        COALESCE(
          SUM(
            CASE
              WHEN type = 'expense' THEN amount
              ELSE 0
            END
          ),
          0
        ) AS "totalExpenses",

        COUNT(*) AS "transactionCount"

      FROM transactions
      WHERE user_id = $1
      `,
      [userId]
    );

    const data = result.rows[0];

    const totalIncome = Number(data.totalIncome || 0);
    const totalExpenses = Number(
      data.totalExpenses || 0
    );

    const balance = totalIncome - totalExpenses;

    res.json({
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: Number(
        data.transactionCount || 0
      ),
    });
  } catch (error) {
    console.error(
      "Dashboard summary error:",
      error
    );

    res.status(500).json({
      message: "Failed to load dashboard summary",
    });
  }
};


/*
  GET /api/dashboard/analytics

  Returns:
  - Income vs expenses
  - Expenses by category
  - Monthly overview
  - Recent transactions
*/
export const getDashboardAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;

    /*
      1. Income vs Expenses by month
    */
    const incomeExpenseResult =
      await pool.query(
        `
        SELECT
          TO_CHAR(
            DATE_TRUNC('month', transaction_date),
            'Mon YYYY'
          ) AS month,

          COALESCE(
            SUM(
              CASE
                WHEN type = 'income'
                THEN amount
                ELSE 0
              END
            ),
            0
          ) AS income,

          COALESCE(
            SUM(
              CASE
                WHEN type = 'expense'
                THEN amount
                ELSE 0
              END
            ),
            0
          ) AS expenses

        FROM transactions

        WHERE user_id = $1

        GROUP BY DATE_TRUNC(
          'month',
          transaction_date
        )

        ORDER BY DATE_TRUNC(
          'month',
          transaction_date
        );
        `,
        [userId]
      );

    /*
      2. Expenses by category
    */
    const categoryResult =
      await pool.query(
        `
        SELECT
          COALESCE(
            c.name,
            'Uncategorized'
          ) AS category,

          COALESCE(
            SUM(t.amount),
            0
          ) AS amount

        FROM transactions t

        LEFT JOIN categories c
          ON t.category_id = c.id

        WHERE
          t.user_id = $1
          AND t.type = 'expense'

        GROUP BY c.name

        ORDER BY amount DESC;
        `,
        [userId]
      );

    /*
      3. Monthly overview
    */
    const monthlyResult =
      await pool.query(
        `
        SELECT
          TO_CHAR(
            DATE_TRUNC('month', transaction_date),
            'Mon YYYY'
          ) AS month,

          COALESCE(
            SUM(
              CASE
                WHEN type = 'income'
                THEN amount
                ELSE 0
              END
            ),
            0
          ) AS income,

          COALESCE(
            SUM(
              CASE
                WHEN type = 'expense'
                THEN amount
                ELSE 0
              END
            ),
            0
          ) AS expenses

        FROM transactions

        WHERE user_id = $1

        GROUP BY DATE_TRUNC(
          'month',
          transaction_date
        )

        ORDER BY DATE_TRUNC(
          'month',
          transaction_date
        );
        `,
        [userId]
      );

    /*
      4. Recent transactions
    */
    const recentResult =
      await pool.query(
        `
        SELECT
          t.id,
          t.amount,
          t.type,
          t.description,
          t.transaction_date,
          COALESCE(
            c.name,
            'Uncategorized'
          ) AS category

        FROM transactions t

        LEFT JOIN categories c
          ON t.category_id = c.id

        WHERE t.user_id = $1

        ORDER BY
          t.transaction_date DESC,
          t.id DESC

        LIMIT 10;
        `,
        [userId]
      );

    res.json({
      incomeExpense:
        incomeExpenseResult.rows.map(
          (row) => ({
            month: row.month,
            income: Number(row.income || 0),
            expenses: Number(
              row.expenses || 0
            ),
          })
        ),

      expensesByCategory:
        categoryResult.rows.map(
          (row) => ({
            category: row.category,
            amount: Number(row.amount || 0),
          })
        ),

      monthly:
        monthlyResult.rows.map(
          (row) => ({
            month: row.month,
            income: Number(row.income || 0),
            expenses: Number(
              row.expenses || 0
            ),
          })
        ),

      recentTransactions:
        recentResult.rows.map(
          (row) => ({
            id: row.id,
            amount: Number(row.amount || 0),
            type: row.type,
            description:
              row.description,
            transaction_date:
              row.transaction_date,
            category:
              row.category,
          })
        ),
    });
  } catch (error) {
    console.error(
      "Dashboard analytics error:",
      error
    );

    res.status(500).json({
      message: "Failed to load dashboard analytics",
    });
  }
};