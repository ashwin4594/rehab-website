const Program = require('../models/Program');
const slugify = s => s.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');

exports.getAll = async (req, res) => {
  const programs = await Program.find().sort({ createdAt: -1 });
  res.json(programs);
};

exports.getBySlug = async (req, res) => {
  const p = await Program.findOne({ slug: req.params.slug });
  if(!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
};

exports.create = async (req, res) => {
  const data = req.body;
  data.slug = slugify(data.title || 'program');
  const p = new Program(data);
  await p.save();
  res.status(201).json(p);
};

exports.update = async (req, res) => {
  const p = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(p);
};

exports.delete = async (req, res) => {
  await Program.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};
