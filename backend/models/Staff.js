const mongoose = require('mongoose');
const StaffSchema = new mongoose.Schema({
name: String,
role: String,
bio: String,
photoUrl: String
});
module.exports = mongoose.model('Staff', StaffSchema);