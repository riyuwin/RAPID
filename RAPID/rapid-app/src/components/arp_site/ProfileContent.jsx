import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase/firebase';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link, useParams } from 'react-router-dom';

function ProfileContent() {
    const { accountId } = useParams(); // Get accountId from the URL
    const [account, setAccount] = useState(null); // State to hold the fetched data
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const auth = getAuth();

        // Listen for authentication state changes
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const currentUid = user.uid;

                const accountsRef = collection(firestore, "AccountInformation");
                const q = query(accountsRef, where("accountId", "==", currentUid));

                // Real-time listener for Firestore data
                const unsubscribeFirestore = onSnapshot(
                    q,
                    (querySnapshot) => {
                        if (!querySnapshot.empty) {
                            const accountData = querySnapshot.docs[0].data();
                            setAccount(accountData);
                            console.log("Real-time account data:", accountData);
                        } else {
                            console.log("No account found with the matching accountId.");
                            setAccount(null);
                        }
                        setLoading(false);
                    },
                    (error) => {
                        console.error("Error fetching real-time updates:", error);
                        setLoading(false);
                    }
                );

                // Cleanup Firestore listener
                return () => unsubscribeFirestore();
            } else {
                setAccount(null);
                setLoading(false);
            }
        });

        // Cleanup authentication listener
        return () => unsubscribeAuth();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <main id="main" className="main">
                <div className="content">
                    <br />
                    <h1>My Profile</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link to="/arp/dashboard">Home</Link>
                            </li>
                            <li className="breadcrumb-item">
                                <a >My Profile</a>
                            </li>
                        </ol>
                    </nav>
                </div>

                <hr />


                <main className="py-6  ">
                    <div className="container-fluid">
                        <section className="section dashboard">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="row">

                                        <div className="col-xxl-12 col-md-12">
                                            <div className="card info-card sales-card">
                                                <div className="card-body d-flex flex-column align-items-center justify-content-center">
                                                    <h5 className="card-title text-center mb-3">
                                                        User Account Details
                                                        <hr />
                                                    </h5>
                                                    {account ? (
                                                        <div className="row w-100 mb-3 justify-content-start">
                                                            <div className="col-12 col-md-12 d-flex flex-column align-items-center justify-content-center">
                                                                <div className="card-icon rounded-circle d-flex align-items-center justify-content-center mb-3">
                                                                    <img
                                                                        src="../../assets/img/med_logo.png"
                                                                        alt="User"
                                                                        className="img-fluid"
                                                                    />
                                                                </div>
                                                                <h6 className="mb-1 text-center">
                                                                    {account.firstName} {account.lastName}
                                                                </h6>
                                                                <p>{account.email}</p>
                                                                <span className="text-muted small text-center">
                                                                    Account Status: <b>Active</b>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p>No account details available.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-12">
                                            <div className="row">

                                                <div className="col-xxl-12 col-md-12">
                                                    <div className="card info-card sales-card">
                                                        <div className="card-body d-flex flex-column align-items-center justify-content-center">

                                                            <div className="row w-100 mb-3 justify-content-start">
                                                                <div className="col-12 col-md-12 d-flex flex-column align-items-start justify-content-start">
                                                                    <br></br>
                                                                    <span className="text-muted small text-center"><b style={{ color: '#202020' }}>Basic Information</b></span>
                                                                    <br></br>
                                                                </div>
                                                                <hr></hr>

                                                                <div className="col-4 col-md-4 d-flex flex-column align-items-start justify-content-start">
                                                                    <span className="text-muted small text-center">First Name: </span>
                                                                    <h7 className="mb-1 text-center custom-name">{account.firstName}</h7>
                                                                </div>

                                                                <div className="col-4 col-md-4 d-flex flex-column align-items-start justify-content-start">
                                                                    <span className="text-muted small text-center">Middle Name: </span>
                                                                    <h7 className="mb-1 text-center custom-name">{account.middleName || "N/A"}</h7>
                                                                </div>

                                                                <div className="col-4 col-md-4 d-flex flex-column align-items-start justify-content-start">
                                                                    <span className="text-muted small text-center">Last Name: </span>
                                                                    <h7 className="mb-1 text-center custom-name">{account.lastName}</h7>
                                                                    <br></br>
                                                                </div>

                                                                <hr></hr>

                                                                <div className="col-4 col-md-4 d-flex flex-column align-items-start justify-content-start">
                                                                    <span className="text-muted small text-center">Gender: </span>
                                                                    <h7 className="mb-1 text-center custom-name">{account.gender || "N/A"}</h7>
                                                                </div>

                                                                <div className="col-4 col-md-4 d-flex flex-column align-items-start justify-content-start">
                                                                    <span className="text-muted small text-center">Birthdate: </span>
                                                                    <h7 className="mb-1 text-center custom-name">{account.birthday || "N/A"}</h7>
                                                                </div>

                                                                <div className="col-4 col-md-4 d-flex flex-column align-items-start justify-content-start">
                                                                    <span className="text-muted small text-center">Email: </span>
                                                                    <h7 className="mb-1 text-center custom-name">{account.email}</h7>
                                                                    <br></br>
                                                                </div>

                                                                <hr></hr>

                                                                <div className="col-12 col-md-12 d-flex flex-column align-items-start justify-content-start">
                                                                    <span className="text-muted small text-center">Address: </span>
                                                                    <h7 className="mb-1 text-center custom-name">{account.address || "N/A"}</h7>
                                                                </div>

                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Add the remaining cards and sections here */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </section>
                    </div>
                </main>
            </main>
        </>
    );
}

export default ProfileContent;
