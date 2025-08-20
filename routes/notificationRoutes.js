import express from "express";
const router = express.Router();
import { notificationController } from "../controllers/notificationController.js";

router.get("/notifications", notificationController.getNotifications);
router.put("/notifications/:id/read", notificationController.markAsRead);
router.delete("/notifications/:id", notificationController.deleteNotification);
router.post("/notifications/send", notificationController.sendNotification);


export default router;