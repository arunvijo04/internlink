import React, { createContext, useState } from 'react';

// Create UserContext to share user data globally
export const UserContext = createContext();

// Provider component to wrap around app and provide user context
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State to store user data

  const login = (userData) => {
    setUser(userData); // Set user data after login
  };

  const logout = () => {
    setUser(null); // Clear user data on logout
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
