import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./config/db.js";
const app = express();
//import http from "http";
import cors from "cors";
import morgan from "morgan";


//routes
import authRoutes from"./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
//import { log } from "console";



// Middleware
app.use(express.json());// middlwware to accept json
app.use(cors());

if(process.env.NODE_ENV === 'development'){
   app.use(morgan('dev'));
}


// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/patients", patientRoutes);

// Error handling middleware


app.get("/", (req, res) => {
  res.send("Hello world");
});




const port = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(port, () => console.log(`Server running on port ${port}`));
});
