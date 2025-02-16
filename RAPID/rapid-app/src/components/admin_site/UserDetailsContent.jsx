import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase/firebase'; // Assuming firestore is correctly configured
import { getDoc, doc, updateDoc, addDoc, collection, serverTimestamp } from "@firebase/firestore";
/* import '../../../css/style.css';
import '../../../css/table.css'; */
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { useFetchCurrentUser } from '../arp_site/scripts/FetchCurrentUser';
import { getAuth } from "firebase/auth";

function UserDetailsContent() {

    const { accountId } = useParams(); // Get accountId from the URL
    const [account, setAccount] = useState(null); // State to hold the fetched data
    const [loading, setLoading] = useState(true); // Loading state


    // Function to update account status in Firestore
    const updateStatus = async (newStatus) => {
        try {
            const docRef = doc(firestore, "AccountInformation", accountId);
            await updateDoc(docRef, { status: newStatus }); // Update the 'status' field in Firestore
            setAccount((prev) => ({ ...prev, status: newStatus })); // Update local state  

            const auth = getAuth();
            const currentUser = auth.currentUser; // Get the currently logged-in user

            if (currentUser) {
                try {

                    const notif_docRef = await addDoc(collection(firestore, "NotificationInformation"), {
                        NotificationStatus: "UpdateAccount",
                        TrackingStatus: newStatus,
                        savedAt: serverTimestamp(),
                        AccountId: currentUser.uid,
                        UserAccountID: accountId,
                    });

                    await updateDoc(doc(firestore, "NotificationInformation", notif_docRef.id), {
                        NotificationId: notif_docRef.id,
                    });

                    // Show success SweetAlert
                    Swal.fire({
                        icon: 'success',
                        title: 'Status Updated',
                        text: `Account status has been updated to "${newStatus}".`,
                        confirmButtonText: 'OK',
                    });

                } catch (err) {
                    console.error("Error updating account status:", err);
                }
            } else {
                console.error("No user is currently logged in.");
                Swal.fire({
                    icon: 'error',
                    title: 'Authentication Error',
                    text: 'You must be logged in to update the patient status.',
                });
            }


        } catch (error) {
            console.error("Error updating account status:", error);

            // Show error SweetAlert
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update the account status.',
                confirmButtonText: 'Try Again',
            });
        }
    };

    useEffect(() => {
        // Function to fetch account data from Firestore
        const fetchAccount = async () => {
            try {
                const docRef = doc(firestore, "AccountInformation", accountId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setAccount(docSnap.data());
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching account details:", error);
            } finally {
                setLoading(false); // Stop loading
            }
        };

        fetchAccount();
    }, [accountId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!account) {
        return <div>No account details available</div>;
    }

    return (
        <>
            <main id="main" className="main">
                <div className="content">
                    <h1>Manage User Account</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a>Admin</a>
                            </li>
                            <li className="breadcrumb-item ">
                                <a href="/manage_user_accounts">Manage User Account</a>
                            </li>
                            <li className="breadcrumb-item active">User Account Details</li>
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

                                                    <div className="row w-100 mb-3 justify-content-start">
                                                        <div className="col-12 col-md-12 d-flex flex-column align-items-center justify-content-center">
                                                            <div className="card-icon rounded-circle d-flex align-items-center justify-content-center mb-3">
                                                                <img src="../../assets/img/med_logo.png" alt="User" className="img-fluid" />
                                                            </div>
                                                            <br></br>
                                                            <h6 className="mb-1 text-center">{account.firstName} {account.lastName}</h6>
                                                            <h7>{account.email}</h7>
                                                            <span className="text-muted small text-center">Account Status: <b>{account.status || "Unknown"}</b></span>
                                                        </div>

                                                        <div className="col-12 col-md-12 d-flex flex-column align-items-center justify-content-center">
                                                            <hr />
                                                            <div className="d-flex justify-content-around mt-3 w-auto">
                                                                <button
                                                                    className="btn btn-verified"
                                                                    onClick={() => updateStatus("Verified")}
                                                                >
                                                                    Verified
                                                                </button>
                                                                <button
                                                                    className="btn btn-pending"
                                                                    onClick={() => updateStatus("Pending")}
                                                                >
                                                                    Pending
                                                                </button>
                                                                <button
                                                                    className="btn btn-deactivate"
                                                                    onClick={() => updateStatus("Deactivated")}
                                                                >
                                                                    Deactivate
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Add the remaining cards and sections here */}
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
                                {/* Add other sections */}
                            </div>
                        </section>
                    </div>
                </main>
            </main>
        </>
    );
}

export default UserDetailsContent;
