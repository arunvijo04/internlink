import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { UserContext } from '../context/userContext'; // Import UserContext

const DescriptionPage = () => {
    const { internshipId } = useParams();
    const { user } = useContext(UserContext); // Access user from context
    const [internship, setInternship] = useState(null);
    const [applicationStatus, setApplicationStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInternship = async () => {
            if (!internshipId) {
                console.error('No internship ID provided.');
                setLoading(false);
                return;
            }

            try {
                const docRef = doc(db, 'internships', internshipId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setInternship({ id: docSnap.id, ...docSnap.data() });
                    if (user) {
                        await checkApplicationStatus(docSnap.id);
                    }
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching internship:', error);
            } finally {
                setLoading(false);
            }
        };

        const checkApplicationStatus = async (internshipId) => {
            try {
                // Query to find if the userID exists in any document in the apply collection
                const q = query(
                    collection(db, 'apply'),
                    where('userID', '==', user.userID), // Use userID from context
                    where('internshipId', '==', internshipId)
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    // If a matching document is found, set the status
                    const application = querySnapshot.docs[0].data();
                    setApplicationStatus(application.status);
                } else {
                    // If no matching document is found, allow user to apply
                    setApplicationStatus(null);
                }
            } catch (error) {
                console.error('Error checking application status:', error);
            }
        };

        if (user) {
            fetchInternship();
        } else {
            setLoading(false);
        }
    }, [internshipId, user]);

    const handleApplyNow = async () => {
        if (internship && user) {
            try {
                await addDoc(collection(db, 'apply'), {
                    company: internship.company,
                    internshipId: internship.id,
                    status: 'pending',
                    title: internship.title,
                    userID: user.userID, // Use userID from context
                });
                setApplicationStatus('pending');
                alert('Application submitted successfully!');
            } catch (error) {
                console.error('Error applying for internship:', error);
                alert('Failed to submit application. Please try again.');
            }
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!internship) {
        return <p>Internship not found or does not exist.</p>;
    }

    if (!user) {
        return <p>Please log in to apply for this internship.</p>;
    }

    return (
        <div className="w-full bg-gray-900 text-white py-10 px-4 lg:px-20">
            <div className="container mx-auto bg-gray-800 p-6 rounded-lg shadow-md">
                <h1 className="text-4xl font-bold mb-4">{internship.title}</h1>
                {/* Display image from Firestore */}
                <img
                    src={internship.img || 'https://via.placeholder.com/600'}
                    alt={internship.company}
                    className="w-full h-80 object-cover rounded-md mb-6"
                />
                <p><strong>Company:</strong> {internship.company}</p>
                <p><strong>Type:</strong> {internship.type}</p>
                <p><strong>Experience:</strong> {internship.experience}</p>
                <p><strong>Salary:</strong> ₹{internship.stipend ? internship.stipend.toLocaleString() : 'Undisclosed'}</p>
                <p><strong>Location:</strong> {internship.location}</p>
                <p><strong>Description:</strong> {internship.description}</p>

                {applicationStatus ? (
                    <p className="mt-4 text-lg">
                        {applicationStatus === 'pending' && (
                            <span className="text-yellow-500 font-bold">Request has been sent (Pending)</span>
                        )}
                        {applicationStatus === 'approved' && (
                            <span className="text-green-500 font-bold">Approved</span>
                        )}
                        {applicationStatus === 'rejected' && (
                            <span className="text-red-500 font-bold">Rejected</span>
                        )}
                    </p>
                ) : (
                    <button
                        onClick={handleApplyNow}
                        className="bg-green-600 text-white px-4 py-2 mt-4 rounded-lg hover:bg-green-700"
                    >
                        Apply Now
                    </button>
                )}
            </div>
        </div>
    );
};

export default DescriptionPage;
