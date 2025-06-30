import User from "../models/User.js";
import Prescription from"../models/Prescription.js";
import Appointment from "../models/Appointment.js";
import { StatusCodes } from "http-status-codes";


export const createUser = async (req, res) => {
  const user = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({user});
}

export const getCurrentUser = async () => {
  const user = await User.findOne({_id: req.user.userId});
  const userwithoutpassword = user.toJSON();
  res.status(200).json({userwithoutpassword});
}

export const getAllusers = async () => {
  const users = await User.find({});
  res.status(200).json({users});
}

// Get current user profile
// exports.getMe = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     res.status(200).json(user);
//   } catch (err) {
//     next(err);
//   }
// };

// Update user profile
export const updateUser = async (req, res, next) => {
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
export const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("-password");
    res.status(200).json(doctors);
  } catch (err) {
    next(err);
  }
};

// Get user dashboard stats
export const getDashboardStats = async (req, res, next) => {
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
