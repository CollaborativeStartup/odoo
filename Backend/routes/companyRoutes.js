import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getCompany, updateCompany } from "../controllers/companyController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCompany);
router.patch("/", updateCompany);

export default router;
