import express from "express";
const router = express.Router();
import {register, login} from "../controllers/authController.js";

router.post("/register",register);
router.post("/login", login);

// Password reset routes
// router.post("/forgot-password", authController.forgotPassword);
// router.patch("/reset-password/:token", authController.resetPassword);

export default router;
