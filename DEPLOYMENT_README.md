# 🎓 Student Registration System

A modern, full-stack student registration system with **dual database support** (Firebase Firestore & MongoDB).

🔗 **Live Demo**: [https://shravan4507.github.io/input-form/](https://shravan4507.github.io/input-form/)

---

## ✨ Features

### Frontend
- ✅ Modern React 19 + TypeScript + Vite
- ✅ Dark glassmorphism theme with WebGL animated background
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Form validation with error handling

### Admin Dashboard
- ✅ Secure authentication
- ✅ Search, filter, sort, pagination
- ✅ Inline editing & bulk operations
- ✅ Charts & statistics (Chart.js)
- ✅ Excel export functionality
- ✅ 30-minute auto-logout
- ✅ **Database toggle** (switch between Firestore & MongoDB)

### Dual Database System 🔥🍃
- ✅ **Firestore** (cloud, works on GitHub Pages)
- ✅ **MongoDB** (local/cloud, requires backend server)
- ✅ **Toggle button** to switch between databases
- ✅ Data persists independently in each database

---

## 🌐 Deployment Status

### **GitHub Pages (Live)**
- **URL**: https://shravan4507.github.io/input-form/
- **Database**: Firebase Firestore only
- **Why**: GitHub Pages only hosts static files, MongoDB requires a running backend server
- **Works for**: Student form submission, admin panel with Firestore data

### **Local Development**
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Databases**: Both Firestore & MongoDB
- **Toggle**: Fully functional switch between databases

---

## 🚀 Quick Start

### **Using GitHub Pages (No Setup)**
1. Visit: https://shravan4507.github.io/input-form/
2. Fill out the student registration form
3. Admin access: [Use secret keyboard shortcut]
4. Login with Firestore credentials
5. **Note**: Only Firestore is active on GitHub Pages

### **Local Development (Full Features)**

#### Prerequisites
- Node.js (v16+)
- MongoDB installed locally (or MongoDB Atlas account)
- Firebase account (free tier)

#### Setup Steps

```bash
# 1. Clone the repository
git clone https://github.com/Shravan4507/input-form.git
cd input-form

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install

# 4. Configure environment variables
# Create backend/.env file (see backend/.env.example)
# Add your MongoDB URI and admin credentials

# 5. Start MongoDB (if local)
# mongod --dbpath /path/to/data

# 6. Start backend server (Terminal 1)
cd backend
npm run dev
# ✅ Backend running on http://localhost:5000

# 7. Start frontend (Terminal 2)
cd ..
npm run dev
# ✅ Frontend running on http://localhost:5173

# 8. Open browser
# Visit: http://localhost:5173/input-form/
```

---

## 🗄️ Database Configuration

### **Firestore (Active on GitHub Pages)**
- Cloud-hosted by Google Firebase
- No setup required for GitHub Pages
- Always accessible from the live site

### **MongoDB (Local/Development Only)**
- Requires backend server running
- Works with local MongoDB or MongoDB Atlas
- **Not available on GitHub Pages** (static hosting limitation)

### **Switching Databases**
1. Admin panel → Top right corner
2. Click **🔥 Firestore** or **🍃 MongoDB** button
3. Confirm the switch
4. All operations now use the selected database

**Important**: MongoDB toggle only works when backend server is running!

---

## 📁 Project Structure

```
input-form/
├── src/                          # Frontend React code
│   ├── components/               # UI components
│   ├── services/                 # API services
│   │   └── mongoAPI.ts          # MongoDB API client
│   ├── contexts/                 # React contexts
│   │   └── DatabaseContext.tsx  # Database state management
│   └── config/                   # Firebase config
│
├── backend/                      # Node.js + Express backend
│   ├── config/                   # Database connections
│   ├── models/                   # Mongoose schemas
│   ├── controllers/              # Business logic
│   ├── routes/                   # API endpoints
│   ├── .env                      # Environment variables (⚠️ not in git!)
│   ├── .env.example             # Example config
│   ├── server.js                # Express server
│   ├── setup-admin.js           # Admin credential setup
│   ├── check-admin.js           # Check admin status
│   └── ADMIN_SETUP.md           # Security setup guide
│
├── public/                       # Static assets
├── .github/workflows/           # GitHub Actions (deployment)
├── PHASE4_DUAL_DATABASE.md     # Technical documentation
└── README.md                    # This file
```

---

## 🔒 Security Notes

### **⚠️ Important for Contributors**

1. **Never commit `.env` files**
   - `.env` is in `.gitignore`
   - Contains sensitive credentials

2. **Never hardcode credentials**
   - Use environment variables
   - Use the `setup-admin.js` script

3. **GitHub Pages Limitation**
   - Only serves static files
   - Cannot run backend server
   - MongoDB not available on live site

### **Setting Up Admin Credentials**

```bash
# Run the interactive setup script
cd backend
node setup-admin.js

# Follow prompts to enter email and password
# Script adds admin to MongoDB securely
```

See `backend/ADMIN_SETUP.md` for detailed security instructions.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation (HashRouter for GitHub Pages)
- **OGL** - WebGL animations
- **Chart.js** - Data visualization
- **xlsx** - Excel export

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM (Object Data Modeling)
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

### Databases
- **Firebase Firestore** - Cloud NoSQL (Google)
- **MongoDB** - Document database (local/Atlas)

---

## 📊 Database Comparison

| Feature | Firestore | MongoDB |
|---------|-----------|---------|
| **GitHub Pages** | ✅ Works | ❌ Needs server |
| **Setup** | Easy | Medium |
| **Cloud** | Google Cloud | MongoDB Atlas |
| **Local** | N/A | ✅ Available |
| **Real-time** | ✅ Built-in | Requires Socket.io |
| **Cost** | Free tier generous | Free locally |

---

## 🚦 API Endpoints

### Students
- `POST /api/students` - Add student
- `GET /api/students` - Get all students
- `GET /api/students/stats` - Get statistics
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/bulk-delete` - Delete multiple

### Admin
- `POST /api/admin/login` - Admin authentication

---

## 🔄 Deployment

### **GitHub Pages (Automatic)**
- Push to `main` branch
- GitHub Actions builds and deploys
- Available at: https://shravan4507.github.io/input-form/
- **Database**: Firestore only

### **Backend Deployment (Optional)**
To enable MongoDB on production:

1. Deploy backend to:
   - Heroku
   - Railway
   - Render
   - Vercel (serverless)

2. Deploy MongoDB to:
   - MongoDB Atlas (recommended)
   - Cloud provider

3. Update `src/services/mongoAPI.ts`:
   ```typescript
   const API_BASE_URL = 'https://your-backend-url.com/api';
   ```

4. Set environment variables on hosting platform

---

## 🎯 Usage

### **For Students**
1. Visit the live site
2. Fill out registration form
3. Submit (saves to Firestore automatically)

### **For Admins**
1. Access admin panel
2. Login with credentials
3. View/edit/delete students
4. Export to Excel
5. View charts & statistics
6. **Toggle database** (if backend is running)

### **For Developers**
1. Clone repository
2. Set up both databases
3. Run backend and frontend
4. Test dual database functionality
5. Contribute improvements

---

## 📝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

**Remember**: Never commit `.env` files or credentials!

---

## 📄 License

MIT License - feel free to use this project for learning or production.

---

## 👨‍💻 Author

**Shravan**
- GitHub: [@Shravan4507](https://github.com/Shravan4507)
- Repository: [input-form](https://github.com/Shravan4507/input-form)

---

## 🙏 Acknowledgments

- Firebase for cloud database
- MongoDB for local/cloud database
- React team for amazing framework
- Chart.js for visualization
- OGL for WebGL animations

---

## 📚 Documentation

- [PHASE4_DUAL_DATABASE.md](./PHASE4_DUAL_DATABASE.md) - Technical implementation details
- [backend/README.md](./backend/README.md) - Backend API documentation
- [backend/ADMIN_SETUP.md](./backend/ADMIN_SETUP.md) - Security setup guide
- [backend/SETUP.md](./backend/SETUP.md) - Quick setup guide

---

## 🌟 Features in Detail

### Dual Database Toggle
Switch between databases seamlessly:
- Click toggle button in admin panel
- Confirm switch
- All operations route to selected database
- Selection persists across sessions
- Each database maintains independent data

### Why Dual Database?
- **Firestore**: Always available on GitHub Pages
- **MongoDB**: Full control for local development
- **Learning**: Experience with both NoSQL databases
- **Flexibility**: Choose best database for your needs

---

## ⚡ Performance

- Fast form validation
- Optimized bundle size with Vite
- Lazy loading for charts
- Pagination for large datasets
- Efficient database queries

---

## 🔮 Future Enhancements

- [ ] Database sync feature
- [ ] Dual-write mode (write to both DBs)
- [ ] Password hashing (bcrypt)
- [ ] JWT authentication
- [ ] Email notifications
- [ ] File upload for students
- [ ] PDF report generation
- [ ] Mobile app (React Native)

---

**⭐ If you find this project helpful, please star the repository!**

**🐛 Found a bug? Open an issue!**

**💡 Have an idea? Start a discussion!**
