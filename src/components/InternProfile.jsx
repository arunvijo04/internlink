import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { query, where, collection, getDocs } from 'firebase/firestore';

const InternProfile = () => {
  const location = useLocation();
  const passedUser = location.state?.user; // User data passed via route state
  const [user, setUser] = useState(passedUser);
  const [profileData, setProfileData] = useState({});
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Print initial user data in the console
  console.log("Initial passed user data:", passedUser);

  // Fetch user data from Firestore if not available in route state
  useEffect(() => {
    const fetchUserData = async () => {
      if (!passedUser?.userID) {
        console.error('User data not passed via state, attempting to fetch from Firestore.');
        // Retrieve userID from local storage or fallback to an example ID for testing
        const userID = 'exampleUserID'; 
        console.log("Fetching user data with ID:", userID);
        const userDocRef = doc(db, 'users', userID);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          console.log("Fetched user data from Firestore:", userData);
          setUser(userData);
        } else {
          setError('User data not found.');
        }
      }
    };
    fetchUserData();
  }, [passedUser]);

  // Fetch Profile Data using userID from the intern collection
  useEffect(() => {
    const fetchProfileData = async () => {
      if (user?.userID) {
        try {
          console.log("Fetching profile data for userID:", user.userID);
          // Query the 'intern' collection where 'userID' field matches the given user.userID
          const profileQuery = query(
            collection(db, 'intern'), 
            where('userID', '==', user.userID) // Match the field 'userID'
          );
          
          const profileSnapshot = await getDocs(profileQuery);
          
          if (!profileSnapshot.empty) {
            const profile = profileSnapshot.docs[0].data(); // Assuming only one document matches
            console.log("Fetched profile data:", profile);
            setProfileData(profile);
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

  // Fetch Applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (user?.userID) {
        try {
          console.log("Fetching applications for userID:", user.userID);
          const applicationsQuery = query(
            collection(db, 'apply'),
            where('userID', '==', user.userID)
          );
          const applicationsSnapshot = await getDocs(applicationsQuery);
          const applicationsList = applicationsSnapshot.docs.map((doc) => doc.data());
          console.log("Fetched applications:", applicationsList);
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

  if (loading) return <p>Loading profile details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="w-full bg-gray-900 text-white py-10 px-4 lg:px-20">
      <div className="container mx-auto flex flex-col gap-10">
        {/* Profile Details Section */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-6">Profile Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(profileData).map((field) => (
              <div key={field}>
                <label className="capitalize">{field}</label>
                <p>{profileData[field]}</p>
              </div>
            ))}
          </div>
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
