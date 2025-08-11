import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  gender: String,
  bloodGroup: String,
  allergies: String,
  medicalHistory: String,
  emergencyContact: Number,
  insuranceInfo: String,
});

export default mongoose.model("Patient", PatientSchema);