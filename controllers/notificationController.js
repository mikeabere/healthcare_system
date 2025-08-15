import Notification from "../models/NotificationModel.js";

export const notificationController = {
  // Get notifications
  getNotifications: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;

      const notifications = await Notification.find({ userId: req.user.userId })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const unreadCount = await Notification.countDocuments({
        userId: req.user.userId,
        isRead: false,
      });

      const total = await Notification.countDocuments({
        userId: req.user.userId,
      });

      res.status(200).json({
        success: true,
        data: {
          notifications,
          unreadCount,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching notifications",
        error: error.message,
      });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;

      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while marking notification as read",
        error: error.message,
      });
    }
  },

  // Delete notification
  deleteNotification: async (req, res) => {
    try {
      const { id } = req.params;

      const notification = await Notification.findOneAndDelete({
        _id: id,
        userId: req.user.userId,
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while deleting notification",
        error: error.message,
      });
    }
  },

  // Send notification (system/admin use)
  sendNotification: async (req, res) => {
    try {
      const { userId, title, message, type } = req.body;

      // Check if user is admin
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only admins can send notifications",
        });
      }

      const notification = new Notification({
        userId,
        title,
        message,
        type: type || "info",
        isRead: false,
      });

      await notification.save();

      res.status(201).json({
        success: true,
        message: "Notification sent successfully",
        data: notification,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while sending notification",
        error: error.message,
      });
    }
  },
};
