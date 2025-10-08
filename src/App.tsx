import { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import StudentForm from './components/StudentForm';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  // Check localStorage for existing admin session
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('adminLoggedIn') === 'true';
  });

  // Phase 3: Session Management - Persist login state
  useEffect(() => {
    if (isAdminLoggedIn) {
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('lastActivity', Date.now().toString());
    } else {
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('lastActivity');
    }
  }, [isAdminLoggedIn]);

  // Phase 3: Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    const checkInactivity = () => {
      const lastActivityTime = parseInt(localStorage.getItem('lastActivity') || '0');
      const now = Date.now();
      
      if (now - lastActivityTime > INACTIVITY_TIMEOUT) {
        setIsAdminLoggedIn(false);
        alert('Session expired due to inactivity. Please login again.');
      }
    };

    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    // Check inactivity every minute
    const inactivityInterval = setInterval(checkInactivity, 60000);

    // Update activity on user interactions
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      clearInterval(inactivityInterval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, [isAdminLoggedIn]);

  const handleLogin = useCallback(() => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('lastActivity', Date.now().toString());
  }, []);

  const handleLogout = useCallback(() => {
    setIsAdminLoggedIn(false);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Student Form Route */}
        <Route path="/" element={<StudentForm />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            isAdminLoggedIn ? (
              <AdminPanel onLogout={handleLogout} />
            ) : (
              <AdminLogin onLogin={handleLogin} />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
