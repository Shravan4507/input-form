# MongoDB Backend Setup Guide

## ✅ Directory Structure Created!

Your backend is now set up with the following structure:

```
backend/
├── config/
│   └── mongodb.js              ✅ MongoDB connection
├── controllers/
│   ├── adminController.js      ✅ Admin login logic
│   └── studentController.js    ✅ Student CRUD operations
├── models/
│   ├── Admin.js               ✅ Admin schema
│   └── Student.js             ✅ Student schema
├── routes/
│   ├── adminRoutes.js         ✅ Admin API routes
│   └── studentRoutes.js       ✅ Student API routes
├── middleware/                ✅ (for future use)
├── .env                       ✅ Environment variables
├── .env.example              ✅ Example configuration
├── .gitignore                ✅ Git ignore rules
├── package.json              ✅ Dependencies list
├── server.js                 ✅ Main server file
└── README.md                 ✅ Full documentation
```

## 🚀 Next Steps

### 1. Install Dependencies
Open PowerShell/Terminal in the backend folder:
```powershell
cd "z:\Projects Workspace\input-form\backend"
npm install
```

### 2. Set Up MongoDB

**Option A: Use MongoDB Compass (Local)**
- Open MongoDB Compass
- Click "Connect" (default: mongodb://localhost:27017)
- Database `student-registration` will be created automatically

**Option B: Use MongoDB Atlas (Cloud)**
- Go to https://www.mongodb.com/cloud/atlas
- Create free account
- Create cluster
- Get connection string
- Update MONGODB_URI in .env file

### 3. Start the Server
```powershell
# Development mode (auto-restart on changes)
npm run dev

# Or production mode
npm start
```

### 4. Test the API
Open browser and visit:
- http://localhost:5000/ (API documentation)
- http://localhost:5000/api/students (should return empty array initially)

## 🎯 What's Configured

✅ **Express Server** - Ready to handle HTTP requests
✅ **MongoDB Connection** - Configured for local or Atlas
✅ **CORS Enabled** - Frontend can connect
✅ **Student Schema** - All 9 fields matching Firestore
✅ **Admin Auth** - Simple login (admin@admin.com / admin123)
✅ **Full CRUD** - Create, Read, Update, Delete operations
✅ **Bulk Delete** - Delete multiple students at once
✅ **Statistics** - Get counts by branch/year/division

## 📡 Available API Endpoints

Once server is running, you can use these:

**Students:**
- POST http://localhost:5000/api/students (Add student)
- GET http://localhost:5000/api/students (Get all)
- GET http://localhost:5000/api/students/stats (Statistics)
- PUT http://localhost:5000/api/students/:id (Update)
- DELETE http://localhost:5000/api/students/:id (Delete)
- POST http://localhost:5000/api/students/bulk-delete (Delete multiple)

**Admin:**
- POST http://localhost:5000/api/admin/login (Login)

## ⚙️ Environment Variables (.env)

Already configured with defaults:
```env
MONGODB_URI=mongodb://localhost:27017/student-registration
PORT=5000
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=admin123
```

You can change these if needed!

## 🔄 Next Phase: Frontend Integration

After the backend is running, we'll:
1. Add database toggle button in AdminPanel
2. Create API service in frontend
3. Add conditional logic (Firestore vs MongoDB)
4. Test both databases
5. Deploy!

---

**Status:** 📦 Backend structure complete, ready for npm install!
