const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const connectDB = require("./config/db");
const app = express();
const http = require("http");
const cors = require("cors");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("joinRoom", (userId) => {
    socket.join(userId); // Doctors/patients get their own rooms
  });
});

// Integrate with Express
app.set("io", io);

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/appointments", require("./routes/appointmentRoutes.js"));

// Error handling middleware
app.use(require("./middlewares/error"));

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
