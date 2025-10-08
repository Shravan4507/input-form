import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useDatabase } from '../contexts/DatabaseContext';
import * as mongoAPI from '../services/mongoAPI';
import type { AdminCredentials } from '../types/student';
import AnimatedBackground from './AnimatedBackground';
import './AdminLogin.css';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const { activeDB, setActiveDB } = useDatabase();
  
  const [credentials, setCredentials] = useState<AdminCredentials>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let isValid = false;
      let attemptedDB = activeDB;
      
      if (activeDB === 'firestore') {
        // Query the admin collection to verify credentials
        const q = query(
          collection(db, 'admins'),
          where('username', '==', credentials.username),
          where('password', '==', credentials.password)
        );

        const querySnapshot = await getDocs(q);
        isValid = !querySnapshot.empty;
      } else {
        // MongoDB login - try with backend
        try {
          const response = await mongoAPI.adminLogin(credentials.username, credentials.password);
          isValid = response.success;
        } catch (mongoError) {
          console.error('MongoDB backend not reachable, falling back to Firestore:', mongoError);
          
          // Auto-fallback to Firestore
          setActiveDB('firestore');
          attemptedDB = 'firestore';
          
          // Try with Firestore
          const q = query(
            collection(db, 'admins'),
            where('username', '==', credentials.username),
            where('password', '==', credentials.password)
          );

          const querySnapshot = await getDocs(q);
          isValid = !querySnapshot.empty;
          
          if (isValid) {
            setError('⚠️ MongoDB backend unavailable. Switched to Firestore automatically.');
            // Clear error after showing message
            setTimeout(() => {
              onLogin();
            }, 1500);
            return;
          }
        }
      }

      if (isValid) {
        // Valid credentials
        onLogin();
      } else {
        setError(`Invalid username or password for ${attemptedDB.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <AnimatedBackground />
      <div className="login-wrapper">
        <h1 className="login-title">Admin Login</h1>
        <p className="login-subtitle">Please enter your credentials to access the admin panel</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-info">
          <p>🔒 This is a secure admin area. Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
