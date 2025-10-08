require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/mongodb');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
app.use('/api', studentRoutes);
app.use('/api', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Student Registration Backend API',
    version: '1.0.0',
    database: 'MongoDB',
    endpoints: {
      students: {
        'POST /api/students': 'Add new student',
        'GET /api/students': 'Get all students',
        'GET /api/students/stats': 'Get statistics',
        'GET /api/students/:id': 'Get student by ID',
        'PUT /api/students/:id': 'Update student',
        'DELETE /api/students/:id': 'Delete student',
        'POST /api/students/bulk-delete': 'Delete multiple students'
      },
      admin: {
        'POST /api/admin/login': 'Admin login'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`📖 API Docs: http://localhost:${PORT}/\n`);
});

module.exports = app;
