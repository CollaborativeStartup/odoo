import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import connectDB from "./db/db.js";
dotenv.config();

import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import approvalRuleRoutes from "./routes/approvalRuleRoutes.js";
import approvalActionRoutes from "./routes/approvalActionRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
connectDB();

app.get("/", (req, res) => {
  res.send("Welcome to Expense Manager server");
});

app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/approval-rules", approvalRuleRoutes);
app.use("/api/approval-actions", approvalActionRoutes);
app.use("/api/auditlogs", auditLogRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server is running on port 5000");
});
