const express = require('express');
const router = express.Router();
const {
  addStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  bulkDeleteStudents,
  getStatistics
} = require('../controllers/studentController');

// Student routes
router.post('/students', addStudent);
router.get('/students', getAllStudents);
router.get('/students/stats', getStatistics);
router.get('/students/:id', getStudentById);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.post('/students/bulk-delete', bulkDeleteStudents);

module.exports = router;
