import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getExpenses,
  createExpense,
  updateExpenseStatus,
} from "../controllers/expenseController.js";

const router = express.Router();

router.get("/getallexpense", authMiddleware, getExpenses);
router.post("/create", authMiddleware, createExpense);
router.patch("/:id/status", authMiddleware, updateExpenseStatus);

export default router;
