import express from "express";
const router = express.Router();
import {
  getCurrentUser,
  getDashboardStats,
  updateUser,
} from "../controllers/userController.js";
//import { protect, restrictTo } from "../middlewares/auth.js";

//router.use(protect);

router.get("/current-user", getCurrentUser);
router.get("/admin/app-stats", getDashboardStats);
router.patch("/update-user", updateUser);

// Patient-specific routes
// router.get("/doctors", restrictTo("patient"), userController.getAllDoctors);
// router.get(
//   "/dashboard",
//   restrictTo("patient"),
//   userController.getDashboardStats
// );

// Admin-only routes
// router.use(restrictTo("admin"));
// router.get("/", userController.getAllUsers);

export default router;
