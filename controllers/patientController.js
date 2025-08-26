
import Patient from "../models/PatientModel.js";
import Appointment from "../models/AppointmentModel.js";
import MedicalRecord from "../models/MedicalRecordModel.js";
//import { useId } from "react";

export const patientController = {
  // Get all patients (for doctors/admin)
  getPatients: async (req, res) => {
    try {
      const { page = 1, limit = 10, search } = req.query;

      let query = {};
      const patients = await Patient.find(query)
        .populate("userId", "firstName lastName email phone profileImage")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      // Filter by search if provided
      let filteredPatients = patients;
      if (search) {
        filteredPatients = patients.filter(
          (patient) =>
            patient.userId.firstName
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            patient.userId.lastName
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            patient.userId.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      const total = await Patient.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          patients: filteredPatients,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching patients",
        error: error.message,
      });
    }
  },

  // Get patient by ID
  getPatientById: async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id).populate(
        "userId",
        "firstName lastName email phone profileImage"
      );

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      res.status(200).json({
        success: true,
        data: patient,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching patient",
        error: error.message,
      });
    }
  },

  // Update patient profile
  updatePatientProfile: async (req, res) => {
    try {
      const {
        dateOfBirth,
        gender,
        bloodGroup,
        allergies,
        emergencyContact,
        medicalHistory,
        insuranceInfo,
      } = req.body;

      const updateData = {};
      if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
      if (gender) updateData.gender = gender;
      if (bloodGroup) updateData.bloodGroup = bloodGroup;
      if (allergies) updateData.allergies = allergies;
      if (emergencyContact) updateData.emergencyContact = emergencyContact;
      if (medicalHistory) updateData.medicalHistory = medicalHistory;
      if (insuranceInfo) updateData.insuranceInfo = insuranceInfo;

      const patient = await Patient.findOneAndUpdate(
        { userId: req.user.userId }, //user id problem
        updateData,
        { new: true, runValidators: true }
      ).populate("userId", "firstName lastName email phone");

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Patient profile updated successfully",
        data: patient,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while updating patient profile",
        error: error.message,
      });
      
    }
  },

  // Get patient medical history
  getPatientHistory: async (req, res) => {
    try {
      const patient = await Patient.findOne({ userId: req.user.userId });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found",
        });
      }

      // Get medical records
      
      const medicalRecords = await MedicalRecord.find({
        patientId: patient._id,
      })
        .populate("doctorId", "specialization")
        .populate({
          path: "doctorId",
          populate: {
            path: "userId",
            select: "firstName lastName",
          },
        })
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: {
          patientInfo: patient,
          medicalRecords,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching patient history",
        error: error.message,
      });
    }
  },

  // Get patient appointments
  getPatientAppointments: async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;

      const patient = await Patient.findOne({ userId: req.user.userId });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found",
        });
      }

      let query = { patientId: patient._id };
      if (status) {
        query.status = status;
      }

      const appointments = await Appointment.find(query)
        .populate({
          path: "doctorId",
          populate: {
            path: "userId",
            select: "firstName lastName",
          },
          select: "specialization consultationFee",
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ appointmentDate: -1 });

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
        message: "Server error while fetching patient appointments",
        error: error.message,
      });
    }
  },
};
