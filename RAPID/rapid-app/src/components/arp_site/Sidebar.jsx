import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from "@firebase/firestore";
import { firestore } from '../../firebase/firebase';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { FetchCurrentUserDetails } from '../admin_site/scripts/FetchCurrentUserDetails';

function Sidebar({ isVisible }) {
    const { accountDetails, currentUserloading } = FetchCurrentUserDetails();
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [account, setAccount] = useState(null); // Track user account details
    const [loading, setLoading] = useState(true); // Track loading state

    const location = useLocation(); // Get the current location (URL)

    // Helper function to check if the current location matches the given path
    const isActive = (path) => location.pathname === path;

    const navigate = useNavigate();
    useEffect(() => {
        const auth = getAuth();

        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setIsUserLoggedIn(true);
                const currentUid = user.uid;
                try {
                    // Fetch account data from Firestore
                    const accountsRef = collection(firestore, "AccountInformation");
                    const q = query(accountsRef, where("accountId", "==", currentUid));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const accountData = querySnapshot.docs[0].data();
                        setAccount(accountData);
                    } else {
                        console.log("No account found with the matching accountId.");
                    }
                } catch (error) {
                    console.error("Error fetching account details:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setIsUserLoggedIn(false);
                setAccount(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Handle logout
    const handleLogout = () => {
        const auth = getAuth();
        signOut(auth)
            .then(() => navigate('/login'))
            .catch((error) => console.error("Logout error: ", error));
    };

    const handleNavigation = ({ url_path }) => {
        navigate(url_path);
        window.location.reload();
    };

    return (
        <>
            {isVisible && (
                <aside id="sidebar" className="sidebar">
                    <ul className="sidebar-nav" id="sidebar-nav">
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isActive('/arp/dashboard') ? '' : 'collapsed'}`}
                                id="dashboard"
                                to="/arp/dashboard"
                            /* onClick={() => handleNavigation('/arp/dashboard')} */
                            >
                                <i className="bi bi-grid"></i>
                                <span>Dashboard</span>
                            </Link>
                        </li>

                        <hr />

                        <li className="nav-heading">AMBULANCE PERSONNEL TOOL</li>

                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isActive('/arp/patient_care_report') ? '' : 'collapsed'}`}
                                to="/arp/patient_care_report"
                            /* onClick={() => handleNavigation('/arp/location_tracking_record')} */
                            >
                                <i className="bx bxs-ambulance"></i>
                                <span>Patient Care Report</span>
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isActive('/arp/location_tracking_record') ? '' : 'collapsed'}`}
                                to="/arp/location_tracking_record"
                            /*  onClick={() => handleNavigation('/arp/location_tracking_record')} */
                            >
                                <i className="bx bxs-map"></i>
                                <span>Location Tracking Record</span>
                            </Link>
                        </li>

                        <hr />

                        <Link
                            className={`nav-link ${isActive('/arp/profile') ? '' : 'collapsed'}`}
                            to="/arp/profile"
                        /* onClick={() => { handleNavigation("/arp/profile") }} */
                        >
                            <i className="bi bi-person"></i>
                            <span>My Profile</span>
                        </Link>

                        {isUserLoggedIn ? (
                            <>

                                <Link
                                    className={`nav-link ${isActive('/admin/logout') ? '' : 'collapsed'}`}
                                    onClick={handleLogout}
                                >
                                    <i className="bi bi-box-arrow-right"></i>
                                    <span>Logout</span>
                                </Link>
                            </>
                        ) : (

                            <Link
                                className={`nav-link ${isActive('/admin/login') ? '' : 'collapsed'}`}
                                to="/login"
                            >
                                <i className="bi bi-box-arrow-right"></i>
                                <span>Login</span>
                            </Link>
                        )}


                    </ul>
                </aside>
            )}
        </>
    );
}

export default Sidebar;
