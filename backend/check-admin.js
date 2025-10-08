// Script to check if admin exists in MongoDB database
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function checkAdmin() {
  try {
    console.log('\n🔍 Checking MongoDB Admin Status');
    console.log('================================\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check for admins
    const admins = await Admin.find();

    if (admins.length === 0) {
      console.log('❌ No admin found in database!');
      console.log('\n💡 To add an admin, run:');
      console.log('   node setup-admin.js\n');
    } else {
      console.log(`✅ Found ${admins.length} admin(s) in database:\n`);
      admins.forEach((admin, index) => {
        console.log(`   ${index + 1}. Email: ${admin.email}`);
        console.log(`      Password: ${'*'.repeat(admin.password.length)} (hidden)`);
        console.log(`      Created: ${admin.createdAt}\n`);
      });

      console.log('💡 To add another admin or update credentials:');
      console.log('   node setup-admin.js\n');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the check
checkAdmin();
