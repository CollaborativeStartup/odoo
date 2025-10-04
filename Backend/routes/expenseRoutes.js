import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getExpenses,
  createExpense,
  updateExpenseStatus,
} from "../controllers/expenseController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getExpenses);
router.post("/", createExpense);
router.patch("/:id/status", updateExpenseStatus);

export default router;
