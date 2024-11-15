import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Internships from './components/Internships';
import Recruiter from './components/Recruiter';
import Login from './components/Login';
import Signup from './components/Signup';
import DescriptionPage from './components/DescriptionPage';
import { UserContext } from './context/userContext';
import InternProfile from './components/InternProfile';

const App = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for user session on initial load
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false); // Set loading to false after user data is checked
  }, [setUser]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Save user to localStorage
    if (userData.type === 'intern') {
      navigate('/internships');
    } else if (userData.type === 'recruiter') {
      navigate('/recruiter');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Clear user from localStorage
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>; // Optional: add a loading indicator
  }

  return (
    <div>
      <Navbar onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />

        {user && user.type === 'intern' ? (
          <>
            <Route path="/internships" element={<Internships />} />
            <Route path="/internships/:internshipId" element={<DescriptionPage />} />
            <Route path="/InternProfile" element={<InternProfile />} />
          </>
        ) : (
          <Route path="/internships" element={<Login onLogin={handleLogin} />} />
        )}

        {user && user.type === 'recruiter' ? (
          <Route path="/recruiter" element={<Recruiter />} />
        ) : (
          <Route path="/recruiter" element={<Login onLogin={handleLogin} />} />
        )}
      </Routes>
    </div>
  );
};

export default App;
