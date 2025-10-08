const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  rollNo: {
    type: String,
    required: true,
    trim: true
  },
  zprn: {
    type: String,
    required: true,
    trim: true
  },
  branch: {
    type: String,
    required: true,
    enum: ['Computer', 'IT', 'Mechanical', 'Civil', 'Electrical', 'Electronics']
  },
  year: {
    type: String,
    required: true,
    enum: ['FY', 'SY', 'TY', 'Final Year']
  },
  division: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phoneNo: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Create indexes for faster queries
studentSchema.index({ email: 1 });
studentSchema.index({ rollNo: 1 });
studentSchema.index({ zprn: 1 });
studentSchema.index({ branch: 1 });
studentSchema.index({ year: 1 });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
