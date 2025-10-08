require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

// Create interface for reading input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Admin Schema
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Admin = mongoose.model('Admin', adminSchema);

async function setupAdmin() {
  try {
    console.log('\n🔧 MongoDB Admin Setup Script');
    console.log('================================\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Created: ${existingAdmin.createdAt}\n`);
      
      const overwrite = await question('Do you want to delete and create a new admin? (yes/no): ');
      if (overwrite.toLowerCase() !== 'yes') {
        console.log('\n❌ Setup cancelled.');
        process.exit(0);
      }
      
      await Admin.deleteMany({});
      console.log('🗑️  Existing admin deleted.\n');
    }

    // Get credentials from user
    console.log('Please enter admin credentials:\n');
    const email = await question('Email: ');
    const password = await question('Password: ');
    
    if (!email || !password) {
      console.log('\n❌ Email and password are required!');
      process.exit(1);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('\n❌ Invalid email format!');
      process.exit(1);
    }

    // Create admin
    const admin = new Admin({
      email: email.toLowerCase().trim(),
      password: password // In production, use bcrypt to hash this!
    });

    await admin.save();

    console.log('\n✅ Admin created successfully!');
    console.log('================================');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: [HIDDEN]`);
    console.log(`📅 Created: ${admin.createdAt}`);
    console.log('\n⚠️  IMPORTANT: Remember these credentials!\n');
    console.log('💡 You can now login to the admin panel with these credentials.\n');

    // Also update .env file reminder
    console.log('📝 REMINDER: Update your .env file with:');
    console.log(`   ADMIN_EMAIL=${admin.email}`);
    console.log(`   ADMIN_PASSWORD=${password}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('👋 Connection closed.');
    process.exit(0);
  }
}

// Run the setup
setupAdmin();
