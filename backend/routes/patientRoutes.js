const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

/**
 * 🩺 POST — Book an Appointment
 * Called when a patient books an appointment.
 */
router.post("/book", async (req, res) => {
  try {
    const { doctorName, patientName, phone, date, reason } = req.body;

    // 🧩 Validate required fields
    if (!patientName || !phone || !date || !reason) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 🩹 Assign a doctor or default to “All Doctors” if not chosen
    const assignedDoctor = doctorName && doctorName.trim() !== "" ? doctorName : "All Doctors";

    // 💾 Create and save the appointment
    const newAppointment = new Appointment({
      doctorName: assignedDoctor,
      patientName,
      phone,
      date,
      reason,
      status: "Scheduled",
    });

    await newAppointment.save();

    console.log("✅ Appointment booked:", newAppointment);

    return res.status(201).json({
      message: "Appointment booked successfully!",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("❌ Error booking appointment:", error.message);
    return res.status(500).json({ message: "Failed to book appointment" });
  }
});

/**
 * 📋 GET — Fetch All Appointments
 * Used by doctors or admin to view all patient bookings.
 */
router.get("/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    return res.status(200).json(appointments);
  } catch (error) {
    console.error("❌ Error fetching appointments:", error.message);
    return res.status(500).json({ message: "Error fetching appointments" });
  }
});

/**
 * 🗑️ DELETE — Cancel Appointment
 * (Optional) Allows admin or patient to cancel a booking.
 */
router.delete("/appointments/:id", async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Appointment not found" });
    return res.status(200).json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("❌ Error cancelling appointment:", error.message);
    return res.status(500).json({ message: "Error cancelling appointment" });
  }
});

module.exports = router;
