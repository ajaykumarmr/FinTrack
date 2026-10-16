import { Request, Response } from "express";
import pool from "../config/db";

export const getCategories = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        name,
        type,
        created_at
       FROM categories
       ORDER BY id ASC`
    );

    res.json({
      message: "Categories fetched successfully",
      categories: result.rows,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};