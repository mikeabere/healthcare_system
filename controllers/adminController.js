//import mongoose  from 'mongoose';
import Appointment from "../models/AppointmentModel.js";
import User from '../models/UserModel.js';
import Doctor from '../models/DoctorModel.js';
import Patient from '../models/PatientModel.js';

export const adminController = {
  // Get dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      // Check admin role
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
      }

      // Get counts
      const totalUsers = await User.countDocuments();
      const totalDoctors = await Doctor.countDocuments();
      const totalPatients = await Patient.countDocuments();
      const totalAppointments = await Appointment.countDocuments();
      
      const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
      const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
      const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
      const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    

      // Revenue calculation (this month)
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const monthlyRevenue = await Appointment.aggregate([
        {
          $match: {
            status: 'completed',
            appointmentDate: { $gte: startOfMonth }
          }
        },
        {
          $lookup: {
            from: 'doctors',
            localField: 'doctorId',
            foreignField: '_id',
            as: 'doctor'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $arrayElemAt: ['$doctor.consultationFee', 0] } }
          }
        }
      ]);

      // Recent appointments
      const recentAppointments = await Appointment.find()
        .populate('patientId', 'firstName lastName')
        .populate({
          path: 'doctorId',
          populate: {
            path: 'userId',
            select: 'firstName lastName'
          }
        })
        .sort({ createdAt: -1 })
        .limit(5);

      // Appointment trends (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const appointmentTrends = await Appointment.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalUsers,
            totalDoctors,
            totalPatients,
            totalAppoint,
          },
        },
       });
    };