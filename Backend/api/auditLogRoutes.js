import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createAuditLog } from "../controllers/auditLogController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/createaudit", createAuditLog);

export default router;
