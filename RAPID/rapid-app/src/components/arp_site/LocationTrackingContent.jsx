import React, { useState, useEffect } from 'react';
import '../../../css/style.css';
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


function LocationTrackingContent() {
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [account, setAccount] = useState(null);
    const [ambulance, setAmbulance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ambulances, setAmbulances] = useState([]);
    const [selectedAmbulanceId, setSelectedAmbulanceId] = useState(null);
    const [accountDocId, setAccountDocId] = useState(null);

    const { accountId, currentUserloading } = useFetchCurrentUser();

    const { data: patientList, patient_loading, error } = FetchPatientList();

    const [actionParameter, setActionParameter] = useState(null);
    const [modalTitle, setModalTitle] = useState("");
    const [editPatientID, setPatientID] = useState("");

    const [showSubmit, setShowSubmit] = useState(true);


    const [arpId, setArpId] = useState(null);

    useEffect(() => {
        if (accountId) {
            console.log("Fetched accountId:", accountId);

            fetchData(accountId)
        }
    }, [accountId]);

    const fetchData = async (user_accountId) => {
        try {
            // Fetch the ARP ID first
            const arpId = await FetchActiveARP(user_accountId);

            if (arpId) {
                console.log("Fetched ARP ID1222:", arpId);

                setArpId(arpId); // Set the ARP document ID

            } else {
                console.log("No matching ARP ID found.");
            }
        } catch (error) {
            console.error("Error:", error.message);
        }
    };

    useEffect(() => {
        if (!accountId) {
            console.warn("Account ID is not available yet.");
            return;
        }

        const fetchAccountDetails = async () => {
            try {
                console.log("Fetching account details for accountId:", accountId);
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

    return (
        <>
            <div className="main_arp">
                <div className="container-arp">
                    <h1>asgsag</h1>
                </div>

                <div className="content"  >
                    <div className="row">
                        <div className="col-12">
                            <h1>Location Tracking Report</h1>
                            <nav  >
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <a>Ambulance Personnel</a>
                                    </li>
                                    <li className="breadcrumb-item active">Location Tracking Report</li>
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
                        <TrackingTable currentUid={arpId} />
                        {/* <TrackingModal /> */}
                    </div>
                </section >
            </div >
        </>
    );
}

export default LocationTrackingContent;
