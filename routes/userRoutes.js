const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const { protect, restrictTo } = require("../middlewares/auth.js");

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

module.exports = router;
