import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  gender: String,
  bloodGroup: String,
  allergies:Array, 
  medicalHistory: Array,
  emergencyContact: Object, // was number
  insuranceInfo: Object, //was string
});

export default mongoose.model("Patient", PatientSchema);