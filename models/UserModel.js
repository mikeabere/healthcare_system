import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
    specialization: { type: String }, // For doctors
    address: { type: String },
    dateOfBirth: { type: Date },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash password before saving
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) next();
//   this.password = await bcrypt.hash(this.password, 12);
// });

export default mongoose.model("User", UserSchema);
