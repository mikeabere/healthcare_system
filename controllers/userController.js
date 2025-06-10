const User = require("../models/User.js");
const Prescription = require("../models/Prescription.js");
const Appointment = require("../models/Appointment.js");

// Get current user profile
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// Update user profile
exports.updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-password");
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// Get all doctors (for patient view)
exports.getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("-password");
    res.status(200).json(doctors);
  } catch (err) {
    next(err);
  }
};

// Get user dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = {
      appointments: await Appointment.countDocuments({ patient: req.user.id }),
      prescriptions: await Prescription.countDocuments({
        patient: req.user.id,
      }),
    };
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
};
