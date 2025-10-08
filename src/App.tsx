import { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import StudentForm from './components/StudentForm';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsAdminLoggedIn(true);
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
  };

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
