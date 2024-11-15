import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { UserContext } from '../context/userContext'; // Import UserContext

const Internships = () => {
    const { user } = useContext(UserContext); // Access user from UserContext
    const [internshipsData, setInternshipsData] = useState([]);
    const [filters, setFilters] = useState({
        type: '',
        search: '',
    });
    const [filteredInternships, setFilteredInternships] = useState([]);
    const [showFiltered, setShowFiltered] = useState(false);
    const location = useLocation();

    // Discussion Forum States
    const [discussionMessages, setDiscussionMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // Refs for Company, Location, and Experience fields
    const companyRef = useRef(null);
    const locationRef = useRef(null);
    const experienceRef = useRef(null);

    // Fetch internships data from Firestore
    useEffect(() => {
        const fetchInternships = async () => {
            const querySnapshot = await getDocs(collection(db, 'internships'));
            const internships = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInternshipsData(internships);
            setFilteredInternships(internships);
        };
        fetchInternships();
    }, []);

    // Fetch discussion messages from Firestore
    useEffect(() => {
        const q = query(collection(db, 'discussion'), orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDiscussionMessages(messages);
        });

        return () => unsubscribe();
    }, []);

    // Update filters from URL query parameters
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const search = queryParams.get('search') || '';
        setFilters((prev) => ({ ...prev, search }));
    }, [location]);

    // Function to filter internships by all filters
    const applyAllFilters = () => {
        const filtered = internshipsData.filter((internship) => {
            const matchesSearch =
                filters.search === '' ||
                internship.title.toLowerCase().includes(filters.search.toLowerCase());
            const matchesType = filters.type === '' || internship.type === filters.type;
            const matchesLocation =
                locationRef.current.value === '' ||
                internship.location.toLowerCase().includes(locationRef.current.value.toLowerCase());
            const matchesCompany =
                companyRef.current.value === '' ||
                internship.company.toLowerCase().includes(companyRef.current.value.toLowerCase());
            const matchesExperience =
                experienceRef.current.value === '' ||
                internship.experience.toLowerCase().includes(experienceRef.current.value.toLowerCase());

            return matchesSearch && matchesType && matchesLocation && matchesCompany && matchesExperience;
        });

        setFilteredInternships(filtered);
        setShowFiltered(true);
    };

    // Function to reset filters and search to original data
    const resetFilters = () => {
        setFilters({
            type: '',
            search: '',
        });
        if (companyRef.current) companyRef.current.value = '';
        if (locationRef.current) locationRef.current.value = '';
        if (experienceRef.current) experienceRef.current.value = '';
        setFilteredInternships(internshipsData);
        setShowFiltered(false);
    };

    // Event handler for Search field (live update)
    const handleSearchChange = (e) => {
        setFilters({ ...filters, search: e.target.value });
    };

    // Function to handle new message submission in Discussion Forum
    const handleNewMessageSubmit = async () => {
        if (newMessage.trim() === '') return;

        try {
            await addDoc(collection(db, 'discussion'), {
                query: newMessage,
                timestamp: new Date(),
                userID: user?.id || 'Unknown ID', // Use user ID from context
                userName: user?.name || 'Unknown User', // Use user name from context
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error adding message:', error);
        }
    };

    return (
        <div className="w-full bg-gray-900 text-white py-10 px-4 lg:px-20">
            <div className="container mx-auto flex flex-col lg:flex-row gap-10">
                {/* Left: Internship Cards */}
                <div className="w-full lg:w-3/4">
                    <div className="sticky top-0 z-10 bg-gray-900 pb-4">
                        <h1 className="text-4xl font-bold text-white mb-4">All Internships</h1>
                        <div className="flex">
                            <input
                                type="text"
                                placeholder="Search for internships..."
                                value={filters.search}
                                onChange={handleSearchChange}
                                className="w-full p-2 border border-gray-700 bg-gray-800 rounded-md text-white"
                            />
                            <button
                                onClick={() => applyAllFilters()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md ml-2 hover:bg-blue-700"
                            >
                                Search
                            </button>
                            <button
                                onClick={resetFilters}
                                className="bg-red-500 text-white px-4 py-2 rounded-md ml-2 hover:bg-red-600"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        {(showFiltered ? filteredInternships : internshipsData).length > 0 ? (
                            (showFiltered ? filteredInternships : internshipsData).map((internship) => (
                                <div
                                    key={internship.id}
                                    className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                                >
                                    <img
                                        src={internship.img || 'https://via.placeholder.com/150'}
                                        alt={internship.company}
                                        className="w-full h-40 object-cover rounded-md mb-4"
                                    />
                                    <h2 className="text-2xl font-bold">{internship.title}</h2>
                                    <p className="text-gray-400 mt-2">
                                        {internship.type} | ₹{internship.stipend ? internship.stipend.toLocaleString() : 'Undisclosed'} | {internship.experience} experience
                                    </p>
                                    <p className="text-gray-500 mt-1">Location: {internship.location}</p>
                                    <p className="text-gray-500 mt-1">Company: {internship.company}</p>
                                    <Link to={`/internships/${internship.id}`}>
                                        <button className="bg-blue-600 text-white px-4 py-2 mt-4 rounded-lg hover:bg-blue-700">
                                            View Details
                                        </button>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p>No internships found.</p>
                        )}
                    </div>
                </div>

                {/* Right: Filter Section */}
                <div className="w-full lg:w-1/4">
                    <div className="sticky top-10 bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-white">Filter By</h2>
                        <input
                            type="text"
                            placeholder="Company"
                            ref={companyRef}
                            className="w-full p-2 border border-gray-700 bg-gray-900 rounded-md text-white mt-2"
                        />
                        <input
                            type="text"
                            placeholder="Location"
                            ref={locationRef}
                            className="w-full p-2 border border-gray-700 bg-gray-900 rounded-md text-white mt-2"
                        />
                        <input
                            type="text"
                            placeholder="Experience"
                            ref={experienceRef}
                            className="w-full p-2 border border-gray-700 bg-gray-900 rounded-md text-white mt-2"
                        />
                        <button
                            onClick={applyAllFilters}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full mt-4"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={resetFilters}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 w-full mt-4"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Discussion Forum Section */}
            <div className="mt-10 bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Discussion Forum</h2>
                <div className="max-h-80 overflow-y-auto mb-4">
                    {discussionMessages.map((message) => (
                        <div key={message.id} className="mb-2">
                            <p>
                                <span className="font-bold">{message.userName}:</span> {message.query}
                            </p>
                        </div>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full p-2 border border-gray-700 bg-gray-900 rounded-md text-white"
                />
                <button
                    onClick={handleNewMessageSubmit}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md mt-4 hover:bg-blue-700"
                >
                    Send Message
                </button>
            </div>
        </div>
    );
};

export default Internships;
