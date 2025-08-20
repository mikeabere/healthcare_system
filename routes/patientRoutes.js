import express from "express";
const router = express.Router();
import {
  patientController

} from "../controllers/patientController.js";

router.get("/patients", patientController.getPatients);
router.get("/patients/:id", patientController.getPatientById);
router.put("/patients/:id", patientController.updatePatientProfile);
router.get("/patients/history", patientController.getPatientHistory);
router.get("/patients/appointments", patientController.getPatientAppointments);


export default router;