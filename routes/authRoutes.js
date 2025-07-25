import express from "express";
const router = express.Router();
import {register, logout, login} from "../controllers/authController.js";
// import {
//   validateRegisterInput,
//   validateLoginInput,
// } from "../middlewares/validationMiddleware.js";

import rateLimiter from 'express-rate-limit';

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { msg: 'IP rate limit exceeded, retry in 15 minutes.' },
});

router.post("/register", apiLimiter, register);
router.post("/login", apiLimiter, login);
router.get('/logout', logout);

// Password reset routes
// router.post("/forgot-password", authController.forgotPassword);
// router.patch("/reset-password/:token", authController.resetPassword);

export default router;
