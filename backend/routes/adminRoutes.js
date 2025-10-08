const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/adminController');

// Admin routes
router.post('/admin/login', adminLogin);

module.exports = router;
