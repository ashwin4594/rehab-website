const express = require("express");
const router = express.Router();
const Leave = require("../models/Leave");

/* ===================================================
   🧾 ROUTES FOR DOCTORS / STAFF TO REQUEST LEAVE
   =================================================== */

// ✅ POST — Request Leave
router.post("/request", async (req, res) => {
  try {
    const { name, reason, fromDate, toDate } = req.body;

    if (!name || !reason || !fromDate || !toDate) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const leave = new Leave({
      name,
      reason,
      fromDate,
      toDate,
      status: "Pending",
    });

    await leave.save();
    res.status(201).json({
      message: "✅ Leave request submitted successfully!",
      leave,
    });
  } catch (err) {
    res.status(500).json({
      message: "❌ Failed to submit leave request.",
      error: err.message,
    });
  }
});

// ✅ GET — Fetch leave requests of a specific user
router.get("/my-leaves/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const leaves = await Leave.find({ name }).sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (err) {
    res.status(500).json({
      message: "❌ Failed to fetch your leave requests.",
      error: err.message,
    });
  }
});

module.exports = router;
