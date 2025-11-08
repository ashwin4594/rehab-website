const Testimonial = require('../models/Testimonial');
exports.getAll = async (req, res) => {
const t = await Testimonial.find();
res.json(t);
};
exports.create = async (req, res) => {
const t = new Testimonial(req.body);
await t.save();
res.status(201).json(t);
};