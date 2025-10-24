import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getExpenses,
  getEmployeeExpenses,
  getManagerExpenses,
  createExpense,
  updateExpenseStatus,
} from "../controllers/expenseController.js";

const router = express.Router();

router.get("/getallexpense", authMiddleware, getExpenses);
router.get("/employee", authMiddleware, getEmployeeExpenses);
router.get("/manager", authMiddleware, getManagerExpenses);
router.post("/create", authMiddleware, createExpense);
router.patch("/:id/status", authMiddleware, updateExpenseStatus);

export default router;
