// Quick script to add admin from .env file
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function addAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    // Check if admin exists
    const existing = await Admin.findOne({ email });
    
    if (existing) {
      console.log(`⚠️  Admin with email "${email}" already exists!`);
      console.log('Updating password...\n');
      existing.password = password;
      await existing.save();
      console.log('✅ Password updated!');
    } else {
      const admin = new Admin({ email, password });
      await admin.save();
      console.log('✅ New admin created!');
    }

    console.log('\n📧 Email:', email);
    console.log('🔑 Password:', '*'.repeat(password.length));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addAdmin();
