import React, { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"; // Import Firestore
/* import '../../../css/authentication.css'; */

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const firestore = getFirestore(); // Initialize Firestore

    useEffect(() => {
        const body = document.body;
        if (location.pathname === "/login") {
            body.style.backgroundColor = "#f0f0f0";
        } else {
            body.style.backgroundColor = "#ffffff";
        }
        return () => {
            body.style.backgroundColor = "";
        };
    }, [location]);

    const handleLogin = async (e) => {
        e.preventDefault();
        const auth = getAuth();

        try {
            // Query Firestore for email and check status
            const userQuery = query(
                collection(firestore, "AccountInformation"),
                where("email", "==", email)
            );
            const querySnapshot = await getDocs(userQuery);

            if (querySnapshot.empty) {
                Swal.fire({
                    icon: 'error',
                    title: 'Account Not Found',
                    text: 'The email you entered does not match any account.',
                });
                return;
            }

            // Check the status of the user
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            if (userData.status !== "Verified") {
                Swal.fire({
                    icon: 'warning',
                    title: 'Account Not Verified',
                    text: 'Your account is still being verified by the admin. Please wait for approval. Thank you.',
                });
                return;
            }

            // Proceed with Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            Swal.fire({
                icon: 'success',
                title: 'Login Successful!',
                text: 'Welcome back!',
                timer: 2000,
                showConfirmButton: false,
            });

            console.log("Logged in user:", userCredential.user);

            if (userData.membership === "Admin") {
                navigate('/admin/dashboard');
            } else if (userData.membership === "AmbulancePersonnel") {
                navigate('/arp/dashboard');
            } else if (userData.membership === "EmergencyPersonnel") {
                navigate('/admin/dashboard');
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: error.message,
            });

            console.error("Login error:", error);
        }
    };

    return (
        <div className="login_page d-flex justify-content-center align-items-center vh-100">
            <div className="login_container">

                <div className="container"  >
                    <div className="login-form-wrapper"  >
                        <img src='assets/img/authbg/ambulance.gif'
                            className='ambulance_gif' />

                        <h2 className="title">LOGIN</h2>
                        <p className="subtitle">Login to continue</p>
                        <form onSubmit={handleLogin} className="form">

                            <div className="input-group">
                                <label htmlFor="email" className="label">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="password" className="label">Password:</label>
                                <input
                                    type="password"
                                    id="password"
                                    className="input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="button">Log In</button>
                        </form>
                        <p className="footer">
                            Don't have an account? <a href="/signup" className="link">Sign up</a>
                        </p>
                    </div>
                </div>


            </div>
        </div>
    );
}

export default LoginForm;
