import express from "express";
import cors from "cors";
import pool from "./config/db";
import authRoutes from "./routes/authRoutes";
import { authenticateToken } from "./middleware/authMiddleware";
import transactionRoutes from "./routes/transactionRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import categoryRoutes from "./routes/categoryRoutes";

const app = express();

app.use(cors());

// Read JSON data from Postman/Frontend
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "FinTrack API is running",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "You have access to this protected route",
    user: (req as any).user,
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`FinTrack server running on http://localhost:${PORT}`);
});