import MedicalRecord from "../models/MedicalRecordModel.js";
import Doctor from '../models/DoctorModel.js';
import Patient from '../models/PatientModel.js';
import User from "../models/UserModel.js";

export const medicalRecordController = {
  // Create medical record
  createRecord: async (req, res) => {
    try {
      const {
        patientId,
        appointmentId,
        diagnosis,
        prescription,
        testResults,
        notes,
        attachments,
      } = req.body;

      // Check if user is doctor
      const doctor = await User.findOne({ userId: req.user.userId }); //was using req.user userId: req.body.userId
      if (!doctor) {
        return res.status(403).json({
          success: false,
          message: "Only doctors can create medical records",
        });
      }

      const medicalRecord = new MedicalRecord({
        patientId,
        doctorId: doctor._id,
        appointmentId,
        diagnosis,
        prescription,
        testResults,
        notes,
        attachments,
      });

      await medicalRecord.save();

      const populatedRecord = await MedicalRecord.findById(medicalRecord._id)
        .populate("patientId", "firstName lastName email")
        .populate({
          path: "doctorId",
          populate: {
            path: "userId",
            select: "firstName lastName",
          },
        });

      res.status(201).json({
        success: true,
        message: "Medical record created successfully",
        data: populatedRecord,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while creating medical record",
        error: error.message,
      });
    }
  },

  // Get medical records
  getRecords: async (req, res) => {
    try {
      const { patientId, page = 1, limit = 10 } = req.query;

      let query = {};

      // Filter based on user role
      if (req.user.role === "doctor") {
        const doctor = await Doctor.findOne({ userId: req.user.userId });
        if (doctor) {
          query.doctorId = doctor._id;
        }
      } else if (req.user.role === "patient") {
        const patient = await Patient.findOne({ userId: req.user.userId });
        if (patient) {
          query.patientId = patient._id;
        }
      }

      // Additional filter by patientId (for doctors/admin)
      if (
        patientId &&
        (req.user.role === "doctor" || req.user.role === "admin")
      ) {
        query.patientId = patientId;
      }

      const records = await MedicalRecord.find(query)
        .populate("patientId", "firstName lastName email")
        .populate({
          path: "doctorId",
          populate: {
            path: "userId",
            select: "firstName lastName",
          },
          select: "specialization",
        })
        .populate("appointmentId", "appointmentDate consultationType")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await MedicalRecord.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          records,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching medical records",
        error: error.message,
      });
    }
  },

  // Update medical record
  updateRecord: async (req, res) => {
    try {
      const { id } = req.params;
      const { diagnosis, prescription, testResults, notes, attachments } =
        req.body;

      const record = await MedicalRecord.findById(id);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Medical record not found",
        });
      }

      // Check authorization (only the doctor who created it)
      const doctor = await Doctor.findOne({ userId: req.user.userId });
      if (!doctor || record.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this medical record",
        });
      }

      // Update fields
      if (diagnosis) record.diagnosis = diagnosis;
      if (prescription) record.prescription = prescription;
      if (testResults) record.testResults = testResults;
      if (notes) record.notes = notes;
      if (attachments) record.attachments = attachments;

      await record.save();

      const updatedRecord = await MedicalRecord.findById(id)
        .populate("patientId", "firstName lastName email")
        .populate({
          path: "doctorId",
          populate: {
            path: "userId",
            select: "firstName lastName",
          },
        });

      res.status(200).json({
        success: true,
        message: "Medical record updated successfully",
        data: updatedRecord,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while updating medical record",
        error: error.message,
      });
    }
  },

  // Delete medical record
  deleteRecord: async (req, res) => {
    try {
      const { id } = req.params;

      const record = await MedicalRecord.findById(id);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Medical record not found",
        });
      }

      // Check authorization (only the doctor who created it or admin)
      const doctor = await Doctor.findOne({ userId: req.user.userId });
      const isAuthorized =
        (doctor && record.doctorId.toString() === doctor._id.toString()) ||
        req.user.role === "admin";

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this medical record",
        });
      }

      await MedicalRecord.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Medical record deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while deleting medical record",
        error: error.message,
      });
    }
  },

  // Get patient records
  getPatientRecords: async (req, res) => {
    try {
      const { id } = req.params; // Patient ID
      const { page = 1, limit = 10 } = req.query;

      // Check authorization
      const patient = await Patient.findOne({ userId: req.user.userId });
      const doctor = await Doctor.findOne({ userId: req.user.userId });

      const isAuthorized =
        (patient && patient._id.toString() === id) ||
        doctor ||
        req.user.role === "admin";

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view these medical records",
        });
      }

      const records = await MedicalRecord.find({ patientId: id })
        .populate({
          path: "doctorId",
          populate: {
            path: "userId",
            select: "firstName lastName",
          },
          select: "specialization",
        })
        .populate("appointmentId", "appointmentDate consultationType")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await MedicalRecord.countDocuments({ patientId: id });

      res.status(200).json({
        success: true,
        data: {
          records,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching patient records",
        error: error.message,
      });
    }
  },
};
