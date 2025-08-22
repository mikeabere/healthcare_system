import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient", //will look
    required: true,
  },
  diagnosis: String,
  prescription: String,
  testResults: String,
  notes: String,
  attachments: String,
  //createdAt, // will look
});

export default mongoose.model("MedicalRecord", medicalRecordSchema);
