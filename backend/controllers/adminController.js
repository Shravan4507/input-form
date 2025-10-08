const Admin = require('../models/Admin');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Simple authentication (matches Firestore logic)
    // In production, use bcrypt for password hashing
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          email: email
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Login error',
      error: error.message
    });
  }
};

module.exports = {
  adminLogin
};
