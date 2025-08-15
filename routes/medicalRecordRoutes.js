import express from "express";
const router = express.Router();
import { medicalRecordController } from "../controllers/medicalRecordController.js";

router.post("/medicalrecords", medicalRecordController.createRecord);






export default router;
