import cloudinary from "cloudinary";
import Prescription from "../models/Prescription.js";

export const uploadPrescription = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "prescriptions",
      format: "pdf",
    });

    const prescription = await Prescription.create({
      patient: req.user.id,
      doctor: req.body.doctorId,
      fileUrl: result.secure_url,
    });

    res.status(201).json(prescription);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getPatientPrescriptions = async (req, res) => {
  const prescriptions = await Prescription.find({ patient: req.user.id })
    .populate("doctor", "name specialization") // Include doctor details
    .sort({ createdAt: -1 }); // Newest first

  res.json(prescriptions);
};
