import express from "express";
const router = express.Router();
import { reviewController } from "../controllers/reviewController.js";

router.post("/reviews", reviewController.createReview);






export default router;