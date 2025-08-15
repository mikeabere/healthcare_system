import express from "express";
const router = express.Router();
import { notificationController } from "../controllers/notificationController.js";

router.get("/notifications", notificationController.getNotifications);






export default router;