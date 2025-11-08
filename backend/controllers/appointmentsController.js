const Appointment = require('../models/Appointment');

exports.create = async (req, res) => {
  const a = new Appointment(req.body);
  await a.save();
  res.status(201).json({ message: 'Created' });
};

exports.getAll = async (req, res) => {
  const list = await Appointment.find().populate('programId');
  res.json(list);
};
