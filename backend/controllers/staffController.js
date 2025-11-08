const Staff = require('../models/Staff');
exports.getAll = async (req, res) => {
const staff = await Staff.find();
res.json(staff);
};
exports.create = async (req, res) => {
if (req.headers['x-admin-token'] !== process.env.ADMIN_TOKEN) return res.status(401).json({ message: 'Unauthorized' });
const s = new Staff(req.body);
await s.save();
res.status(201).json(s);
};