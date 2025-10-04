import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getApprovalActions,
  createApprovalAction,
} from "../controllers/approvalActionController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/:expenseId", getApprovalActions);
router.post("/", createApprovalAction);

export default router;
