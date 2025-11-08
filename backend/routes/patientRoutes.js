const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

/**
 * 🩺 POST — Book an Appointment
 * Called from Home page form when patient books an appointment.
 */
router.post("/book", async (req, res) => {
  try {
    const { patientName, phone, date, reason } = req.body;

    // Validate required fields
    if (!patientName || !phone || !date || !reason) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create a new appointment
    const newAppointment = new Appointment({
      patientName,
      phone,
      date,
      reason,
      doctorName: "All Doctors", // ✅ Default visible to all doctors
      status: "Scheduled",
    });

    await newAppointment.save();

    res.status(201).json({ message: "Appointment booked successfully!" });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Failed to book appointment" });
  }
});

/**
 * 🧾 GET — Fetch all Appointments
 * Used by the doctor dashboard to show booked patients.
 */
router.get("/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Error fetching appointments" });
  }
});

module.exports = router;
