//import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./config/db.js";
const app = express();
//import http from "http";
import cors from "cors";
import morgan from "morgan";
import  cookieParser from "cookie-parser";

//routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import medicalRecordsRoutes from "./routes/medicalRecordRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
//import { log } from "console";

//middleware
//import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";
import { authenticateUser } from "./middlewares/authMiddleware.js"; //to be able to use req.user

// Middleware
app.use(cookieParser());
app.use(express.json()); // middleware to accept json
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/patients", authenticateUser, patientRoutes);
app.use("/api/v1/medicalrecords", medicalRecordsRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/reviews", reviewRoutes);

// Error handling middleware

app.get("/", (req, res) => {
  res.send("Hello world");
});

const port = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(port, () => console.log(`Server running on port ${port}`));
});
