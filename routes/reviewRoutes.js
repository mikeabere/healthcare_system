import express from "express";
const router = express.Router();
import { reviewController } from "../controllers/reviewController.js";

router.post("/reviews", reviewController.createReview);
router.get("/reviews", reviewController.getReviews);
router.put("/reviews/:id", reviewController.updateReview);
router.delete("/reviews/:id", reviewController.deleteReview);
router.get("/reviews/doctor/:id", reviewController.getDoctorReviews);


export default router;