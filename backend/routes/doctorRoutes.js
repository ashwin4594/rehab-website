const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

/* ============================================================
   🩺 DOCTOR ROUTES — Manage & View Appointments
   ============================================================ */

/**
 * ✅ GET — Fetch all appointments
 * Optional query: ?doctorName=Dr.Name to filter by doctor
 */
router.get("/appointments", async (req, res) => {
  try {
    const { doctorName } = req.query;
    const query = doctorName ? { doctorName } : {};
    const appointments = await Appointment.find(query).sort({ createdAt: -1 });

    if (!appointments.length) {
      return res.status(200).json({ message: "No appointments found", data: [] });
    }

    res.status(200).json(appointments);
  } catch (err) {
    console.error("❌ Error fetching appointments:", err);
    res.status(500).json({ message: "Failed to fetch appointments", error: err.message });
  }
});

/**
 * ✅ PUT — Approve an appointment
 */
router.put("/appointments/:id/approve", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = "Approved";
    await appointment.save();

    res.status(200).json({
      message: "✅ Appointment approved successfully",
      appointment,
    });
  } catch (err) {
    console.error("❌ Error approving appointment:", err);
    res.status(500).json({ message: "Failed to approve appointment", error: err.message });
  }
});

/**
 * ✅ PUT — Reject an appointment
 */
router.put("/appointments/:id/reject", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = "Rejected";
    await appointment.save();

    res.status(200).json({
      message: "❌ Appointment rejected successfully",
      appointment,
    });
  } catch (err) {
    console.error("❌ Error rejecting appointment:", err);
    res.status(500).json({ message: "Failed to reject appointment", error: err.message });
  }
});

/**
 * ✅ PUT — Mark appointment as completed (Persistent Fix)
 */
router.put("/appointments/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // 🔥 FIXED: consistent lowercase 'completed' value
    appointment.status = "completed";
    await appointment.save();

    res.status(200).json({
      message: "✅ Appointment marked as completed successfully!",
      appointment,
    });
  } catch (error) {
    console.error("❌ Error updating appointment:", error);
    res.status(500).json({
      message: "Failed to update appointment",
      error: error.message,
    });
  }
});

/**
 * ✅ DELETE — Remove an appointment
 */
router.delete("/appointments/:id", async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "🗑️ Appointment deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting appointment:", err);
    res.status(500).json({ message: "Failed to delete appointment", error: err.message });
  }
});

module.exports = router;
