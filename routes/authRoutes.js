const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");

router.post("/register", authController.register);
router.post("/login", authController.login);

// Password reset routes
// router.post("/forgot-password", authController.forgotPassword);
// router.patch("/reset-password/:token", authController.resetPassword);

module.exports = router;
