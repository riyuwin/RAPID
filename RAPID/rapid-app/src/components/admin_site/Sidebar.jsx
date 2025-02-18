import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from "@firebase/firestore";
import { firestore } from '../../firebase/firebase';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { FetchCurrentUserDetails } from './scripts/FetchCurrentUserDetails';

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

    return (
        <>
            {isVisible && (
                <aside id="sidebar" className="sidebar">
                    <ul className="sidebar-nav" id="sidebar-nav">
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isActive('/admin/dashboard') ? '' : 'collapsed'}`}
                                id="dashboard"
                                to="/admin/dashboard" // Use 'to' instead of 'href'
                            >
                                <i className="bi bi-grid"></i>
                                <span>Dashboard</span>
                            </Link>
                        </li>

                        <hr />

                        <li className="nav-heading">MANAGE PATIENT CARE REPORT</li>

                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isActive('/admin/manage_patient_records') ? '' : 'collapsed'}`}
                                to="/admin/manage_patient_records" // Use 'to' instead of 'href'
                            >
                                <i className="bx bxs-briefcase"></i>
                                <span>Patient Care Records</span>
                            </Link>

                            <Link
                                className={`nav-link ${isActive('/admin/manage_tracking_report') ? '' : 'collapsed'}`}
                                to="/admin/manage_tracking_report" // Use 'to' instead of 'href'
                            >
                                <i className="bx bxs-map"></i>
                                <span>Tracking Report</span>
                            </Link>

                            <Link
                                className={`nav-link ${isActive('/admin/manage_messages') ? '' : 'collapsed'}`}
                                to="/admin/manage_messages" // Use 'to' instead of 'href'
                            >
                                <i className="bx bx-chat"></i>
                                <span>Messages</span>
                            </Link>
                        </li>

                        <hr />
                        <li className="nav-heading">CONFIGURATION</li>

                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isActive('/admin/manage_ambulance') ? '' : 'collapsed'}`}
                                to="/admin/manage_ambulance" // Use 'to' instead of 'href'
                            >
                                <i className="bx bxs-ambulance"></i>
                                <span>Manage Ambulance</span>
                            </Link>


                            {accountDetails?.membership === "Admin" && (
                                <Link
                                    className={`nav-link ${isActive('/admin/manage_user_accounts') ? '' : 'collapsed'}`}
                                    to="/admin/manage_user_accounts"
                                    aria-label="Manage User Accounts"
                                >
                                    <i className="bx bxs-user-detail"></i>
                                    <span>Manage User Accounts</span>
                                </Link>
                            )}

                            <hr />

                            <Link
                                className={`nav-link ${isActive('/admin/profile') ? '' : 'collapsed'}`}
                                to="/admin/profile"
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

                        </li>
                    </ul>
                </aside >
            )
            }
        </>
    );
}

export default Sidebar;
