import express from "express";
const router = express.Router();
import { appointmentController } from "../controllers/appointmentController.js";
//import { protect, restrictTo } from "../middlewares/auth.js";

// Protected routes
//router.use(protect);

router.post("/appointments",appointmentController.bookAppointment);
router.get("/appointments", appointmentController.getAppointments);
router.put("/appointments/:id", appointmentController.updateAppointment);
router.delete("/appointments/:id", appointmentController.cancelAppointment);
router.post("/appointments/:id/confirm", appointmentController.confirmAppointment);
router.post(
  "/appointments/:id/complete",
  appointmentController.completeAppointment
);
// router.patch("/:id/cancel", appointmentController.cancelAppointment);

// Doctor-only routes
// router.get(
//   "/doctor-schedule",
//   restrictTo("doctor"),
//   appointmentController.getDoctorSchedule
// );

// Admin-only routes
//router.use(restrictTo("admin"));
// router.get("/", appointmentController.getAllAppointments);

export default router;
