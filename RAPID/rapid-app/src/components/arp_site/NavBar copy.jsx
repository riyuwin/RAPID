import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
/* import '../../../css/style.css';
import '../../../css/style3.css'; */
import { collection, query, where, getDocs } from "@firebase/firestore";
import { firestore } from '../../firebase/firebase';
import { Link } from 'react-router-dom';

function NavBar() {
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [account, setAccount] = useState(null); // Track user account details
    const [loading, setLoading] = useState(true); // Track loading state
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
            <header id="header" className="header fixed-top d-flex align-items-center">
                <div className="d-flex align-items-center justify-content-center">
                    <Link to="/" className="logo d-flex align-items-center mx-auto">
                        <img src="../../assets/img/med_logo.png" alt="Logo" />
                        <span className="d-none d-lg-block">RAPID</span>
                    </Link>
                </div>

                {/* <div className="search-bar">
                    <form className="search-form d-flex align-items-center" method="POST" action="#">
                        <input
                            type="text"
                            id="searchInput"
                            name="query"
                            placeholder="Search"
                            title="Enter search keyword"
                        />
                        <button type="submit" title="Search">
                            <i className="bi bi-search"></i>
                        </button>
                        <ul id="searchSuggestions"></ul>
                    </form>
                </div> */}

                <nav className="header-nav ms-auto">
                    <ul className="d-flex align-items-center">
                        <li className="nav-item d-block d-lg-none">
                            <Link className="nav-link nav-icon search-bar-toggle" to="#">
                                <i className="bi bi-search"></i>
                            </Link>
                        </li>

                        <li className="nav-item dropdown pe-3">

                            <a
                                className="nav-link nav-profile d-flex align-items-center justify-content-center pe-0"
                                href="#"
                                data-bs-toggle="dropdown"
                            >
                                <p className="navbarUserName mb-0 me-2">
                                    {account ? `Hi, ${account.firstName}!` : 'Welcome!'}
                                </p>
                                <img
                                    src="/assets/img/profile.png"
                                    alt="Profile"
                                    id="navbarProfilePicture"
                                    className="rounded-circle"
                                />
                            </a>

                            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                                <li className="dropdown-header">
                                    <h6>{account ? account.firstName : 'Guest'}</h6>
                                    <span>{account ? account.userLevel : 'User'}</span>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li>
                                    <Link className="dropdown-item d-flex align-items-center" to="/arp/profile">
                                        <i className="bi bi-person"></i>
                                        <span>My Profile</span>
                                    </Link>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                {isUserLoggedIn ? (
                                    <li>
                                        <Link className="dropdown-item d-flex align-items-center" onClick={handleLogout}>
                                            <i className="bi bi-box-arrow-right"></i>
                                            <span>Logout</span>
                                        </Link>
                                    </li>
                                ) : (
                                    <li>
                                        <Link className="dropdown-item d-flex align-items-center" to="/login">
                                            <i className="bi bi-box-arrow-right"></i>
                                            <span>Login</span>
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </li>

                    </ul>
                </nav>
            </header>
        </>
    );
}

export default NavBar;
