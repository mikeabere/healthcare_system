import express from "express";
const router = express.Router();
import {
  patientController

} from "../controllers/patientController.js";

router.get("/patients", patientController.getPatients);






export default router;