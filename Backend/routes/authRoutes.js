import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { signup, login, getUserProfile } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authMiddleware, getUserProfile);
export default router;
