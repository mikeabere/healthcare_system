import Doctor from "../models/DoctorModel.js";
import User from "../models/UserModel.js";
import Appointment from "../models/AppointmentModel.js";
import TimeSlot from "../models/TimeSlotModel.js";

export const doctorController = {
  // Get all doctors
  getDoctors: async (req, res) => {
    try {
      const { specialization, page = 1, limit = 10, search } = req.query;

      let query = {};
      if (specialization) {
        query.specialization = { $regex: specialization, $options: "i" };
      }

      const doctors = await Doctor.find(query)
        .populate("userId", "firstName lastName email phone profileImage")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ rating: -1 });

      // Filter by search if provided
      let filteredDoctors = doctors;
      if (search) {
        filteredDoctors = doctors.filter(
          (doctor) =>
            doctor.userId.firstName
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            doctor.userId.lastName
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            doctor.specialization.toLowerCase().includes(search.toLowerCase())
        );
      }

      const total = await Doctor.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          doctors: filteredDoctors,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching doctors",
        error: error.message,
      });
    }
  },

  // Get doctor by ID
  getDoctorById: async (req, res) => {
    try {
      const doctor = await Doctor.findById(req.params.id).populate(
        "userId",
        "firstName lastName email phone profileImage"
      );

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      // Get available time slots for next 7 days
      const timeSlots = await TimeSlot.find({
        doctorId: doctor._id,
        date: { $gte: new Date() },
        isAvailable: true,
        isBooked: false,
      }).limit(20);

      res.status(200).json({
        success: true,
        data: {
          doctor,
          availableSlots: timeSlots,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching doctor",
        error: error.message,
      });
    }
  },

  // Update doctor profile
  updateDoctorProfile: async (req, res) => {
    try {
      const {
        specialization,
        licenseNumber,
        experience,
        consultationFee,
        biography,
        education,
        languages,
      } = req.body;

      const updateData = {};
      if (specialization) updateData.specialization = specialization;
      if (licenseNumber) updateData.licenseNumber = licenseNumber;
      if (experience) updateData.experience = experience;
      if (consultationFee) updateData.consultationFee = consultationFee;
      if (biography) updateData.biography = biography;
      if (education) updateData.education = education;
      if (languages) updateData.languages = languages;

      const doctor = await Doctor.findOneAndUpdate(
        { userId: req.user.userId },
        updateData,
        { new: true, runValidators: true }
      ).populate("userId", "firstName lastName email phone");

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Doctor profile updated successfully",
        data: doctor,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while updating doctor profile",
        error: error.message,
      });
    }
  },

  // Set availability
  setAvailability: async (req, res) => {
    try {
      const { date, timeSlots } = req.body;

      const doctor = await Doctor.findOne({ userId: req.user.userId });
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }

      // Remove existing time slots for the date
      await TimeSlot.deleteMany({
        doctorId: doctor._id,
        date: new Date(date),
      });

      // Create new time slots
      const newTimeSlots = timeSlots.map((slot) => ({
        doctorId: doctor._id,
        date: new Date(date),
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: true,
        isBooked: false,
      }));

      await TimeSlot.insertMany(newTimeSlots);

      res.status(200).json({
        success: true,
        message: "Availability set successfully",
        data: newTimeSlots,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while setting availability",
        error: error.message,
      });
    }
  },

  // Get doctor appointments
  getDoctorAppointments: async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;

      const doctor = await Doctor.findOne({ userId: req.user.userId });
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }

      let query = { doctorId: doctor._id };
      if (status) {
        query.status = status;
      }

      const appointments = await Appointment.find(query)
        .populate("patientId", "firstName lastName email phone")
        .populate("doctorId", "specialization consultationFee")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ appointmentDate: 1 });

      const total = await Appointment.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          appointments,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching appointments",
        error: error.message,
      });
    }
  },

  // Get doctor statistics
  getDoctorStats: async (req, res) => {
    try {
      const doctor = await Doctor.findOne({ userId: req.user.userId });
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }

      const totalAppointments = await Appointment.countDocuments({
        doctorId: doctor._id,
      });
      const completedAppointments = await Appointment.countDocuments({
        doctorId: doctor._id,
        status: "completed",
      });
      const pendingAppointments = await Appointment.countDocuments({
        doctorId: doctor._id,
        status: "pending",
      });
      const cancelledAppointments = await Appointment.countDocuments({
        doctorId: doctor._id,
        status: "cancelled",
      });

      // Revenue calculation (this month)
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );
      const monthlyRevenue = await Appointment.aggregate([
        {
          $match: {
            doctorId: doctor._id,
            status: "completed",
            appointmentDate: { $gte: startOfMonth },
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctor",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $arrayElemAt: ["$doctor.consultationFee", 0] } },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalAppointments,
          completedAppointments,
          pendingAppointments,
          cancelledAppointments,
          monthlyRevenue: monthlyRevenue[0]?.total || 0,
          rating: doctor.rating,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching doctor statistics",
        error: error.message,
      });
    }
  },
};
