const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController.js");
const { protect, restrictTo } = require("../middlewares/auth.js");

// Protected routes
router.use(protect);

router.post("/", restrictTo("patient"), appointmentController.bookAppointment);
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

module.exports = router;
