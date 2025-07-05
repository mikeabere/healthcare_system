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
//import { log } from "console";



// Middleware
app.use(express.json());// middlwware to accept json
app.use(cors());

if(process.env.NODE_ENV === 'development'){
   app.use(morgan('dev'));
}


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);

// Error handling middleware


app.get("/", (req, res) => {
  res.send("Hello world");
});

// not found error
// app.use("*", (req, res) => {
//   res.status(404).json({ msg: "not found" });
// });



const port = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(port, () => console.log(`Server running on port ${port}`));
});
