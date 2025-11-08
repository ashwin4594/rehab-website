require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Program = require('../models/Program');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    // create users for roles
    const roles = [
      { name: 'Admin User', email: process.env.ADMIN_EMAIL, role: 'admin' }
    ];
    // additional role users
    roles.push({ name: 'Manager User', email: 'manager@rehab.local', role: 'manager' });
    roles.push({ name: 'Doctor User', email: 'doctor@rehab.local', role: 'doctor' });
    roles.push({ name: 'Therapist User', email: 'therapist@rehab.local', role: 'therapist' });
    roles.push({ name: 'Normal User', email: 'user@rehab.local', role: 'user' });

    for (const r of roles) {
      const exists = await User.findOne({ email: r.email });
      if (!exists) {
        const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'AdminPass123', 10);
        await new User({ name: r.name, email: r.email, password: hashed, role: r.role }).save();
        console.log('Created user', r.email);
      } else console.log('User exists', r.email);
    }

    const count = await Program.countDocuments();
    if (count === 0) {
      const samples = [
        { title: 'Physio Rehab', slug: 'physio-rehab', summary:'Physical therapy program', description:'Focus on mobility', durationWeeks:6, cost:12000 },
        { title: 'Addiction Support', slug: 'addiction-support', summary:'Substance dependence support', description:'Counseling & group sessions', durationWeeks:12, cost:0 },
        { title: 'Mental Wellness', slug: 'mental-wellness', summary:'Therapy program', description:'Counseling + mindfulness', durationWeeks:8, cost:8000 }
      ];
      await Program.insertMany(samples);
      console.log('Seeded programs');
    } else console.log('Programs exist');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
