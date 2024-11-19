import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const Recruiter = () => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(''); // Company will be fetched from localStorage
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [experience, setExperience] = useState('');
  const [img, setImg] = useState('');
  const [location, setLocation] = useState('');
  const [mode, setMode] = useState('');
  const [skills, setSkills] = useState(['', '', '']);
  const [stipend, setStipend] = useState('');
  const [internships, setInternships] = useState([]); // List of internships for the company
  const [applications, setApplications] = useState({}); // Store applications by internship ID

  // Fetch recruiter data (company) from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.company) {
      setCompany(user.company); // Set the company name for the recruiter
      fetchInternships(user.company); // Fetch internships for the specific company
    }
  }, []);

  // Fetch internships for the specified company
  const fetchInternships = async (companyName) => {
    try {
      const q = query(collection(db, 'internships'), where('company', '==', companyName));
      const querySnapshot = await getDocs(q);
      const companyInternships = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInternships(companyInternships);
      
      // Fetch applications for each internship
      companyInternships.forEach(internship => {
        fetchApplications(internship.id);
      });
    } catch (error) {
      console.error('Error fetching internships:', error);
      alert('Failed to fetch internships');
    }
  };

  // Fetch applications for a specific internship
  const fetchApplications = async (internshipId) => {
    try {
      const q = query(collection(db, 'apply'), where('internshipId', '==', internshipId), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      const internshipApplications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(prevState => ({
        ...prevState,
        [internshipId]: internshipApplications,
      }));
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert('Failed to fetch applications');
    }
  };

  // Handle approval of an application
  const handleApprove = async (applicationId, internshipId) => {
    try {
      const applicationRef = doc(db, 'apply', applicationId);
      await updateDoc(applicationRef, { status: 'approved' });

      // Update applications state to reflect the approved status
      setApplications(prevState => {
        const updatedApplications = prevState[internshipId].filter(app => app.id !== applicationId);
        return {
          ...prevState,
          [internshipId]: updatedApplications,
        };
      });

      alert('Application approved successfully!');
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application');
    }
  };

  // Handle rejection of an application
  const handleReject = async (applicationId, internshipId) => {
    try {
      const applicationRef = doc(db, 'apply', applicationId);
      await updateDoc(applicationRef, { status: 'rejected' });

      // Update applications state to reflect the rejected status
      setApplications(prevState => {
        const updatedApplications = prevState[internshipId].filter(app => app.id !== applicationId);
        return {
          ...prevState,
          [internshipId]: updatedApplications,
        };
      });

      alert('Application rejected successfully!');
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application');
    }
  };

  // Handle internship upload
  const handleUpload = async () => {
    if (!company) {
      alert('Please enter a company name');
      return;
    }

    const internshipId = `internship${internships.length + 1}`;

    try {
      await addDoc(collection(db, 'internships'), {
        title,
        company,
        description,
        duration,
        experience,
        img,
        location,
        mode,
        skills,
        stipend,
      });
      alert('Internship opportunity uploaded successfully!');
      // Reset form fields
      setTitle('');
      setDescription('');
      setDuration('');
      setExperience('');
      setImg('');
      setLocation('');
      setMode('');
      setSkills(['', '', '']);
      setStipend('');
      // Refresh internships list
      fetchInternships(company);
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('Failed to upload internship opportunity.');
    }
  };

  // Handle removal of an internship
  const handleRemoveInternship = async (internshipId) => {
    try {
      await deleteDoc(doc(db, 'internships', internshipId));
      setInternships(internships.filter(internship => internship.id !== internshipId));
      alert('Internship removed successfully!');
    } catch (error) {
      console.error('Error removing internship:', error);
      alert('Failed to remove internship');
    }
  };

  return (
    <div className="container mx-auto py-10 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-500">Upload Internship Opportunities</h1>
      <form className="max-w-4xl mx-auto space-y-6 bg-gray-800 p-8 rounded-lg shadow-lg">
        {/* Internship upload form fields */}
        {/* ... (form fields remain the same as before) */}
        <div>
          <label className="block text-sm font-semibold text-gray-400">Company</label>
          <input
            type="text"
            value={company}
            disabled
            className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-400">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
            placeholder="Enter the title of the internship"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-400">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
            placeholder="Provide a brief description of the internship"
            rows="4"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-400">Duration</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
              placeholder="e.g., 3 months"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400">Experience Required</label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
              placeholder="e.g., No experience required"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-400">Image URL</label>
            <input
              type="text"
              value={img}
              onChange={(e) => setImg(e.target.value)}
              className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
              placeholder="URL to an image representing the internship"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
              placeholder="e.g., Remote, On-site"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-400">Mode</label>
            <input
              type="text"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
              placeholder="e.g., Remote, On-site"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400">Stipend</label>
            <input
              type="text"
              value={stipend}
              onChange={(e) => setStipend(e.target.value)}
              className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
              placeholder="Enter the stipend"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-400">Skill 1</label>
            <input
              type="text"
              value={skills[0]}
              onChange={(e) => setSkills([e.target.value, skills[1], skills[2]])}
              className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
              placeholder="e.g., JavaScript"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400">Skill 2</label>
            <input
              type="text"
              value={skills[1]}
              onChange={(e) => setSkills([skills[0], e.target.value, skills[2]])}
              className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
              placeholder="e.g., React"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400">Skill 3</label>
            <input
              type="text"
              value={skills[2]}
              onChange={(e) => setSkills([skills[0], skills[1], e.target.value])}
              className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
              placeholder="e.g., Node.js"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleUpload}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg mt-6 transition ease-in-out duration-200"
        >
          Upload Internship
        </button>
      </form>

      <h2 className="text-2xl font-bold mt-10 text-center text-blue-500">Current Internships for {company}</h2>
{internships.length > 0 ? (
  <ul className="mt-4 max-w-4xl mx-auto space-y-4">
    {internships.map((internship) => (
      <li key={internship.id} className="p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-blue-300">{internship.title}</h3>
        <p className="text-gray-400">{internship.description}</p>
        <p className="text-gray-400"><strong>Duration:</strong> {internship.duration}</p>
        <p className="text-gray-400"><strong>Location:</strong> {internship.location}</p>

        {/* Remove internship button */}
        <button
          onClick={() => handleRemoveInternship(internship.id)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg mt-4"
        >
          Remove Internship
        </button>

        {/* Display pending applications for this internship */}
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-300">Pending Applications:</h4>
          {applications[internship.id]?.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {applications[internship.id].map(application => (
                <li key={application.id} className="text-gray-400 flex justify-between items-center">
                  <span><strong>{application.userID}</strong> - Status: <em>{application.status}</em></span>
                  <div>
                    <button
                      onClick={() => handleApprove(application.id, internship.id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg mr-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(application.id, internship.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No pending applications for this internship.</p>
          )}
        </div>
      </li>
    ))}
  </ul>
) : (
  <p className="mt-4 text-gray-400">No internships available for this company.</p>
)}

    </div>
  );
};

export default Recruiter;

