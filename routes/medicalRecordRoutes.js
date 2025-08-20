import express from "express";
const router = express.Router();
import { medicalRecordController } from "../controllers/medicalRecordController.js";

router.post("/medicalrecords", medicalRecordController.createRecord);
router.get("/medicalrecords", medicalRecordController.getRecords);
router.put("/medicalrecords/:id", medicalRecordController.updateRecord);
router.delete("/medicalrecords/:id", medicalRecordController.deleteRecord);
router.get("/medicalrecords/patient/:id", medicalRecordController.getPatientRecords);



export default router;
