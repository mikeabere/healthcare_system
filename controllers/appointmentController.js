//import { google } from "googleapis";
import Appointment from "../models/AppointmentModel.js";
import TimeSlot from '../models/TimeSlotModel.js';
import Doctor from '../models/DoctorModel.js';
import Patient from '../models/PatientModel.js';
//const emailService = require('../services/emailService');
//const smsService = require('../services/smsService');

export const appointmentController = {
  // Book new appointment
    bookAppointment: async (req, res) => {
    try {
      const {
        doctorId,
        appointmentDate,
        timeSlot,
        symptoms,
        consultationType
      } = req.body;

      // Find patient
      const patient = await Patient.findOne({ userId: req.user.userId });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient profile not found'
        });
      }

      // Check if time slot is available
      const availableSlot = await TimeSlot.findOne({
        doctorId,
        date: new Date(appointmentDate),
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        isAvailable: true,
        isBooked: false
      });

      if (!availableSlot) {
        return res.status(400).json({
          success: false,
          message: 'Selected time slot is not available'
        });
      }

      // Create appointment
      const appointment = new Appointment({
        patientId: patient._id,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        symptoms,
        consultationType: consultationType || 'offline',
        status: 'pending'
      });

      await appointment.save();

      // Mark time slot as booked
      availableSlot.isBooked = true;
      await availableSlot.save();

      // Populate appointment data
      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate('patientId', 'firstName lastName email phone')
        .populate({
          path: 'doctorId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email'
          }
        });

      // Send confirmation emails
      await emailService.sendAppointmentConfirmation(
        populatedAppointment.patientId.email,
        populatedAppointment
      );

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: populatedAppointment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error while booking appointment',
        error: error.message
      });
    }
  },

  // Get appointments
   getAppointments: async (req, res) => {
    try {
      const { status, date, page = 1, limit = 10 } = req.query;

      let query = {};
      
      // Filter by user role
      if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ userId: req.user.userId });
        if (patient) {
          query.patientId = patient._id;
        }
      } else if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ userId: req.user.userId });
        if (doctor) {
          query.doctorId = doctor._id;
        }
      }

      // Additional filters
      if (status) query.status = status;
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        query.appointmentDate = { $gte: startDate, $lt: endDate };
      }

      const appointments = await Appointment.find(query)
        .populate('patientId', 'firstName lastName email phone')
        .populate({
          path: 'doctorId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email'
          },
          select: 'specialization consultationFee'
        })
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
          total
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error while fetching appointments',
        error: error.message
      });
    }
  },

  // Update appointment
   updateAppointment:  async (req, res) => {
    try {
      const { id } = req.params;
      const { symptoms, notes } = req.body;

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      // Check authorization
      const patient = await Patient.findOne({ userId: req.user.userId });
      const doctor = await Doctor.findOne({ userId: req.user.userId });

      const isAuthorized = 
        (patient && appointment.patientId.toString() === patient._id.toString()) ||
        (doctor && appointment.doctorId.toString() === doctor._id.toString()) ||
        req.user.role === 'admin';

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this appointment'
        });
      }

      // Update fields
      if (symptoms) appointment.symptoms = symptoms;
      if (notes) appointment.notes = notes;

      await appointment.save();

      const updatedAppointment = await Appointment.findById(id)
        .populate('patientId', 'firstName lastName email phone')
        .populate({
          path: 'doctorId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email'
          }
        });

      res.status(200).json({
        success: true,
        message: 'Appointment updated successfully',
        data: updatedAppointment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error while updating appointment',
        error: error.message
      });
    }
  },

  // Cancel appointment
   cancelAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      // Check authorization
      const patient = await Patient.findOne({ userId: req.user.userId });
      const doctor = await Doctor.findOne({ userId: req.user.userId });

      const isAuthorized = 
        (patient && appointment.patientId.toString() === patient._id.toString()) ||
        (doctor && appointment.doctorId.toString() === doctor._id.toString()) ||
        req.user.role === 'admin';

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this appointment'
        });
      }

      // Update appointment status
      appointment.status = 'cancelled';
      appointment.cancellationReason = reason;
      appointment.cancelledBy = req.user.userId;
      appointment.cancelledAt = new Date();

      await appointment.save();

      // Free up the time slot
      await TimeSlot.updateOne(
        {
          doctorId: appointment.doctorId,
          date: appointment.appointmentDate,
          startTime: appointment.timeSlot.startTime,
          endTime: appointment.timeSlot.endTime
        },
        { isBooked: false }
      );

      // Send cancellation notifications
      const populatedAppointment = await Appointment.findById(id)
        .populate('patientId', 'firstName lastName email phone')
        .populate({
          path: 'doctorId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email'
          }
        });

      await emailService.sendAppointmentCancellation(
        populatedAppointment.patientId.email,
        populatedAppointment
      );

      res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        data: populatedAppointment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error while cancelling appointment',
        error: error.message
      });
    }
  },

  // Confirm appointment (doctor only)
   confirmAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const { meetingLink } = req.body;

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      // Check if user is doctor
      const doctor = await Doctor.findOne({ userId: req.user.userId });
      if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the assigned doctor can confirm this appointment'
        });
      }

      // Update appointment
      appointment.status = 'confirmed';
      if (meetingLink && appointment.consultationType === 'online') {
        appointment.meetingLink = meetingLink;
      }

      await appointment.save();

      const populatedAppointment = await Appointment.findById(id)
        .populate('patientId', 'firstName lastName email phone')
        .populate({
          path: 'doctorId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email'
          }
        });

      // Send confirmation email
      await emailService.sendAppointmentConfirmed(
        populatedAppointment.patientId.email,
        populatedAppointment
      );

      res.status(200).json({
        success: true,
        message: 'Appointment confirmed successfully',
        data: populatedAppointment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error while confirming appointment',
        error: error.message
      });
    }
  },

  // Complete appointment (doctor only)
   completeAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const { diagnosis, prescription, notes } = req.body;

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      // Check if user is doctor
      const doctor = await Doctor.findOne({ userId: req.user.userId });
      if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the assigned doctor can complete this appointment'
        });
      }

      // Update appointment
      appointment.status = 'completed';
      appointment.completedAt = new Date();
      if (notes) appointment.notes = notes;

      await appointment.save();

      // Create medical record if diagnosis/prescription provided
      if (diagnosis || prescription) {
        const MedicalRecord = require('../models/MedicalRecord');
        const medicalRecord = new MedicalRecord({
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          appointmentId: appointment._id,
          diagnosis,
          prescription,
          notes
        });

        await medicalRecord.save();
      }

      const populatedAppointment = await Appointment.findById(id)
        .populate('patientId', 'firstName lastName email phone')
        .populate({
          path: 'doctorId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email'
          }
        });

      res.status(200).json({
        success: true,
        message: 'Appointment completed successfully',
        data: populatedAppointment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error while completing appointment',
        error: error.message
      });
    }
  }
};