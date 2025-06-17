import { google } from "googleapis";
import Appointment from "../models/Appointment.js";

const calendar = google.calendar({
  version: "v3",
  auth: process.env.GOOGLE_CALENDAR_API_KEY,
});

export const bookAppointment = async (req, res) => {
  const { doctorId, date } = req.body;
  try {
    // Check doctor availability (custom logic)
    const event = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: `Appointment with Dr. ${req.doctor.name}`,
        start: { dateTime: date },
        end: { dateTime: new Date(date.getTime() + 30 * 60000) }, // +30 mins
      },
    });

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date,
      googleCalendarEventId: event.data.id,
    });

    // Emit real-time notification (Socket.io)
    io.to(doctorId).emit("newAppointment", appointment);
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
