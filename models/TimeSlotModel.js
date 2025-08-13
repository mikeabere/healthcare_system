import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: Date,
  startTime: String,
  endTime: String,
  isBooked: String,
  isAvailable: String,

});

export default mongoose.model("TimeSlot", timeSlotSchema);
