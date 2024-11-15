import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { query, where, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const InternProfile = () => {
  const location = useLocation();
  const passedUser = location.state?.user;
  const [user, setUser] = useState(passedUser);
  const [profileData, setProfileData] = useState({});
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    dob: '',
    address: '',
    contact: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user?.userID) {
        try {
          const profileQuery = query(
            collection(db, 'intern'),
            where('userID', '==', user.userID)
          );
          const profileSnapshot = await getDocs(profileQuery);
          if (!profileSnapshot.empty) {
            const profile = profileSnapshot.docs[0].data();
            const { userID, password, ...displayData } = profile; // Exclude sensitive fields
            setProfileData(displayData);
            setEditableData({
              dob: profile.dob || '',
              address: profile.address || '',
              contact: profile.contact || ''
            });
          } else {
            setError('Profile data not found.');
          }
        } catch (err) {
          setError('Error fetching profile data.');
          console.error(err);
        }
      }
    };
    fetchProfileData();
  }, [user]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (user?.userID) {
        try {
          const applicationsQuery = query(
            collection(db, 'apply'),
            where('userID', '==', user.userID)
          );
          const applicationsSnapshot = await getDocs(applicationsQuery);
          const applicationsList = applicationsSnapshot.docs.map((doc) => doc.data());
          setApplications(applicationsList);
        } catch (err) {
          setError('Error fetching applications.');
          console.error(err);
        }
      }
      setLoading(false);
    };
    fetchApplications();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableData({ ...editableData, [name]: value });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save updated data
      const saveProfile = async () => {
        try {
          const profileQuery = query(
            collection(db, 'intern'),
            where('userID', '==', user.userID)
          );
          const profileSnapshot = await getDocs(profileQuery);
          if (!profileSnapshot.empty) {
            const docRef = profileSnapshot.docs[0].ref;
            await updateDoc(docRef, editableData);
            alert('Profile updated successfully');
          }
        } catch (err) {
          setError('Error updating profile.');
          console.error(err);
        }
      };
      saveProfile();
    }
    setIsEditing(!isEditing);
  };

  if (loading) return <p>Loading profile details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="w-full bg-gray-900 text-white py-10 px-4 lg:px-20">
      <div className="container mx-auto flex flex-col gap-10">
        
        {/* Profile Section */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-6">Profile Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(profileData).map((key) => (
              <div key={key} className="flex flex-col">
                <label className="capitalize text-gray-400">{key.replace(/_/g, ' ')}</label>
                <p className="text-lg font-semibold">{profileData[key]}</p>
              </div>
            ))}

            {/* Editable Fields */}
            <div>
              <label>Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  name="dob"
                  value={editableData.dob}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              ) : (
                <p className="text-lg font-semibold">{editableData.dob}</p>
              )}
            </div>
            <div>
              <label>Address</label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={editableData.address}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              ) : (
                <p className="text-lg font-semibold">{editableData.address}</p>
              )}
            </div>
            <div>
              <label>Contact</label>
              {isEditing ? (
                <input
                  type="text"
                  name="contact"
                  value={editableData.contact}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              ) : (
                <p className="text-lg font-semibold">{editableData.contact}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleEditToggle}
            className="mt-6 bg-blue-500 px-6 py-2 rounded text-white font-bold hover:bg-blue-600"
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        {/* Applications Section */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold mb-6 text-center text-blue-500">Applications</h3>
          {applications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-left text-sm text-gray-400">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-lg">Company</th>
                    <th className="px-4 py-2 font-semibold text-lg">Title</th>
                    <th className="px-4 py-2 font-semibold text-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-700 hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : ''}`}
                    >
                      <td className="px-4 py-3">{application.company}</td>
                      <td className="px-4 py-3">{application.title}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            application.status === 'Pending'
                              ? 'bg-yellow-500 text-white'
                              : application.status === 'Accepted'
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {application.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-700 p-4 rounded-md text-center text-white">
              <p>No applications found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternProfile;
