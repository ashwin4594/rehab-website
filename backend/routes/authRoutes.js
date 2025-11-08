const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/* ============================================================
   🧩 USER SIGNUP — With Doctor Approval Logic
   ============================================================ */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user with doctor approval logic
    const newUser = new User({
      name,
      email,
      password,
      role: role || "visitor",
      isApproved: role === "doctor" ? false : true, // 🩺 Doctors need admin approval
    });

    await newUser.save();

    res.status(201).json({
      message:
        role === "doctor"
          ? "Signup successful! Please wait for admin approval before logging in."
          : "Signup successful!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isApproved: newUser.isApproved,
      },
    });
  } catch (err) {
    console.error("❌ Signup Error:", err);
    res.status(500).json({ message: "Server error during signup" });
  }
});

/* ============================================================
   🔐 USER LOGIN — With Doctor Approval Restriction
   ============================================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 🩺 If doctor not approved yet
    if (user.role === "doctor" && !user.isApproved) {
      return res.status(403).json({
        message:
          "Your account is pending admin approval. Please wait until your profile is approved.",
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

/* ============================================================
   🩺 FETCH APPROVED DOCTORS — For Patients Appointment Dropdown
   ============================================================ */
router.get("/api/doctors", async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor", isApproved: true }).select(
      "name email"
    );
    res.status(200).json(doctors);
  } catch (error) {
    console.error("❌ Error fetching doctors:", error);
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
});

module.exports = router;
