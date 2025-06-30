import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  specialization: String,
  experience: Number,
  qualifications: String,
  bio: String,
  consultationFee: Number,
  availableDays: [String], // e.g. ['Monday', 'Wednesday']
  availableTime: { start: String, end: String }, // e.g. { start: '09:00', end: '17:00' }
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  clinicLocation: String,
});

export default mongoose.model("Doctor", DoctorSchema);