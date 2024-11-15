import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';

const Navbar = () => {
  const { user, setUser } = useContext(UserContext); // Access user context
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check if the user is logged in based on user context
  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear local storage
    setIsLoggedIn(false); // Update login state
    setUser(null); // Clear user context
    navigate('/login'); // Redirect to login page
  };

  const handleProfileClick = () => {
    if (user?.type === 'intern') {
      navigate('/InternProfile', { state: { user } }); // Pass user data to InternProfile
    } else if (user?.type === 'recruiter') {
      navigate('/recruiter', { state: { user } }); // Pass user data to recruiter profile
    }
  };

  return (
    <div className="relative w-full h-[60px] bg-[#1a1a1a] flex items-center justify-between px-4 lg:px-8 shadow-md">
      <div
        className="text-[#00afff] text-2xl lg:text-4xl font-bold font-['DM Sans'] cursor-pointer"
        onClick={() => navigate('/internships')}
      >
        InternLink
      </div>

      <div className="flex items-center space-x-6">
        {isLoggedIn ? (
          <>
            <div
              className="text-[#f0f0f0] text-lg lg:text-xl font-medium cursor-pointer"
              onClick={handleProfileClick}
            >
              {user?.name || user?.company} <span className="text-[#00afff]">({user?.department})</span>
            </div>
            <div
              className="text-[#ff4d4d] text-lg lg:text-xl font-medium cursor-pointer hover:text-[#ff6666]"
              onClick={handleLogout}
            >
              Logout
            </div>
          </>
        ) : (
          <>
            <div
              className="text-[#b0b0b0] text-lg lg:text-xl font-medium cursor-pointer hover:text-[#00afff]"
              onClick={() => navigate('/login')}
            >
              Login
            </div>
            <div
              className="text-[#00afff] text-lg lg:text-xl font-medium cursor-pointer hover:text-[#4db8ff]"
              onClick={() => navigate('/signup')}
            >
              Signup
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
