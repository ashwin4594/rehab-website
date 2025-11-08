const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

/* ============================================================
   📩 CONTACT ROUTES — Handle messages from Contact Page
   ============================================================ */

/**
 * ✅ POST — User sends a message
 */
router.post("/send", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate all fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newMessage = new Contact({ name, email, phone, message });
    await newMessage.save();

    res.status(201).json({ message: "✅ Message sent successfully!" });
  } catch (err) {
    console.error("❌ Error saving message:", err);
    res.status(500).json({ message: "Server error while sending message" });
  }
});

/**
 * ✅ GET — Admin can view all messages
 */
router.get("/messages", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

/**
 * ✅ DELETE — Admin can delete a message
 */
router.delete("/messages/:id", async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({ message: "🗑️ Message deleted successfully!" });
  } catch (err) {
    console.error("❌ Error deleting message:", err);
    res.status(500).json({
      message: "Failed to delete message",
      error: err.message,
    });
  }
});

module.exports = router;
