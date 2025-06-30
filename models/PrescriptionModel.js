import mongoose from "mongoose";

const PrescriptionSchema = new mongoose.Schema(
  {
    // Reference to the patient (User model)
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
    },

    // Reference to the prescribing doctor (User model)
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Doctor ID is required"],
    },

    // Cloudinary URL for the uploaded PDF
    fileUrl: {
      type: String,
      required: [true, "Prescription file URL is required"],
    },

    // Additional metadata (optional)
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },

    // Appointment reference (optional)
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    // Prescription status (e.g., "active", "expired", "cancelled")
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true } // Adds `createdAt` and `updatedAt` fields
);

// Indexes for faster queries
PrescriptionSchema.index({ patient: 1 });
PrescriptionSchema.index({ doctor: 1 });
PrescriptionSchema.index({ status: 1 });

export default mongoose.model("Prescription", PrescriptionSchema);
