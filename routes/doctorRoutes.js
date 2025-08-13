import express from "express";
const router = express.Router();
import {
  doctorController

} from "../controllers/doctorController.js";

router.get("/doctors", doctorController.getDoctors);






export default router;
