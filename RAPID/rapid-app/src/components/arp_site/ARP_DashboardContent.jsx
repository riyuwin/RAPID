import React, { useState, useEffect } from 'react';
/* import '../../../css/style.css'; */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { firestore } from '../../firebase/firebase';
import { addDoc, collection, getDocs, query, where, doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Swal from 'sweetalert2';
import { handleSavePatientCareReport } from './scripts/SavePatientCareReport';
import { useFetchCurrentUser } from './scripts/FetchCurrentUser';
import FetchPatientList from './scripts/FetchPatientList';
import PatientCareReportFetcher from './scripts/PatientCareReportFetcher';
import { PopulatePatientCareReport } from './scripts/PopulatePatientCareReport';
import DeletePatientCareReport from './scripts/DeletePatientCareReport';
import { handleEditPatientCareReport } from './scripts/EditPatientCareReport';
import { ResetForms } from './scripts/ResetForms';
import EditAmbulanceModal from './EditAmbulanceModal';
import FormModal from './FormModal';
import MapContent from './MapContent';
import TrackingModal from './TrackingModal';
import MapWithTracking from './scripts/MapWithTracking';
import TrackingTable, { useFetchTrackingInformation } from './scripts/FetchTrackingInformation';
import FetchActiveARP from './scripts/FetchActiveARP';
import TopNav from './TopNav';
import FetchActiveTracking from './scripts/FetchActiveTracking';
import { DisplayMap } from './scripts/DisplayMap';


function ARP_DashboardContent() {
    const [account, setAccount] = useState(null);
    const [ambulance, setAmbulance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ambulances, setAmbulances] = useState([]);
    const [selectedAmbulanceId, setSelectedAmbulanceId] = useState(null);
    const [accountDocId, setAccountDocId] = useState(null);
    const { accountId, currentUserloading } = useFetchCurrentUser();
    const [editPatientID, setPatientID] = useState("");
    const [arpId, setArpId] = useState(null);
    const [trackingData, setTrackingData] = useState(null);


    const [selectedTrackingData, setSelectedTrackingData] = useState(null);
    const [coordinatesDetails, setCoordinatesDetails] = useState([]);

    const fetchActiveARP = async (user_accountId) => {
        try {
            // Fetch the ARP ID first
            const arpId = await FetchActiveARP(user_accountId);

            if (arpId) {
                setArpId(arpId); // Set the ARP document ID

                return { arpId }

            } else {
                console.log("No matching ARP ID found.");
            }
        } catch (error) {
            console.error("Error:", error.message);
        }
    };

    // Define a callback to handle real-time updates
    const handleRealtimeUpdates = (data) => {
        if (data.length > 0) {
            if (data && data.length > 0) {
                setCoordinatesDetails(data[0].coordinates)
                return { data };

            } else {
                console.log("No active tracking data found.");
            }
        } else {
            console.log("No active tracking data found.");
        }
    };


    const fetchData = async (user_accountId) => {
        try {
            // Fetch the ARP ID first
            const arpId = await FetchActiveARP(user_accountId);

            if (arpId) {
                const unsubscribe = FetchActiveTracking(arpId, handleRealtimeUpdates);
            } else {
                console.log("No matching ARP ID found.");
            }
        } catch (error) {
            console.error("Error:", error.message);
        }
    };

    useEffect(() => {
        if (accountId) {
            const ambulance_personnel_id = fetchActiveARP(accountId);

            fetchData(ambulance_personnel_id);
        }
    }, [accountId])

    useEffect(() => {
        if (accountId) {
            fetchData(accountId)
        }
    }, [accountId]);



    const handleEditClick = (patientId) => {

        console.log("HEHE", patientId)

        ResetForms();
        // Call the fetch function and log the data
        PatientCareReportFetcher(patientId, (data, err) => {
            if (err) {
                console.error("Error fetching data:", err);
            } else {

                // Ensure valid data is passed to PopulatePatientCareReport
                if (data && data.length > 0) {
                    setPatientID(patientId)
                    PopulatePatientCareReport(data);
                } else {
                    console.error("No data returned for patient ID:", patientId);
                }
            }
        });
    };


    useEffect(() => {
        if (!accountId) {
            console.warn("Account ID is not available yet.");
            return;
        }

        const fetchAccountDetails = async () => {
            try {
                setLoading(true);

                const accountsRef = collection(firestore, "AccountInformation");
                const q = query(accountsRef, where("accountId", "==", accountId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const accountData = querySnapshot.docs[0].data();
                    const docId = querySnapshot.docs[0].id;
                    setAccount(accountData);
                    setAccountDocId(docId);
                } else {
                    console.error("No account found with the matching accountId.");
                }
            } catch (error) {
                console.error("Error fetching account details:", error);
            } finally {
                setLoading(false);
            }
        };

        // Call the async function
        fetchAccountDetails();
    }, [accountId]);

    // Real-time listener for Ambulance information (only once account is set)
    useEffect(() => {
        if (account && account.ambulanceId) {
            const docRef = doc(firestore, "AmbulanceInformation", account.ambulanceId);
            const unsubscribeAmbulance = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const ambulanceData = docSnap.data(); // Document data
                    setAmbulance(ambulanceData);
                } else {
                    console.log("No document found with the given ID.");
                }
            });

            // Cleanup listener when component unmounts or account changes
            return () => unsubscribeAmbulance();
        }
    }, [account]); // Only re-run the effect when account changes

    // Fetch all Ambulances for the select dropdown
    useEffect(() => {
        const fetchAmbulances = async () => {
            try {
                const ambulanceRef = collection(firestore, "AmbulanceInformation");
                const querySnapshot = await getDocs(ambulanceRef);
                const ambulanceData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAmbulances(ambulanceData);
            } catch (error) {
                console.error("Error fetching ambulances:", error);
            }
        };

        fetchAmbulances();
    }, []);

    // Pre-select the ambulanceId when the account is set
    useEffect(() => {
        if (account && account.ambulanceId) {
            setSelectedAmbulanceId(account.ambulanceId);
        }
    }, [account]);


    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: '2-digit' }; // Format: January 05, 2003
        return date.toLocaleDateString('en-US', options);
    }



    return (
        <>
            <div className="main_arp">
                <div className="container-arp">
                    <h1>asgsag</h1>
                </div>

                <div className="content"  >
                    <div className="row">
                        <div className="col-12">
                            <h1>Dashboard</h1>
                            <nav  >
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <a>Ambulance Personnel</a>
                                    </li>
                                    <li className="breadcrumb-item active">Dashboard</li>
                                </ol>
                            </nav>
                        </div>
                        <TopNav />


                    </div>
                </div>
                <br></br>

                <br></br>

                <section className="section dashboard">
                    <div className="row">

                        <div className="col-lg-6">
                            <div className="row">
                                <div className="col-xxl-12 col-md-12">
                                    <div className="card info-card sales-card text-center">
                                        <div className="card-body">
                                            <h5 className="card-title">Map</h5>
                                            <div className="d-flex align-items-center justify-content-center">
                                                <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                                                    <img src="../../assets/img/ambulance_logo.png" alt="1" />
                                                </div>
                                            </div>
                                            <hr />

                                            <div className="container-fluid">
                                                <p className="text-start ambulance_text">
                                                    Ambulance Name: <b>{ambulance?.AmbulanceName}</b>
                                                </p>
                                                <p className="text-start ambulance_text">
                                                    Updated at: <b>
                                                        {account?.updatedAt
                                                            ? account.updatedAt.toDate
                                                                ? account.updatedAt.toDate().toLocaleDateString() // Only date, no time
                                                                : account.updatedAt // If it's already a string, use as is
                                                            : ""}
                                                    </b>
                                                </p>
                                            </div>

                                            <hr />

                                            {/* <button className="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#exampleModal"
                                                onClick={() => handleEditClick(patient.id)}>
                                                <i className="bx bx-edit-alt"
                                                    style={{ marginTop: "5px" }}></i> Edit
                                            </button> */}

                                            <EditAmbulanceModal />

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="row">
                                <div className="col-xxl-12 col-md-12">
                                    <div className="card info-card sales-card text-center">
                                        <div className="card-body">
                                            <h5 className="card-title">Active Location Tracking</h5>
                                            <div className="d-flex align-items-center justify-content-center">
                                                <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                                                    <img src="../../assets/img/location_logo.png" alt="1" />
                                                </div>
                                            </div>
                                            <hr />

                                            <div className="row">
                                                <div className="col-12">
                                                </div>
                                                <MapWithTracking page={"Dashboard"} />
                                            </div>


                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-12">
                            <div className="row">
                                <div className="col-xxl-12 col-md-12">
                                    <div className="card info-card sales-card text-center">
                                        <div className="card-body">
                                            <h5 className="card-title">Map Details</h5>
                                            <hr />

                                            <DisplayMap coordinates={coordinatesDetails} />

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Modal for selecting ambulance */}


                    </div>
                </section >
            </div >
        </>
    );
}

export default ARP_DashboardContent;
