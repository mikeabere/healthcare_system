import express from "express";
const router = express.Router();
import userController from "../controllers/userController.js";
import { protect, restrictTo } from "../middlewares/auth.js";

router.use(protect);

router.get("/me", userController.getMe);
router.patch("/update-me", userController.updateUser);

// Patient-specific routes
router.get("/doctors", restrictTo("patient"), userController.getAllDoctors);
router.get(
  "/dashboard",
  restrictTo("patient"),
  userController.getDashboardStats
);

// Admin-only routes
router.use(restrictTo("admin"));
router.get("/", userController.getAllUsers);

export default router;
