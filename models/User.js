const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["patient", "doctor", "admin"],
    default: "patient",
  },
  specialization: { type: String }, // For doctors
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model("User", UserSchema);
