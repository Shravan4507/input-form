# 🔐 Admin Setup Guide

## Adding Admin Credentials to MongoDB

### ⚠️ Security Note
**NEVER** commit credentials to GitHub! The `.env` file is already in `.gitignore` to protect your credentials.

---

## 🎯 Three Ways to Add Admin

### **Method 1: Using Setup Script (Recommended)** ✅

This script will securely prompt you for credentials and add them to MongoDB.

```bash
cd backend
node setup-admin.js
```

**What it does:**
1. Connects to MongoDB
2. Checks if admin exists
3. Prompts for email and password (securely)
4. Creates admin in `admins` collection
5. Reminds you to update `.env`

**Example:**
```
🔧 MongoDB Admin Setup Script
================================

📡 Connecting to MongoDB...
✅ Connected to MongoDB

Please enter admin credentials:

Email: admin@example.com
Password: [type your secure password]

✅ Admin created successfully!
================================
📧 Email: admin@example.com
🔑 Password: [HIDDEN]
📅 Created: 2025-10-08T...

📝 REMINDER: Update your .env file with:
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your_password
```

---

### **Method 2: Using MongoDB Compass (GUI)**

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Navigate to `student-registration` database
4. Click on `admins` collection
5. Click "ADD DATA" → "Insert Document"
6. Paste this (replace with your credentials):

```json
{
  "email": "admin@example.com",
  "password": "your_secure_password",
  "createdAt": {
    "$date": "2025-10-08T00:00:00.000Z"
  }
}
```

7. Click "Insert"
8. Update your `.env` file with the same credentials

---

### **Method 3: Using MongoDB Shell**

```bash
mongosh mongodb://localhost:27017/student-registration
```

Then run:
```javascript
db.admins.insertOne({
  email: "admin@example.com",
  password: "your_secure_password",
  createdAt: new Date()
})
```

Exit: `exit`

---

## 🔧 After Adding Admin

### 1. Update `.env` file
```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
```

### 2. Restart Backend Server
```bash
npm run dev
```

### 3. Test Login
- Go to: http://localhost:5173/input-form/#/admin
- Use the credentials you just created

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep credentials in `.env` (already in `.gitignore`)
- Use strong passwords
- Change default credentials immediately
- Use environment variables for production

### ❌ DON'T:
- Commit `.env` to GitHub
- Use simple passwords like "admin123"
- Share credentials in code
- Push sensitive data to public repos

---

## 🚀 For Production

### Use Environment Variables

**On Hosting Platform (Heroku, Vercel, Railway, etc.):**
1. Go to Settings → Environment Variables
2. Add:
   - `MONGODB_URI` = your MongoDB connection string
   - `ADMIN_EMAIL` = your admin email
   - `ADMIN_PASSWORD` = your admin password

### Better: Use bcrypt for Password Hashing

In production, update `backend/controllers/adminController.js` to:

```javascript
const bcrypt = require('bcryptjs');

// When creating admin:
const hashedPassword = await bcrypt.hash(password, 10);

// When logging in:
const isMatch = await bcrypt.compare(password, admin.password);
```

---

## 📝 Checking Current Admin

To see if admin exists in MongoDB:

**MongoDB Compass:**
- Open `admins` collection
- You'll see the document

**MongoDB Shell:**
```bash
mongosh mongodb://localhost:27017/student-registration
db.admins.find()
```

**Via Backend:**
Create a quick script:
```javascript
// backend/check-admin.js
require('dotenv').config();
const mongoose = require('mongoose');

async function checkAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Admin = mongoose.model('Admin', {
    email: String,
    password: String
  });
  
  const admins = await Admin.find();
  console.log('Admins in database:', admins.length);
  admins.forEach(admin => {
    console.log(`- ${admin.email}`);
  });
  
  await mongoose.connection.close();
}

checkAdmin();
```

Run: `node backend/check-admin.js`

---

## 🆘 Troubleshooting

### "Admin already exists" error
```bash
node backend/setup-admin.js
# Choose "yes" to overwrite
```

### Can't connect to MongoDB
```bash
# Check if MongoDB is running
mongosh mongodb://localhost:27017
```

### Forgot password
- Use setup script to create new admin
- Or manually update in MongoDB Compass

---

## 📚 Summary

1. ✅ Use `setup-admin.js` script (easiest)
2. ✅ Keep credentials in `.env` (never commit)
3. ✅ Update `.env` after creating admin
4. ✅ Use strong passwords
5. ✅ For production: Use environment variables

**Your credentials are now secure and not in your code!** 🔐
