import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getCategories,
  createCategory,
  updateCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCategories);
router.post("/", createCategory);
router.patch("/:id", updateCategory);

export default router;
