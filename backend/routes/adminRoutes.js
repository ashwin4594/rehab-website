const express = require("express");
const User = require("../models/User");
const Leave = require("../models/Leave");

/**
 * ===================================================
 * 🧑‍💼 ADMIN ROUTES — USERS | DOCTORS | LEAVES
 * With Real-Time Notifications via Socket.IO
 * ===================================================
 */

module.exports = (io, connectedDoctors) => {
  const router = express.Router();

  /* -------------------- 👥 USER MANAGEMENT -------------------- */

  // ✅ Get all users
  router.get("/users", async (req, res) => {
    try {
      const users = await User.find().select("name email role isApproved createdAt");
      res.status(200).json(users);
    } catch (err) {
      console.error("❌ Error fetching users:", err.message);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // ✅ Delete user
  router.delete("/users/:id", async (req, res) => {
    try {
      const deleted = await User.findByIdAndDelete(req.params.id);
      if (!deleted)
        return res.status(404).json({ message: "User not found" });

      res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      console.error("❌ Error deleting user:", err.message);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  /* -------------------- 🩺 DOCTOR APPROVAL MANAGEMENT -------------------- */

  // ✅ Fetch pending doctors (for admin approval)
  router.get("/pending-doctors", async (req, res) => {
    try {
      const pendingDoctors = await User.find({
        role: "doctor",
        isApproved: false,
      }).select("name email institution createdAt");

      if (!pendingDoctors.length) {
        return res.status(200).json({
          message: "No pending doctors found",
          doctors: [],
        });
      }

      res.status(200).json({ doctors: pendingDoctors });
    } catch (err) {
      console.error("❌ Error fetching pending doctors:", err.message);
      res.status(500).json({ message: "Failed to fetch pending doctors" });
    }
  });

  // ✅ Fetch approved doctors (for admin reference)
  router.get("/approved-doctors", async (req, res) => {
    try {
      const approvedDoctors = await User.find({
        role: "doctor",
        isApproved: true,
      }).select("name email institution createdAt");

      res.status(200).json({ doctors: approvedDoctors });
    } catch (err) {
      console.error("❌ Error fetching approved doctors:", err.message);
      res.status(500).json({ message: "Failed to fetch approved doctors" });
    }
  });

  // ✅ Approve a doctor
  router.put("/approve-doctor/:id", async (req, res) => {
    try {
      const doctor = await User.findByIdAndUpdate(
        req.params.id,
        { isApproved: true },
        { new: true }
      );

      if (!doctor)
        return res.status(404).json({ message: "Doctor not found" });

      // 🔔 Real-time notification (if doctor connected)
      const doctorSocket = connectedDoctors[doctor.email];
      if (doctorSocket) {
        io.to(doctorSocket).emit("approvalUpdate", {
          message: `✅ Congratulations, Dr. ${doctor.name}! Your account has been approved by the admin.`,
          status: "Approved",
        });
      }

      res.status(200).json({
        message: "Doctor approved successfully!",
        doctor,
      });
    } catch (err) {
      console.error("❌ Error approving doctor:", err.message);
      res.status(500).json({ message: "Failed to approve doctor" });
    }
  });

  // ✅ Reject doctor (delete from DB)
  router.delete("/reject-doctor/:id", async (req, res) => {
    try {
      const doctor = await User.findByIdAndDelete(req.params.id);
      if (!doctor)
        return res.status(404).json({ message: "Doctor not found" });

      // 🔔 Notify doctor if connected
      const doctorSocket = connectedDoctors[doctor.email];
      if (doctorSocket) {
        io.to(doctorSocket).emit("approvalUpdate", {
          message: `❌ Sorry, Dr. ${doctor.name}, your registration has been rejected.`,
          status: "Rejected",
        });
      }

      res.status(200).json({ message: "Doctor rejected and removed successfully" });
    } catch (err) {
      console.error("❌ Error rejecting doctor:", err.message);
      res.status(500).json({ message: "Failed to reject doctor" });
    }
  });

  /* -------------------- 🗓️ LEAVE MANAGEMENT -------------------- */

  // ✅ Get all leave requests
  router.get("/leaves", async (req, res) => {
    try {
      const leaves = await Leave.find().sort({ createdAt: -1 });
      res.status(200).json(leaves);
    } catch (err) {
      console.error("❌ Error fetching leaves:", err.message);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  // ✅ Approve leave (notify doctor)
  router.put("/leave/approve/:id", async (req, res) => {
    try {
      const leave = await Leave.findByIdAndUpdate(
        req.params.id,
        { status: "Approved" },
        { new: true }
      );

      if (!leave)
        return res.status(404).json({ message: "Leave not found" });

      // 🔔 Notify doctor
      const doctorSocket = connectedDoctors[leave.name];
      if (doctorSocket) {
        io.to(doctorSocket).emit("leaveUpdate", {
          message: `✅ Your leave from ${leave.fromDate} to ${leave.toDate} was approved.`,
          status: "Approved",
        });
      }

      res.status(200).json({
        message: `Leave approved for ${leave.name}`,
        leave,
      });
    } catch (err) {
      console.error("❌ Error approving leave:", err.message);
      res.status(500).json({ message: "Failed to approve leave" });
    }
  });

  // ✅ Reject leave (notify doctor)
  router.put("/leave/reject/:id", async (req, res) => {
    try {
      const leave = await Leave.findByIdAndUpdate(
        req.params.id,
        { status: "Rejected" },
        { new: true }
      );

      if (!leave)
        return res.status(404).json({ message: "Leave not found" });

      // 🔔 Notify doctor
      const doctorSocket = connectedDoctors[leave.name];
      if (doctorSocket) {
        io.to(doctorSocket).emit("leaveUpdate", {
          message: `❌ Your leave from ${leave.fromDate} to ${leave.toDate} was rejected.`,
          status: "Rejected",
        });
      }

      res.status(200).json({
        message: `Leave rejected for ${leave.name}`,
        leave,
      });
    } catch (err) {
      console.error("❌ Error rejecting leave:", err.message);
      res.status(500).json({ message: "Failed to reject leave" });
    }
  });

  return router;
};
