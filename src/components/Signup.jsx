import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig'; // Import Firestore configuration
import { collection, addDoc } from 'firebase/firestore';
import Navbar from './Navbar';

const Signup = () => {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Intern');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [uid, setUid] = useState('');
  const [year, setYear] = useState('');
  const [company, setCompany] = useState('');

  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      if (role === 'Intern') {
        await addDoc(collection(db, 'intern'), {
          userID,
          password,
          name,
          department,
          uid,
          year: parseInt(year),
        });
      } else if (role === 'Recruiter') {
        await addDoc(collection(db, 'recruiter'), {
          company,
          userID,
          password,
        });
      }
      
      console.log("Signup successful");
      navigate('/login');
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center text-white">{/* Include Navbar at the top */}
      <h1 className="text-4xl font-bold mb-10">Sign Up for InternLink</h1>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSignup();
          }}
          className="flex flex-col space-y-4"
        >
          {/* Dropdown placed at the top */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-gray-600 p-3 rounded-lg bg-gray-700 focus:outline-none focus:border-green-500 text-white"
          >
            <option value="Intern">Intern</option>
            <option value="Recruiter">Recruiter</option>
          </select>

          <input
            type="text"
            placeholder="User ID"
            value={userID}
            onChange={(e) => setUserID(e.target.value)}
            className="border border-gray-600 p-3 rounded-lg bg-gray-700 focus:outline-none focus:border-green-500 text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-600 p-3 rounded-lg bg-gray-700 focus:outline-none focus:border-green-500 text-white"
          />

          {role === 'Intern' && (
            <>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-600 p-3 rounded-lg bg-gray-700 focus:outline-none focus:border-green-500 text-white"
              />
              <input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="border border-gray-600 p-3 rounded-lg bg-gray-700 focus:outline-none focus:border-green-500 text-white"
              />
              <input
                type="text"
                placeholder="UID"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                className="border border-gray-600 p-3 rounded-lg bg-gray-700 focus:outline-none focus:border-green-500 text-white"
              />
              <input
                type="number"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="border border-gray-600 p-3 rounded-lg bg-gray-700 focus:outline-none focus:border-green-500 text-white"
              />
            </>
          )}

          {role === 'Recruiter' && (
            <input
              type="text"
              placeholder="Company Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="border border-gray-600 p-3 rounded-lg bg-gray-700 focus:outline-none focus:border-green-500 text-white"
            />
          )}

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
