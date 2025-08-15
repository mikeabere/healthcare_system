import Review from "../models/ReviewModel.js";
import Appointment from "../models/AppointmentModel.js";
//import Doctor from '../models/DoctorModel.js';
import Patient from '../models/PatientModel.js';

export const reviewController = {
  // Create review
  createReview: async (req, res) => {
    try {
      const { doctorId, appointmentId, rating, comment } = req.body;

      // Check if user is patient
      const patient = await Patient.findOne({ userId: req.user.userId });
      if (!patient) {
        return res.status(403).json({
          success: false,
          message: "Only patients can create reviews",
        });
      }

      // Check if appointment exists and is completed
      const appointment = await Appointment.findById(appointmentId);
      if (
        !appointment ||
        appointment.status !== "completed" ||
        appointment.patientId.toString() !== patient._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid appointment or appointment not completed",
        });
      }

      // Check if review already exists
      const existingReview = await Review.findOne({
        patientId: patient._id,
        appointmentId,
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: "Review already exists for this appointment",
        });
      }

      const review = new Review({
        patientId: patient._id,
        doctorId,
        appointmentId,
        rating,
        comment,
      });

      await review.save();

      // Update doctor's average rating
      await updateDoctorRating(doctorId);

      const populatedReview = await Review.findById(review._id)
        .populate("patientId", "firstName lastName")
        .populate({
          path: "doctorId",
          populate: {
            path: "userId",
            select: "firstName lastName",
          },
        });

      res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: populatedReview,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while creating review",
        error: error.message,
      });
    }
  },

  // Get reviews
  getReviews: async (req, res) => {
    try {
      const { doctorId, page = 1, limit = 10 } = req.query;

      let query = {};
      if (doctorId) {
        query.doctorId = doctorId;
      }

      const reviews = await Review.find(query)
        .populate("patientId", "firstName lastName")
        .populate({
          path: "doctorId",
          populate: {
            path: "userId",
            select: "firstName lastName",
          },
          select: "specialization",
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Review.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          reviews,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching reviews",
        error: error.message,
      });
    }
  },

  // Update review
  updateReview: async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      // Check authorization
      const patient = await Patient.findOne({ userId: req.user.userId });
      if (!patient || review.patientId.toString() !== patient._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this review",
        });
      }

      // Update fields
      if (rating) review.rating = rating;
      if (comment) review.comment = comment;

      await review.save();

      // Update doctor's average rating
      await updateDoctorRating(review.doctorId);

      const updatedReview = await Review.findById(id)
        .populate("patientId", "firstName lastName")
        .populate({
          path: "doctorId",
          populate: {
            path: "userId",
            select: "firstName lastName",
          },
        });

      res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: updatedReview,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while updating review",
        error: error.message,
      });
    }
  },

  // Delete review
  deleteReview: async (req, res) => {
    try {
      const { id } = req.params;

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      // Check authorization
      const patient = await Patient.findOne({ userId: req.user.userId });
      const isAuthorized =
        (patient && review.patientId.toString() === patient._id.toString()) ||
        req.user.role === "admin";

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this review",
        });
      }

      const doctorId = review.doctorId;
      await Review.findByIdAndDelete(id);

      // Update doctor's average rating
      await updateDoctorRating(doctorId);

      res.status(200).json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while deleting review",
        error: error.message,
      });
    }
  },

  // Get doctor reviews
  getDoctorReviews: async (req, res) => {
    try {
      const { id } = req.params; // Doctor ID
      const { page = 1, limit = 10 } = req.query;

      const reviews = await Review.find({ doctorId: id })
        .populate("patientId", "firstName lastName")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Review.countDocuments({ doctorId: id });

      // Get rating statistics
      const ratingStats = await Review.aggregate([
        { $match: { doctorId: mongoose.Types.ObjectId(id) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
            fiveStars: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
            fourStars: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
            threeStars: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
            twoStars: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
            oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        data: {
          reviews,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total,
          ratingStats: ratingStats[0] || {
            averageRating: 0,
            totalReviews: 0,
            fiveStars: 0,
            fourStars: 0,
            threeStars: 0,
            twoStars: 0,
            oneStar: 0,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching doctor reviews",
        error: error.message,
      });
    }
  },
};

// Helper function to update doctor rating
async function updateDoctorRating(doctorId) {
  const result = await Review.aggregate([
    { $match: { doctorId: mongoose.Types.ObjectId(doctorId) } },
    { $group: { _id: null, averageRating: { $avg: "$rating" } } },
  ]);

  const averageRating = result[0] ? result[0].averageRating : 0;
  await Doctor.findByIdAndUpdate(doctorId, { rating: averageRating });
}
