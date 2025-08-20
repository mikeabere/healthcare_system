import express from "express";
const router = express.Router();
import {
  doctorController

} from "../controllers/doctorController.js";

router.get("/doctors", doctorController.getDoctors);
router.get("/doctors/:id", doctorController.getDoctorById);
router.put("/doctors/:id", doctorController.updateDoctorProfile);
router.post("/doctors/availability", doctorController.setAvailability);
router.get("/doctors/appointments", doctorController.getDoctorAppointments);
router.get("/doctors/stats", doctorController.getDoctorStats);


export default router;
