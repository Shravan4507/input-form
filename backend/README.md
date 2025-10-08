# Student Registration System - MongoDB Backend

This is the Node.js + Express backend for the Student Registration System, using MongoDB as the database.

## 📁 Project Structure

```
backend/
├── config/
│   └── mongodb.js          # MongoDB connection configuration
├── controllers/
│   ├── adminController.js  # Admin authentication logic
│   └── studentController.js # Student CRUD operations
├── models/
│   ├── Admin.js           # Admin schema
│   └── Student.js         # Student schema
├── routes/
│   ├── adminRoutes.js     # Admin API routes
│   └── studentRoutes.js   # Student API routes
├── middleware/            # Custom middleware (future)
├── .env                   # Environment variables (not in git)
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore file
├── package.json          # Dependencies
└── server.js             # Main server file
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js installed (v16 or higher)
- MongoDB installed locally OR MongoDB Atlas account
- MongoDB Compass (optional, for GUI)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

Edit `.env`:
```env
# For Local MongoDB (MongoDB Compass)
MONGODB_URI=mongodb://localhost:27017/student-registration

# For MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-registration

PORT=5000
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=admin123
```

### Step 3: Start MongoDB

**Option A: Local MongoDB (MongoDB Compass)**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Database will be created automatically when first student is added

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Step 4: Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start at: `http://localhost:5000`

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Student Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/students` | Add new student |
| GET | `/students` | Get all students |
| GET | `/students/stats` | Get statistics |
| GET | `/students/:id` | Get student by ID |
| PUT | `/students/:id` | Update student |
| DELETE | `/students/:id` | Delete student |
| POST | `/students/bulk-delete` | Delete multiple students |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/login` | Admin login |

## 📝 API Examples

### Add Student
```bash
POST http://localhost:5000/api/students
Content-Type: application/json

{
  "fullName": "John Doe",
  "rollNo": "12345",
  "zprn": "ZPRN001",
  "branch": "Computer",
  "year": "FY",
  "division": "A",
  "email": "john@example.com",
  "phoneNo": "1234567890",
  "address": "123 Main St"
}
```

### Get All Students
```bash
GET http://localhost:5000/api/students
```

### Admin Login
```bash
POST http://localhost:5000/api/admin/login
Content-Type: application/json

{
  "email": "admin@admin.com",
  "password": "admin123"
}
```

## 🔧 Testing the API

### Using Browser
Visit: `http://localhost:5000/`

### Using Postman
1. Import the API endpoints
2. Test each endpoint

### Using curl
```bash
# Get all students
curl http://localhost:5000/api/students

# Add student
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test Student","rollNo":"123","zprn":"Z001","branch":"Computer","year":"FY","division":"A","email":"test@test.com","phoneNo":"1234567890","address":"Test Address"}'
```

## 🗄️ MongoDB Collections

### students
- fullName (String)
- rollNo (String)
- zprn (String)
- branch (String)
- year (String)
- division (String)
- email (String)
- phoneNo (String)
- address (String)
- createdAt (Date)
- updatedAt (Date)

### admins
- email (String)
- password (String)
- createdAt (Date)

## 🔒 Security Notes

⚠️ **For Development Only**
- Admin credentials are stored in `.env` file
- No password hashing implemented yet
- CORS is open to all origins
- No authentication tokens/JWT

📝 **For Production:**
- Implement bcrypt for password hashing
- Add JWT authentication
- Configure CORS properly
- Use environment-specific configs
- Add rate limiting
- Add input validation

## 🐛 Troubleshooting

### MongoDB Connection Error
```
❌ MongoDB Connection Error: connect ECONNREFUSED
```
**Solution:** Make sure MongoDB is running locally or check Atlas connection string

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in `.env` or kill process using port 5000

### Cannot find module 'express'
```
Error: Cannot find module 'express'
```
**Solution:** Run `npm install` in backend directory

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **cors**: Enable CORS
- **dotenv**: Environment variables
- **bcryptjs**: Password hashing (not implemented yet)
- **nodemon**: Auto-restart server (dev only)

## 🚀 Next Steps

1. Install dependencies: `npm install`
2. Set up MongoDB (Compass or Atlas)
3. Configure `.env` file
4. Start server: `npm run dev`
5. Test API endpoints
6. Integrate with React frontend

## 📞 Support

For issues or questions, check:
- MongoDB logs in terminal
- MongoDB Compass connection
- Network/firewall settings
- `.env` configuration

---

**Backend Status:** ✅ Ready for MongoDB Integration
**Database:** MongoDB (Local/Atlas)
**API Version:** 1.0.0
