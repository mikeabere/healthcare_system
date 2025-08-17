import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  notes: String,
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  symptoms: String,
  consultationType: String, //can be enum
  googleCalendarEventId: { type: String }, // For Google Calendar sync
});

export default mongoose.model("Appointment", AppointmentSchema);
