import express from "express";
const router = express.Router();
import {bookAppointment} from "../controllers/appointmentController.js";
import { protect, restrictTo } from "../middlewares/auth.js";

// Protected routes
router.use(protect);

router.post("/", restrictTo("patient"),bookAppointment);
// router.get("/my-appointments", appointmentController.getMyAppointments);
// router.patch("/:id/cancel", appointmentController.cancelAppointment);

// Doctor-only routes
// router.get(
//   "/doctor-schedule",
//   restrictTo("doctor"),
//   appointmentController.getDoctorSchedule
// );

// Admin-only routes
router.use(restrictTo("admin"));
// router.get("/", appointmentController.getAllAppointments);

export default router;
