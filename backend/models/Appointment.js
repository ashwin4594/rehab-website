const mongoose = require("mongoose");

/**
 * 🩺 Appointment Schema
 * Stores all appointment bookings made by patients and viewed by doctors.
 */
const appointmentSchema = new mongoose.Schema(
  {
    // Patient’s full name
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },

    // Contact number for patient
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },

    // Assigned doctor’s name — optional (so all doctors can see it)
    doctorName: {
      type: String,
      default: "All Doctors",
      trim: true,
    },

    // Appointment date
    date: {
      type: String,
      required: [true, "Appointment date is required"],
    },

    // Reason for appointment
    reason: {
      type: String,
      required: [true, "Reason for appointment is required"],
      trim: true,
    },

    // Current appointment status (fixed case)
    status: {
      type: String,
      enum: ["Scheduled", "Approved", "Rejected", "completed"],
      default: "Scheduled",
    },
  },
  {
    timestamps: true, // ✅ Automatically adds createdAt & updatedAt fields
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
