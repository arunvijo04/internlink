import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const Login = ({ onLogin }) => {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const internRef = collection(db, 'intern');
      const recruiterRef = collection(db, 'recruiter');

      const internSnapshot = await getDocs(internRef);
      const recruiterSnapshot = await getDocs(recruiterRef);

      let found = false;
      let userData = null;

      // Check in Intern collection
      internSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userID === userID && data.password === password) {
          found = true;
          userData = { id: doc.id, ...data, type: 'intern' }; // Set userType as 'intern'
          // Check for valid intern email domain
          if (data.userID?.endsWith('@rajagiri.edu.in')) {
            onLogin(userData); // Pass user data to onLogin
            navigate('/internships'); // Redirect to Internships page
          } else {
            alert('Invalid email domain for intern account.');
          }
        }
      });

      // Check in Recruiter collection if no match in Intern
      if (!found) {
        recruiterSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userID === userID && data.password === password) {
            found = true;
            userData = { id: doc.id, ...data, type: 'recruiter' }; // Set userType as 'recruiter'
            onLogin(userData); // Pass user data to onLogin
            navigate('/recruiter'); // Redirect to Recruiter page
          }
        });
      }

      if (!found) {
        alert('Invalid credentials!');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('An error occurred during login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-10">Welcome to InternLink</h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="flex flex-col space-y-4"
        >
          <input
            type="text"
            placeholder="User ID"
            value={userID}
            onChange={(e) => setUserID(e.target.value)}
            className="border border-gray-700 bg-gray-900 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-700 bg-gray-900 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-400 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
