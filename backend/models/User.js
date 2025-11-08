const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ===============================
// 🧩 USER SCHEMA
// ===============================
const userSchema = new mongoose.Schema(
  {
    // 🧑 Full Name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // 📧 Email Address
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // 🔐 Password (hashed before save)
    password: {
      type: String,
      required: true,
    },

    // 🧠 Role of the user
    role: {
      type: String,
      enum: ["admin", "doctor", "staff", "patient", "visitor"],
      default: "visitor",
    },

    // 🏫 Optional institution field
    institution: {
      type: String,
      trim: true,
    },

    // ✅ Email Verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    // ✅ Doctor Approval by Admin
    isApproved: {
      type: Boolean,
      default: false, // doctors will need admin approval
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// ===============================
// 🔐 PASSWORD HASHING MIDDLEWARE
// ===============================
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ===============================
// 🔑 PASSWORD COMPARISON METHOD
// ===============================
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ===============================
// ✅ EXPORT MODEL
// ===============================
module.exports = mongoose.model("User", userSchema);
