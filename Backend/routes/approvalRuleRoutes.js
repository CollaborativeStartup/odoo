import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getApprovalRules,
  createApprovalRule,
} from "../controllers/approvalRuleController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getApprovalRules);
router.post("/", createApprovalRule);

export default router;
