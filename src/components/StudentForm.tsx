import { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useDatabase } from '../contexts/DatabaseContext';
import * as mongoAPI from '../services/mongoAPI';
import type { StudentFormData } from '../types/student';
import AnimatedBackground from './AnimatedBackground';
import './StudentForm.css';

const StudentForm = () => {
  const { activeDB } = useDatabase();
  
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    middleName: '',
    surname: '',
    contactNumber: '',
    email: '',
    branch: '',
    customBranch: '',
    year: '',
    division: '',
    rollNumber: '',
    zprnNumber: '',
    // Optional fields
    team: '',
    position: '',
    nameToDisplay: '',
    imageDriveLink: '',
    socialMedia: ''
  });

  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Secret keyboard shortcut: Ctrl + Shift + Alt + A to access admin
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.altKey && e.key === 'A') {
        e.preventDefault();
        window.location.hash = '/admin';
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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

    // Validate custom branch input when "Other" is selected
    if (formData.branch === 'Other' && !formData.customBranch?.trim()) {
      setFeedbackMessage({
        type: 'error',
        message: 'Please specify your branch in the "Other" field!'
      });
      return false;
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
      if (activeDB === 'firestore') {
        // Add document to Firestore
        await addDoc(collection(db, 'students'), {
          ...formData,
          submittedAt: serverTimestamp()
        });
      } else {
        // Add student to MongoDB
        const mongoStudent = {
          fullName: `${formData.firstName} ${formData.middleName} ${formData.surname}`.trim(),
          rollNo: formData.rollNumber,
          zprn: formData.zprnNumber,
          branch: formData.branch === 'Other' ? (formData.customBranch || '') : formData.branch,
          year: formData.year,
          division: formData.division,
          email: formData.email,
          phoneNo: formData.contactNumber,
          address: `${formData.firstName}'s Address` // You can add a separate address field later
        };
        
        const response = await mongoAPI.addStudent(mongoStudent);
        if (!response.success) {
          throw new Error(response.message || 'Failed to add student');
        }
      }

      setFeedbackMessage({
        type: 'success',
        message: `✓ Form submitted successfully to ${activeDB.toUpperCase()}! Thank you for registering.`
      });

      // Reset form
      setFormData({
        firstName: '',
        middleName: '',
        surname: '',
        contactNumber: '',
        email: '',
        branch: '',
        customBranch: '',
        year: '',
        division: '',
        rollNumber: '',
        zprnNumber: '',
        team: '',
        position: '',
        nameToDisplay: '',
        imageDriveLink: '',
        socialMedia: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setFeedbackMessage({
        type: 'error',
        message: `Failed to submit form to ${activeDB.toUpperCase()}. Please try again later.`
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
                <option value="AI ML">AI ML</option>
                <option value="AI DS">AI DS</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Conditional input for "Other" branch */}
            {formData.branch === 'Other' && (
              <div className="form-group">
                <label htmlFor="customBranch">Specify Branch *</label>
                <input
                  type="text"
                  id="customBranch"
                  name="customBranch"
                  value={formData.customBranch || ''}
                  onChange={handleChange}
                  required
                  placeholder="Enter your branch name"
                  style={{ marginTop: '0.5rem' }}
                />
              </div>
            )}

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

          {/* Optional fields section - after required fields */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="team">Team</label>
              <select
                id="team"
                name="team"
                value={formData.team || ''}
                onChange={handleChange}
              >
                <option value="">Select Team (optional)</option>
                <option value="Technial">Technial</option>
                <option value="Documentaion">Documentaion</option>
                <option value="Social Media & Editing">Social Media & Editing</option>
                <option value="Design & Innovation">Design & Innovation</option>
                <option value="Public Relations & Outreach">Public Relations & Outreach</option>
                <option value="Management & Operations">Management & Operations</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="position">Position</label>
              <select
                id="position"
                name="position"
                value={formData.position || ''}
                onChange={handleChange}
              >
                <option value="">Select Position (optional)</option>
                <option value="President">President</option>
                <option value="Chairman">Chairman</option>
                <option value="Treasurer">Treasurer</option>
                <option value="Co - Treasurer">Co - Treasurer</option>
                <option value="Secretary">Secretary</option>
                <option value="Member">Member</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nameToDisplay">Name to display</label>
              <input
                type="text"
                id="nameToDisplay"
                name="nameToDisplay"
                value={formData.nameToDisplay || ''}
                onChange={handleChange}
                placeholder="Optional display name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="imageDriveLink">Image Drive Link</label>
              <input
                type="url"
                id="imageDriveLink"
                name="imageDriveLink"
                value={formData.imageDriveLink || ''}
                onChange={handleChange}
                placeholder="Set General access to 'Anyone with the link' as Viewer"
                title=""
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="socialMedia">Social Media</label>
              <input
                type="url"
                id="socialMedia"
                name="socialMedia"
                value={formData.socialMedia || ''}
                onChange={handleChange}
                placeholder="LinkedIn/Instagram profile link (optional - any one)"
              />
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Form'}
          </button>

          <div style={{ 
            marginTop: '20px', 
            textAlign: 'center', 
            fontSize: '10px', 
            opacity: 0.3,
            color: '#ffffff',
            fontFamily: 'monospace'
          }}>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
