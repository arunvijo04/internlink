import React, { useEffect, useState, useContext } from 'react';
import { db } from '../firebaseConfig'; // Firebase config
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'; // Firestore functions
import { UserContext } from '../context/userContext'; // Import UserContext

const InternProfile = () => {
  const { user } = useContext(UserContext); // Access user context
  const [profileData, setProfileData] = useState({
    name: '',
    department: '',
    year: '',
    dob: '',
    address: '',
    phone: '',
    email: ''
  });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Profile Data on userID change
  useEffect(() => {
    const fetchProfileData = async () => {
      if (user?.userID) {  // Ensure userID is available
        try {
          const profileDocRef = doc(db, 'intern', user.userID); // Use userID from context
          const profileSnapshot = await getDoc(profileDocRef);

          if (profileSnapshot.exists()) {
            setProfileData(profileSnapshot.data());
          } else {
            setError('No profile data found');
          }
        } catch (err) {
          setError('Error fetching profile data');
          console.error(err);
        }
      } else {
        setError('User ID not found');
      }
    };

    fetchProfileData();
  }, [user]);  // Dependency on user to re-run when user changes

  // Fetch Applications based on userID
  useEffect(() => {
    const fetchApplications = async () => {
      if (user?.userID) {  // Ensure userID is available
        try {
          const applicationsQuery = query(
            collection(db, 'apply'),
            where('userID', '==', user.userID)  // Filter applications by userID
          );
          const applicationsSnapshot = await getDocs(applicationsQuery);
          const applicationsList = applicationsSnapshot.docs.map((doc) => doc.data());
          setApplications(applicationsList);
        } catch (err) {
          setError('Error fetching applications');
          console.error(err);
        }
      }
      setLoading(false); // Finished loading
    };

    fetchApplications();
  }, [user]);  // Dependency on user to re-run when user changes

  if (loading) return <p className="text-white">Loading profile details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="w-full bg-gray-900 text-white py-10 px-4 lg:px-20">
      <div className="container mx-auto flex flex-col gap-10">
        {/* Profile Details */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-white mb-6">Profile Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(profileData).map((field) => (
              <div key={field}>
                <label className="block text-gray-400 capitalize">{field}</label>
                <p className="text-gray-400 mt-1">{profileData[field]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold text-white mb-4">Application Status</h3>
          {applications.length > 0 ? (
            <table className="w-full text-gray-300">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-2 text-left">Company</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application, index) => (
                  <tr key={index} className="hover:bg-gray-700">
                    <td className="px-4 py-2">{application.company}</td>
                    <td className="px-4 py-2">{application.title}</td>
                    <td className="px-4 py-2">{application.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400">No applications found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternProfile;
