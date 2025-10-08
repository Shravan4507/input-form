import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { StudentFormData } from '../types/student';
import AnimatedBackground from './AnimatedBackground';
import './StudentForm.css';

const StudentForm = () => {
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    middleName: '',
    surname: '',
    contactNumber: '',
    email: '',
    branch: '',
    year: '',
    division: '',
    rollNumber: '',
    zprnNumber: ''
  });

  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Auto-convert division to uppercase
    const finalValue = name === 'division' ? value.toUpperCase() : value;
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const validateForm = (): boolean => {
    const requiredFields = ['firstName', 'surname', 'contactNumber', 'email', 'branch', 'year', 'division', 'rollNumber', 'zprnNumber'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof StudentFormData]) {
        setFeedbackMessage({
          type: 'error',
          message: `Please fill in all required fields!`
        });
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFeedbackMessage({
        type: 'error',
        message: 'Please enter a valid email address!'
      });
      return false;
    }

    // Contact number validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      setFeedbackMessage({
        type: 'error',
        message: 'Please enter a valid 10-digit contact number!'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedbackMessage(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Add document to Firestore
      await addDoc(collection(db, 'students'), {
        ...formData,
        submittedAt: serverTimestamp()
      });

      setFeedbackMessage({
        type: 'success',
        message: '✓ Form submitted successfully! Thank you for registering.'
      });

      // Reset form
      setFormData({
        firstName: '',
        middleName: '',
        surname: '',
        contactNumber: '',
        email: '',
        branch: '',
        year: '',
        division: '',
        rollNumber: '',
        zprnNumber: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setFeedbackMessage({
        type: 'error',
        message: 'Failed to submit form. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-form-container">
      <AnimatedBackground />
      <div className="form-wrapper">
        <h1 className="form-title">Student Registration Form</h1>
        <p className="form-subtitle">Please fill in all the required fields marked with *</p>

        {feedbackMessage && (
          <div className={`feedback-message ${feedbackMessage.type}`}>
            {feedbackMessage.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Enter first name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="middleName">Middle Name</label>
              <input
                type="text"
                id="middleName"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                placeholder="Enter middle name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="surname">Surname *</label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                required
                placeholder="Enter surname"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number *</label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                placeholder="10-digit number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="example@email.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="branch">Branch *</label>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                required
              >
                <option value="">Select Branch</option>
                <option value="Computer">Computer</option>
                <option value="IT">IT</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
                <option value="Electronics">Electronics</option>
                <option value="Civil">Civil</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="year">Year *</label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
              >
                <option value="">Select Year</option>
                <option value="FY">FY</option>
                <option value="SY">SY</option>
                <option value="TY">TY</option>
                <option value="Final Year">Final Year</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="division">Division *</label>
              <input
                type="text"
                id="division"
                name="division"
                value={formData.division}
                onChange={handleChange}
                required
                placeholder="A, B, C, ..."
                maxLength={1}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rollNumber">Roll Number *</label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                required
                maxLength={15}
                placeholder="Enter roll number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="zprnNumber">ZPRN Number *</label>
              <input
                type="text"
                id="zprnNumber"
                name="zprnNumber"
                value={formData.zprnNumber}
                onChange={handleChange}
                required
                maxLength={15}
                placeholder="Enter ZPRN number"
              />
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Form'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
