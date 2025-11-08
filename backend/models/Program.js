const mongoose = require('mongoose');

const ProgramSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  summary: String,
  description: String,
  durationWeeks: Number,
  cost: Number,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Program', ProgramSchema);
