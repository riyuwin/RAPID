import React, { useState, useEffect, useRef } from 'react';
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
import { UpdatePatientStatus } from '../admin_site/scripts/UpdatePatientStatus';
import GeneratePdf from './GeneratePDF';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Modal } from "bootstrap";
import CharacterModel from './CharacterModel';

function PatientCareReportContent() {
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

    const [modalRemarks, setModalRemarks] = useState("");
    const [viewPatientStatus, setPatientStatus] = useState("");

    const [arpId, setArpId] = useState(null);
    const [patientDetails, setPatientDetails] = useState(null);

    useEffect(() => {
        if (accountId) {
            fetchData(accountId)
        }
    }, [accountId]);

    const fetchData = async (user_accountId) => {
        try {
            // Fetch the ARP ID first
            const arpId = await FetchActiveARP(user_accountId);

            if (arpId) {
                setArpId(arpId); // Set the ARP document ID

            } else {
                console.log("No matching ARP ID found.");
            }
        } catch (error) {
            console.error("Error:", error.message);
        }
    };


    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent default form submission
        if (actionParameter === "Add") {
            /* alert("Add"); */
            if (!ambulance || !ambulance.ambulanceId) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error saving changes!',
                    text: "Please select an ambulance first.",
                    confirmButtonText: 'Okay',
                });
            } else {
                handleSavePatientCareReport(accountId, ambulance.ambulanceId);
            }


        } else if (actionParameter === "Edit") {
            /* alert("Edit"); */
            handleEditPatientCareReport(editPatientID, accountId);
        }
    };

    // Function to update the state based on button click
    const handleActionButtonClick = (newParameter) => {

        if (!ambulance || !ambulance.ambulanceId) {
            Swal.fire({
                icon: 'info',
                title: 'No ambulance record!',
                text: "Please select an ambulance first.",
                confirmButtonText: 'Okay',
            });

            // Assuming your modal has an ID of "exampleModal"
            const modalElement = document.getElementById('addPatientCareReport');
            const bootstrapModal = bootstrap.Modal.getInstance(modalElement); // Get the modal instance
            bootstrapModal.hide();

        } else {
            setShowSubmit(true);
            setActionParameter(newParameter);

            const modal = new Modal(document.getElementById("addPatientCareReport"));
            modal.show();

            if (newParameter === "Add") {
                ResetForms();
                setModalTitle("+ Add Patient Care Report");
                setModalRemarks('Add');
            } else if (newParameter === "Edit") {
                setModalTitle("Edit Patient Care Report");
                setModalRemarks('Edit');
            } else if (newParameter === "View") {
                setModalTitle("View Patient Care Report");
                setModalRemarks("View");
            }
        }
    };

    const handleDeletePatient = (patientId) => {
        DeletePatientCareReport("PatientCareReport", accountId, patientId);
    };

    const [PDFStatus, setPDFStatus] = useState(null);

    const handleViewClick = (patientId, patient_status) => {
        ResetForms();
        handleActionButtonClick("View")
        // Call the fetch function and log the data
        PatientCareReportFetcher(patientId, (data, err) => {
            if (err) {
                console.error("Error fetching data:", err);
            } else {
                // Ensure valid data is passed to PopulatePatientCareReport
                if (data && data.length > 0) {

                    setPatientID(patientId)
                    PopulatePatientCareReport(data);
                    setPatientStatus(patient_status)
                    setShowSubmit(false);

                    console.log("Hoyyy", data)

                    // Dynamically update characterModelData
                    /* if (data[0].characterModel) {
                        setCharacterModelData(prevState => ({
                            ...prevState, // Keep previous state
                            ...data[0].characterModel // Merge new data
                        }));
                    } */

                    setPatientDetails(data);

                } else {
                    console.error("No data returned for patient ID:", patientId);
                }
            }
        });
    };

    const handleEditClick = (patientId) => {
        ResetForms();
        setShowSubmit(true);
        // Call the fetch function and log the data
        PatientCareReportFetcher(patientId, (data, err) => {
            if (err) {
                console.error("Error fetching data:", err);
            } else {

                // Ensure valid data is passed to PopulatePatientCareReport
                if (data && data.length > 0) {
                    setPatientID(patientId)
                    PopulatePatientCareReport(data);
                    handleActionButtonClick("Edit")

                    setPatientDetails(data);

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


    /* Nationality Selector */
    const [selectedNationality, setSelectedNationality] = useState("");
    const [otherNationality, setOtherNationality] = useState("");
    const [isDisabled, setIsDisabled] = useState(true);

    const handleNationalityChange = (e) => {
        /* setSelectedNationality(e.target.value); */

        document.getElementById("otherNationality").value = ""

        if (e.target.value == "Other") {
            setIsDisabled(false)
        } else {
            setIsDisabled(true)
        }


        console.log(e.target.value)
    };


    const [patientCareReportStatus, setPatientCareReportStatus] = useState("Basic Information");

    const handlePatientCareReportStatus = (e) => {
        setPatientCareReportStatus(e.target.value);
    }

    const handleOtherNationalityChange = (e) => {
        setOtherNationality(e.target.value);
    };
    /* Nationality Selector */


    const [filteredAccounts, setFilteredAccounts] = useState(patientList);

    // Handle search and filter
    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase();

        // Filter accounts by account name (combining first and last name)
        const filtered = patientList.filter(account =>
            `${account.basicInformation.firstName} ${account.basicInformation.lastName}`
                .toLowerCase()
                .includes(searchTerm)
        );
        setFilteredAccounts(filtered);
    };

    // Handle status filter
    const handleStatusFilter = (event) => {
        const selectedStatus = event.target.value;

        // If "All" is selected, reset to show all accounts
        if (!selectedStatus) {
            setFilteredAccounts(patientList);
            return;
        }

        // Filter accounts based on the selected status
        const filtered = patientList.filter(account =>
            account.patient_status === selectedStatus
        );
        setFilteredAccounts(filtered);
    };

    // Update filteredAccounts when patientList changes
    useEffect(() => {
        if (patientList.length > 0) {
            setFilteredAccounts(patientList);
        }
    }, [patientList]);

    const canvasRef = useRef(null);

    /* useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.src = "/assets/img/character_model.png";
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Draw a red circle
            ctx.beginPath();
            ctx.arc(100, 80, 30, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.fill();
        };
    }, []); */

    /* const [characterModelData, setCharacterModelData] =
        useState({
            rightHead: null,
            rightNeck: null,
            rightShoulder: null,
            rightChest: null,
            rightArm: null,
            rightHand: null,
            rightAbdomen: null,
            rightHip: null,
            rightThigh: null,
            rightKnee: null,
            rightShin: null,
            rightFoot: null,
            leftHead: null,
            leftNeck: null,
            leftShoulder: null,
            leftChest: null,
            leftArm: null,
            leftHand: null,
            leftAbdomen: null,
            leftHip: null,
            leftThigh: null,
            leftKnee: null,
            leftShin: null,
            leftFoot: null,

            rightBackHead: null,
            rightBackNeck: null,
            rightBackShoulder: null,
            rightBackArm: null,
            rightBackHand: null,
            rightBackUpperBack: null,
            rightBackLowerBack: null,
            rightBackHip: null,
            rightBackThigh: null,
            rightCalf: null,
            rightBackFoot: null,
            leftBackHead: null,
            leftBackNeck: null,
            leftBackShoulder: null,
            leftBackArm: null,
            leftBackHand: null,
            leftBackUpperBack: null,
            leftBackLowerBack: null,
            leftBackHip: null,
            leftBackThigh: null,
            leftCalf: null,
            leftBackFoot: null,
        }); */

    const [characterModelData, setCharacterModelData] = useState({
        rightHead: null,
        rightNeck: null,
        rightShoulder: null,
        rightChest: null,
        rightArm: null,
        rightHand: null,
        rightAbdomen: null,
        rightHip: null,
        rightThigh: null,
        rightKnee: null,
        rightShin: null,
        rightFoot: null,
        leftHead: null,
        leftNeck: null,
        leftShoulder: null,
        leftChest: null,
        leftArm: null,
        leftHand: null,
        leftAbdomen: null,
        leftHip: null,
        leftThigh: null,
        leftKnee: null,
        leftShin: null,
        leftFoot: null,

        rightBackHead: null,
        rightBackNeck: null,
        rightBackShoulder: null,
        rightBackArm: null,
        rightBackHand: null,
        rightBackUpperBack: null,
        rightBackLowerBack: null,
        rightBackHip: null,
        rightBackThigh: null,
        rightCalf: null,
        rightBackFoot: null,
        leftBackHead: null,
        leftBackNeck: null,
        leftBackShoulder: null,
        leftBackArm: null,
        leftBackHand: null,
        leftBackUpperBack: null,
        leftBackLowerBack: null,
        leftBackHip: null,
        leftBackThigh: null,
        leftCalf: null,
        leftBackFoot: null,
    });

    useEffect(() => {
        console.log("rightHead state changed:", characterModelData.rightHead);
        console.log("leftHead state changed:", characterModelData.leftHead);

        const rightHeadCheckbox = document.getElementById("rightHead");

        if (rightHeadCheckbox && rightHeadCheckbox.checked) {
            setCharacterModelData(prevState => ({
                ...prevState,
                rightHead: true
            }));
        }
    }, [characterModelData.rightHead, characterModelData.leftHead]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    // Compute indexes for pagination
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredAccounts.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredAccounts.length / recordsPerPage);

    return (
        <>
            <div className="main_arp">
                <div className="container-arp">
                    <h1>asgsag</h1>
                </div>

                <div className="content"  >
                    <div className="row">
                        <div className="col-12">
                            <h1>Patient Care Report</h1>
                            <nav  >
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <a>Ambulance Personnel</a>
                                    </li>
                                    <li className="breadcrumb-item active">Patient Care Report</li>
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

                        <div className="col-lg-12">
                            <div className="row">
                                <div className="col-xxl-12 col-md-12">
                                    <div className="card info-card sales-card">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="card-title">Patient Care Report</h5>
                                                <button className="btn btn-sm btn-primary" onClick={() => handleActionButtonClick('Add')}>+ Add Patient Care Report</button>
                                            </div>

                                            {/* Filter and Search Section */}
                                            <div className="row mb-3 justify-content-end">
                                                <div className="col-sm-3">
                                                    <div className="input-group justify-content-end">
                                                        <label >Filter: </label>
                                                    </div>
                                                </div>
                                                <div className="col-sm-3">
                                                    <div className="input-group">
                                                        <select className="form-select" id="statusFilter" onChange={handleStatusFilter}>
                                                            <option value="">All</option>
                                                            <option value="Active">Active</option>
                                                            <option value="Completed">Completed</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-sm-3">
                                                    <div className="input-group">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="searchInput"
                                                            placeholder="Search Account Name"
                                                            onChange={handleSearch}
                                                        />
                                                    </div>
                                                </div>
                                            </div>




                                            {/* Table Section */}
                                            <div>
                                                {/* Table Section */}
                                                <div className="table-responsive">
                                                    <table className="table datatable table-custom">
                                                        <thead>
                                                            <tr>
                                                                <th>No.</th>
                                                                <th>Patient Name</th>
                                                                <th>Date Reported</th>
                                                                <th>Status</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {patient_loading ? (
                                                                <tr>
                                                                    <td colSpan="5" className="text-center">Loading patient data...</td>
                                                                </tr>
                                                            ) : error ? (
                                                                <tr>
                                                                    <td colSpan="5" className="text-center">Fetching Data...</td>
                                                                </tr>
                                                            ) : currentRecords.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="5" className="text-center">No patient records found.</td>
                                                                </tr>
                                                            ) : (
                                                                currentRecords.map((patient, index) => (
                                                                    <tr key={patient.id}>
                                                                        <td>{indexOfFirstRecord + index + 1}</td>
                                                                        <td>
                                                                            {`${patient.basicInformation?.firstName || "Unknown"} ${patient.basicInformation?.surname || ""}`.trim()}
                                                                        </td>
                                                                        <td>
                                                                            {patient.savedAt
                                                                                ? new Date(patient.savedAt.toDate()).toLocaleString('en-US', {
                                                                                    month: 'long',
                                                                                    day: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit',
                                                                                    hour12: true
                                                                                }).replace(',', ' at')
                                                                                : "N/A"
                                                                            }
                                                                        </td>
                                                                        <td>{patient.patient_status || "Active"}</td>
                                                                        <td>
                                                                            <button className="btn btn-success btn-sm"
                                                                                onClick={() => handleViewClick(patient.id, patient.patient_status)}>
                                                                                <i className="fas fa-eye"></i> View
                                                                            </button>

                                                                            <button className="btn btn-primary btn-sm"
                                                                                onClick={() => handleEditClick(patient.id)}>
                                                                                <i className="fas fa-edit"></i> Edit
                                                                            </button>

                                                                            <button className="btn btn-danger btn-sm"
                                                                                onClick={() => handleDeletePatient(patient.id)}>
                                                                                <i className="fas fa-trash"></i> Delete
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <br />

                                                {/* Pagination Controls */}
                                                <div className="d-flex justify-content-between align-items-center mt-3">
                                                    <button
                                                        className="btn btn-secondary"
                                                        disabled={currentPage === 1}
                                                        onClick={() => setCurrentPage(currentPage - 1)}
                                                    >
                                                        Previous
                                                    </button>

                                                    <span>Page {currentPage} of {totalPages}</span>

                                                    <button
                                                        className="btn btn-secondary"
                                                        disabled={currentPage === totalPages}
                                                        onClick={() => setCurrentPage(currentPage + 1)}
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal for selecting ambulance */}

                        {/* Modal for selecting ambulance */}
                        <div className="modal fade" id="addPatientCareReport" tabindex="-1" aria-labelledby="addPatientCareReport" aria-hidden="true">
                            <div className="modal-dialog modal-xl"> {/* Apply modal-lg for a larger width */}
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="modalTitle">{modalTitle}</h5>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <form /* onSubmit={handleSavePatientCareReport} */ onSubmit={handleSubmit}>
                                        <div className="modal-body ">

                                            <div className="modal_container">


                                                <div className="row">

                                                    {modalRemarks == "View" &&
                                                        <>
                                                            <div className="label_container">
                                                                <div className="row d-flex justify-content-start align-items-start">
                                                                    <div className="col-md-6">
                                                                        <label style={{ color: 'black', marginBottom: '10px' }} for="ambulanceInput">Patient Report Status:<b> {viewPatientStatus} </b></label>
                                                                    </div>

                                                                    <div className="col-md-6 d-flex justify-content-end align-items-end">
                                                                        < GeneratePdf />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    }

                                                    {modalRemarks == "Edit" &&
                                                        <>
                                                            <div className="label_container">
                                                                <div className="row d-flex justify-content-start align-items-start">
                                                                    <div className="col-md-12">
                                                                        <p style={{ color: 'black', marginTop: '10px' }} for="ambulanceInput"><i>Note: You can update the status of the report by selecting one of the following options.  </i> </p><br></br>
                                                                    </div>

                                                                    <div className="col-md-12 d-flex justify-content-start align-items-start" >
                                                                        <label style={{ color: 'black', marginBottom: '10px' }} for="ambulanceInput">Select Report Status:   </label>
                                                                    </div>

                                                                    <div className="col-md-12 d-flex justify-content-start align-items-start">
                                                                        <button className="btn btn-success btn-sm" style={{ marginRight: '10px' }}
                                                                            type="button"
                                                                            onClick={() => { UpdatePatientStatus(editPatientID, accountId, "Completed") }}>
                                                                            <i className="fa fa-check"></i> Completed
                                                                        </button>

                                                                        <button className="btn btn-primary btn-sm" style={{ marginRight: '10px' }}
                                                                            type="button"
                                                                            onClick={() => { UpdatePatientStatus(editPatientID, accountId, "Active") }}>
                                                                            <i className="fa fa-circle"></i> Active
                                                                        </button>

                                                                        <button className="btn btn-danger btn-sm" style={{ marginRight: '10px' }}
                                                                            type="button"
                                                                            onClick={() => { UpdatePatientStatus(editPatientID, accountId, "Did Not Arrive") }}>
                                                                            <i className="fa fa-times"></i> Did Not Arrive
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </>
                                                    }


                                                    <div className="label_container">

                                                        <div className="col-md-12">

                                                            <div className="row">

                                                                <div className="col-md-12">
                                                                    <div className="row mb-3 justify-content-start">
                                                                        <div className="col-sm-3">
                                                                            <div className="input-group justify-content-center">
                                                                                <label >Filter: </label>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-sm-9">
                                                                            <div className="input-group">
                                                                                <select
                                                                                    id="patientCareSelect"
                                                                                    className="form-select"
                                                                                    onChange={handlePatientCareReportStatus}
                                                                                >
                                                                                    <option value="Basic Information">Basic Information</option>
                                                                                    <option value="Call Received">Call Received</option>
                                                                                    <option value="Clinical Impression">Clinical Impression</option>
                                                                                    <option value="Glasgow Coma Scale (GCS)">Glasgow Coma Scale (GCS)</option>
                                                                                    <option value="Basic Life Support (BLS)">Basic Life Support (BLS)</option>
                                                                                    <option value="Complaint Details">Complaint Details</option>
                                                                                    <option value="Level of Conciousness">Level of Conciousness</option>
                                                                                    <option value="Character Model">Character Model</option>
                                                                                    <option value="Endorsed Team">Endorsed Team</option>
                                                                                    <option value="Incident Information">Incident Information</option>
                                                                                    <option value="Part 1. Vehicular Accident Incident Details">Part 1. Vehicular Accident Incident Details</option>
                                                                                    <option value="Part 2. Vehicular Accident Incident Details">Part 2. Vehicular Accident Incident Details</option>
                                                                                    <option value="Part 3. Vehicular Accident Involved Incident Details">Part 3. Vehicular Accident Involved Incident Details</option>
                                                                                </select>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <hr /><br />

                                                            <p><b>{patientCareReportStatus}:</b></p><br />
                                                        </div>

                                                        <div style={{ display: patientCareReportStatus === "Call Received" ? "block" : "none" }}>
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput">Call Received: <span className='required-form'>*</span></label>
                                                                    <input
                                                                        id='callReceived'
                                                                        type="text"
                                                                        className="form-control"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">To Scene: <span className='required-form'>*</span></label>
                                                                    <input
                                                                        id='toScene'
                                                                        type="text"
                                                                        className="form-control"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">At Scene: <span className='required-form'>*</span></label>
                                                                    <input
                                                                        id='atSceneInput'
                                                                        type="text"
                                                                        className="form-control"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">To Hospital: <span className='required-form'>*</span></label>
                                                                    <input
                                                                        id='toHospitalInput'
                                                                        type="text"
                                                                        className="form-control"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">At Hospital: <span className='required-form'>*</span></label>
                                                                    <input
                                                                        id='atHospitalInput'
                                                                        type="text"
                                                                        className="form-control"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Base: <span className='required-form'>*</span></label>
                                                                    <input
                                                                        id='baseInput'
                                                                        type="text"
                                                                        className="form-control"
                                                                    />
                                                                </div>


                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: patientCareReportStatus === "Basic Information" ? "block" : "none" }}>
                                                            <div className="row">
                                                                <div className="col-md-3" >
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">First Name: <span className='required-form'>*</span></label>
                                                                    <input
                                                                        id='nameInput'
                                                                        type="text"
                                                                        className="form-control"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Middle Name:   </label>
                                                                    <input
                                                                        id='middleNameInput'
                                                                        type="text"
                                                                        className="form-control"
                                                                    />
                                                                </div>


                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Surname: <span className='required-form'>*</span></label>
                                                                    <input
                                                                        id='surnameInput'
                                                                        type="text"
                                                                        className="form-control"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Suffix:</label>
                                                                    <input
                                                                        id='suffixInput'
                                                                        type="text"
                                                                        className="form-control"
                                                                    />
                                                                </div>

                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>


                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Age: <span className='required-form'>*</span></label>
                                                                    <input
                                                                        id='ageInput'
                                                                        type="number"
                                                                        className="form-control"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="genderSelect">Gender: <span className='required-form'>*</span></label>
                                                                    <select
                                                                        id="genderSelect"
                                                                        className="form-select"
                                                                    >
                                                                        <option value="">Select Gender</option>
                                                                        <option value="Male">Male</option>
                                                                        <option value="Female">Female</option>
                                                                    </select>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Date of Birth:</label>
                                                                    <input
                                                                        id='birthdateInput'
                                                                        type="date"
                                                                        className="form-control"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3" >
                                                                    <label style={{ color: "black", marginBottom: "10px", marginTop: '10px' }} htmlFor="nationalitySelect">
                                                                        Nationality: <span className='required-form'>*</span>
                                                                    </label>
                                                                    <select
                                                                        id="nationalitySelect"
                                                                        className="form-select"
                                                                        onChange={handleNationalityChange}
                                                                    >
                                                                        <option value="Filipino">Filipino</option>
                                                                        <option value="Other">Other</option>
                                                                    </select>

                                                                    <div style={{ marginTop: "10px" }}>
                                                                        <label htmlFor="otherNationality" style={{ color: "black", marginBottom: "10px", marginTop: '10px' }}>
                                                                            <i>If not Filipino:</i>
                                                                        </label>
                                                                        <input
                                                                            id="otherNationality"
                                                                            type="text"
                                                                            disabled={isDisabled}
                                                                            className="form-control"
                                                                            placeholder="Please specify your nationality"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-12">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="addressInput123">Complete Residential Address: <span className='required-form'>*</span></label>
                                                                    <input
                                                                        id='addressInput'
                                                                        type="text"
                                                                        className="form-control"
                                                                    />
                                                                </div>

                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>
                                                            </div>
                                                        </div>



                                                        <div style={{ display: patientCareReportStatus === "Clinical Impression" ? "block" : "none" }}>
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="triageTaggingR">Triage Tagging: <span className='required-form'>*</span></label>

                                                                    <br />
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="triageTaggingR" name="triageTagging" className="form-check-input" />
                                                                        <label htmlFor="triageTaggingR" className="form-check-label">R</label><br />

                                                                        <input type="checkbox" id="triageTaggingY" name="triageTagging" className="form-check-input" />
                                                                        <label htmlFor="triageTaggingY" className="form-check-label">Y</label><br />

                                                                        <input type="checkbox" id="triageTaggingG" name="triageTagging" className="form-check-input" />
                                                                        <label htmlFor="triageTaggingG" className="form-check-label">G</label><br />

                                                                        <input type="checkbox" id="triageTaggingB" name="triageTagging" className="form-check-input" />
                                                                        <label htmlFor="triageTaggingB" className="form-check-label">B</label><br />

                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="natureCallEmergent">Nature of Call: <span className='required-form'>*</span></label>

                                                                    <br />
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="natureCallEmergent" name="natureOfCall" className="form-check-input" />
                                                                        <label htmlFor="natureCallEmergent" className="form-check-label">Emergent</label><br />

                                                                        <input type="checkbox" id="natureCallUrgent" name="natureOfCall" className="form-check-input" />
                                                                        <label htmlFor="natureCallUrgent" className="form-check-label">Urgent</label><br />

                                                                        <input type="checkbox" id="natureCallNonEmergent" name="natureOfCall" className="form-check-input" />
                                                                        <label htmlFor="natureCallNonEmergent" className="form-check-label">Non-Emergent</label><br />

                                                                    </div>
                                                                </div>

                                                                <div className="col-md-12">
                                                                    <hr />
                                                                    <h5 className="card-title text-center mb-3" style={{ color: 'black' }}>
                                                                        Nature of Illness
                                                                    </h5>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="cardiacArrest">Cardiac: <span className='required-form'>*</span></label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="cardiacArrest" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiacArrest" className="form-check-label">Cardiac Arrest</label><br />

                                                                        <input type="checkbox" id="cardiacArrhythmia" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiacArrhythmia" className="form-check-label">Cardiac Arrhythmia</label><br />

                                                                        <input type="checkbox" id="cardiacChestPain" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiacChestPain" className="form-check-label">Cardiac Chest Pain</label><br />

                                                                        <input type="checkbox" id="heartFailure" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="heartFailure" className="form-check-label">Heart Failure</label><br />

                                                                        <input type="checkbox" id="otherCardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="otherCardiac" className="form-check-label">Other Cardiac</label><br /><br />

                                                                        <input
                                                                            id='otherCardiacInput'
                                                                            type="text"
                                                                            className="form-control"
                                                                            style={{ marginLeft: '-10px' }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="obsGynHaemorrhage">OBS/GYNAE:</label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="obsGynHaemorrhage" name="obsGyn" className="form-check-input" />
                                                                        <label htmlFor="obsGynHaemorrhage" className="form-check-label">Haemorrhage &lt; 24 Wks</label><br />

                                                                        <input type="checkbox" id="obsGynHaemorrhageLess" name="obsGyn" className="form-check-input" />
                                                                        <label htmlFor="obsGynHaemorrhageLess" className="form-check-label">Haemorrhage &gt; 24 Wks</label><br />

                                                                        <input type="checkbox" id="obsGynLabour" name="obsGyn" className="form-check-input" />
                                                                        <label htmlFor="obsGynLabour" className="form-check-label">Labour</label><br />

                                                                        <input type="checkbox" id="obsGynPPH" name="obsGyn" className="form-check-input" />
                                                                        <label htmlFor="obsGynPPH" className="form-check-label">PPH</label><br />

                                                                        <input type="checkbox" id="obsGynPreDelivery" name="obsGyn" className="form-check-input" />
                                                                        <label htmlFor="obsGynPreDelivery" className="form-check-label">Pre-Hospital Delivery</label><br />

                                                                        <input type="checkbox" id="otherObsGyn" name="obsGyn" className="form-check-input" />
                                                                        <label htmlFor="otherObsGyn" className="form-check-label">Other Obs/Gynae</label><br />

                                                                        <input
                                                                            id='otherObsGynInput'
                                                                            type="text"
                                                                            className="form-control"
                                                                            style={{ marginLeft: '-10px' }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="neurologicalAlteredLOC">Neurological:</label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="neurologicalAlteredLOC" name="neurological" className="form-check-input" />
                                                                        <label htmlFor="neurologicalAlteredLOC" className="form-check-label">Altered LOC</label><br />

                                                                        <input type="checkbox" id="neurologicalSeizures" name="neurological" className="form-check-input" />
                                                                        <label htmlFor="neurologicalSeizures" className="form-check-label">Seizures</label><br />

                                                                        <input type="checkbox" id="neurologicalStroke" name="neurological" className="form-check-input" />
                                                                        <label htmlFor="neurologicalStroke" className="form-check-label">Stroke</label><br />

                                                                        <input type="checkbox" id="otherNeurological" name="neurological" className="form-check-input" />
                                                                        <label htmlFor="otherNeurological" className="form-check-label">Other Neurological</label><br />

                                                                        <input
                                                                            id='otherNeurologicalInput'
                                                                            type="text"
                                                                            className="form-control"
                                                                            style={{ marginLeft: '-10px' }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="traumaBurns">Trauma:</label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="traumaBurns" name="trauma" className="form-check-input" />
                                                                        <label htmlFor="traumaBurns" className="form-check-label">Burns</label><br />

                                                                        <input type="checkbox" id="traumaDislocation" name="trauma" className="form-check-input" />
                                                                        <label htmlFor="traumaDislocation" className="form-check-label">Dislocation / Sprain</label><br />

                                                                        <input type="checkbox" id="traumaFracture" name="trauma" className="form-check-input" />
                                                                        <label htmlFor="traumaFracture" className="form-check-label">Fracture</label><br />

                                                                        <input type="checkbox" id="traumaHaemorrhage" name="trauma" className="form-check-input" />
                                                                        <label htmlFor="traumaHaemorrhage" className="form-check-label">Haemorrhage</label><br />

                                                                        <input type="checkbox" id="traumaHeadInjury" name="trauma" className="form-check-input" />
                                                                        <label htmlFor="traumaHeadInjury" className="form-check-label">Head Injury</label><br />

                                                                        <input type="checkbox" id="traumaMaxilloFacial" name="trauma" className="form-check-input" />
                                                                        <label htmlFor="traumaMaxilloFacial" className="form-check-label">Maxillo-Facial Injury</label><br />

                                                                        <input type="checkbox" id="traumaMultiple" name="trauma" className="form-check-input" />
                                                                        <label htmlFor="traumaMultiple" className="form-check-label">Multiple Trauma</label><br />

                                                                        <input type="checkbox" id="traumaOpenWound" name="trauma" className="form-check-input" />
                                                                        <label htmlFor="traumaOpenWound" className="form-check-label">Open Wound</label><br />

                                                                        <input type="checkbox" id="traumaShock" name="trauma" className="form-check-input" />
                                                                        <label htmlFor="traumaShock" className="form-check-label">Shock</label><br />

                                                                        <input type="checkbox" id="traumaSoftTissue" name="trauma" className="form-check-input" />
                                                                        <label htmlFor="traumaSoftTissue" className="form-check-label">Soft Tissue Injury</label><br />

                                                                        <input type="checkbox" id="traumaSpinal" name="trauma" className="form-check-input" />
                                                                        <label htmlFor="traumaSpinal" className="form-check-label">Spinal Injury</label><br />

                                                                        <input type="checkbox" id="otherTrauma" name="trauma" className="form-check-input" />
                                                                        <label htmlFor="otherTrauma" className="form-check-label">Other Trauma</label><br />

                                                                        <input
                                                                            id='otherTraumaInput'
                                                                            type="text"
                                                                            className="form-control"
                                                                            style={{ marginLeft: '-10px' }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>


                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="mechanismInjuryAssault">Mechanism of Injury: <span className='required-form'>*</span></label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="mechanismInjuryAssault" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjuryAssault" className="form-check-label">Assault / Brawling</label><br />

                                                                        <input type="checkbox" id="mechanismInjuryAnimalAttack" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjuryAnimalAttack" className="form-check-label">Attack / Bite by Animal</label><br />

                                                                        <input type="checkbox" id="mechanismInjuryChemical" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjuryChemical" className="form-check-label">Chemical Poisining</label><br />

                                                                        <input type="checkbox" id="mechanismInjuryDrowning" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjuryDrowning" className="form-check-label">Drowning</label><br />

                                                                        <input type="checkbox" id="mechanismInjuryElectrocution" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjuryElectrocution" className="form-check-label">Electrocution</label><br />

                                                                        <input type="checkbox" id="mechanismInjuryCold" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjuryCold" className="form-check-label">Excessive Cold</label><br />

                                                                        <input type="checkbox" id="mechanismInjuryHeat" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjuryHeat" className="form-check-label">Excessive Heat</label><br />

                                                                        <input type="checkbox" id="mechanismInjuryFall" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjuryFall" className="form-check-label">Fall</label><br />

                                                                        <input type="checkbox" id="mechanismInjuryFirearm" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjuryFirearm" className="form-check-label">Firearm Injury</label><br />

                                                                        <input type="checkbox" id="mechanismInjuryChild" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjuryChild" className="form-check-label">Injury to Child</label><br />

                                                                        <input type="checkbox" id="mechanismInjuryMachinery" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjuryMachinery" className="form-check-label">Machinery Accident</label><br />

                                                                        <input type="checkbox" id="mechanismInjuryRTA" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjuryRTA" className="form-check-label">Road Traffic Accident</label><br />

                                                                        <input type="checkbox" id="mechanismInjurySmoke" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjurySmoke" className="form-check-label">Smoke, Fire, Flames</label><br />

                                                                        <input type="checkbox" id="mechanismInjurySports" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjurySports" className="form-check-label">Sports Injury</label><br />

                                                                        <input type="checkbox" id="mechanismInjuryStabbing" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjuryStabbing" className="form-check-label">Stabbing</label><br />

                                                                        <input type="checkbox" id="mechanismInjuryStumble" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjuryStumble" className="form-check-label">Stumble / Trip</label><br />

                                                                        <input type="checkbox" id="mechanismInjuryWater" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjuryWater" className="form-check-label">Water Transport Acc</label><br />

                                                                        <input type="checkbox" id="mechanismInjuryOther" name="mechanismOfInjury" className="form-check-input" />
                                                                        <label htmlFor="mechanismInjuryOther" className="form-check-label">Other</label><br />

                                                                        <input
                                                                            id='mechanismInjuryOtherInput'
                                                                            type="text"
                                                                            className="form-control"
                                                                            style={{ marginLeft: '-10px' }}
                                                                        />
                                                                    </div>

                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="medicalBackPain">Medical:</label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="medicalBackPain" name="medical" className="form-check-input" />
                                                                        <label htmlFor="medicalBackPain" className="form-check-label">Back Pain</label><br />

                                                                        <input type="checkbox" id="medicalDiabetes" name="medical" className="form-check-input" />
                                                                        <label htmlFor="medicalDiabetes" className="form-check-label">Diabetes Mellitus Pain</label><br />

                                                                        <input type="checkbox" id="medicalFever" name="medical" className="form-check-input" />
                                                                        <label htmlFor="medicalFever" className="form-check-label">Fever</label><br />

                                                                        <input type="checkbox" id="medicalHeadache" name="medical" className="form-check-input" />
                                                                        <label htmlFor="medicalHeadache" className="form-check-label">Headache</label><br />

                                                                        <input type="checkbox" id="medicalHypothermia" name="medical" className="form-check-input" />
                                                                        <label htmlFor="medicalHypothermia" className="form-check-label">Hypothermia</label><br />

                                                                        <input type="checkbox" id="medicalOther" name="medical" className="form-check-input" />
                                                                        <label htmlFor="medicalOther" className="form-check-label">Other Medical</label><br />

                                                                        <input
                                                                            id='medicalOtherInput'
                                                                            type="text"
                                                                            className="form-control"
                                                                            style={{ marginLeft: '-10px' }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="respiratoryAsthma">Respiratory:</label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="respiratoryAsthma" name="respiratory" className="form-check-input" />
                                                                        <label htmlFor="respiratoryAsthma" className="form-check-label">Asthma</label><br />

                                                                        <input type="checkbox" id="respiratoryCOPD" name="respiratory" className="form-check-input" />
                                                                        <label htmlFor="respiratoryCOPD" className="form-check-label">COPD</label><br />

                                                                        <input type="checkbox" id="respiratoryFBAO" name="respiratory" className="form-check-input" />
                                                                        <label htmlFor="respiratoryFBAO" className="form-check-label">FBAO</label><br />

                                                                        <input type="checkbox" id="respiratoryArrest" name="respiratory" className="form-check-input" />
                                                                        <label htmlFor="respiratoryArrest" className="form-check-label">Respiratory Arrest</label><br />

                                                                        <input type="checkbox" id="respiratorySmoke" name="respiratory" className="form-check-input" />
                                                                        <label htmlFor="respiratorySmoke" className="form-check-label">Smoke Inhalation</label><br />

                                                                        <input type="checkbox" id="respiratoryOther" name="respiratory" className="form-check-input" />
                                                                        <label htmlFor="respiratoryOther" className="form-check-label">Other Respiratory</label><br />

                                                                        <input
                                                                            id='respiratoryOtherInput'
                                                                            type="text"
                                                                            className="form-control"
                                                                            style={{ marginLeft: '-10px' }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="generalAbdominalPain">General:</label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="generalAbdominalPain" name="general" className="form-check-input" />
                                                                        <label htmlFor="generalAbdominalPain" className="form-check-label">Abdominal Pain</label><br />

                                                                        <input type="checkbox" id="generalAllergicReaction" name="general" className="form-check-input" />
                                                                        <label htmlFor="generalAllergicReaction" className="form-check-label">Allergic Reaction</label><br />

                                                                        <input type="checkbox" id="generalBehavioralDisorder" name="general" className="form-check-input" />
                                                                        <label htmlFor="generalBehavioralDisorder" className="form-check-label">Behavioral Disorder</label><br />

                                                                        <input type="checkbox" id="generalIllnessUnknown" name="general" className="form-check-input" />
                                                                        <label htmlFor="generalIllnessUnknown" className="form-check-label">Illness Unknown</label><br />

                                                                        <input type="checkbox" id="generalNausea" name="general" className="form-check-input" />
                                                                        <label htmlFor="generalNausea" className="form-check-label">Nausea / Vomiting</label><br />

                                                                        <input type="checkbox" id="generalPoisoning" name="general" className="form-check-input" />
                                                                        <label htmlFor="generalPoisoning" className="form-check-label">Poisining</label><br />

                                                                        <input type="checkbox" id="generalSyncope" name="general" className="form-check-input" />
                                                                        <label htmlFor="generalSyncope" className="form-check-label">Syncope / Collapse</label><br />

                                                                        <input type="checkbox" id="generalOther" name="general" className="form-check-input" />
                                                                        <label htmlFor="generalOther" className="form-check-label">Other General</label><br />

                                                                        <input
                                                                            id='generalOtherInput'
                                                                            type="text"
                                                                            className="form-control"
                                                                            style={{ marginLeft: '-10px' }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="circumstancesAccident">Circumstances: <span className='required-form'>*</span></label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="circumstancesAccident" name="circumstances" className="form-check-input" />
                                                                        <label htmlFor="circumstancesAccident" className="form-check-label">Accident</label><br />

                                                                        <input type="checkbox" id="circumstancesEvent" name="circumstances" className="form-check-input" />
                                                                        <label htmlFor="circumstancesEvent" className="form-check-label">Event of Undetermined Intent</label><br />

                                                                        <input type="checkbox" id="circumstancesSelfHarm" name="circumstances" className="form-check-input" />
                                                                        <label htmlFor="circumstancesSelfHarm" className="form-check-label">Intentional Self Harm</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="clinicalLifeThreatening">Clinical Status: <span className='required-form'>*</span></label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="clinicalLifeThreatening" name="clinicalStatus" className="form-check-input" />
                                                                        <label htmlFor="clinicalLifeThreatening" className="form-check-label">Life Threatening</label><br />

                                                                        <input type="checkbox" id="clinicalSerious" name="clinicalStatus" className="form-check-input" />
                                                                        <label htmlFor="clinicalSerious" className="form-check-label">Serious Not Life Threat</label><br />

                                                                        <input type="checkbox" id="clinicalNonSerious" name="clinicalStatus" className="form-check-input" />
                                                                        <label htmlFor="clinicalNonSerious" className="form-check-label">Non Serious/Non Life Threat</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: patientCareReportStatus === "Glasgow Coma Scale (GCS)" ? "block" : "none" }}>
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="motorNone">Motor:</label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="motorNone" name="motor" className="form-check-input" />
                                                                        <label htmlFor="motorNone" className="form-check-label">1. NONE</label><br />

                                                                        <input type="checkbox" id="motorExtension" name="motor" className="form-check-input" />
                                                                        <label htmlFor="motorExtension" className="form-check-label">2. EXTENSION</label><br />

                                                                        <input type="checkbox" id="motorFlexion" name="motor" className="form-check-input" />
                                                                        <label htmlFor="motorFlexion" className="form-check-label">3. FLEXION</label><br />

                                                                        <input type="checkbox" id="motorWithdraw" name="motor" className="form-check-input" />
                                                                        <label htmlFor="motorWithdraw" className="form-check-label">4. WITHDRAW</label><br />

                                                                        <input type="checkbox" id="motorLocalize" name="motor" className="form-check-input" />
                                                                        <label htmlFor="motorLocalize" className="form-check-label">5. LOCALIZE</label><br />

                                                                        <input type="checkbox" id="motorObey" name="motor" className="form-check-input" />
                                                                        <label htmlFor="motorObey" className="form-check-label">6. OBEY</label><br />
                                                                    </div>
                                                                </div>


                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="verbalNone">Verbal:</label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="verbalNone" name="verbal" className="form-check-input" />
                                                                        <label htmlFor="verbalNone" className="form-check-label">1. NONE</label><br />

                                                                        <input type="checkbox" id="verbalIncomprehensible" name="verbal" className="form-check-input" />
                                                                        <label htmlFor="verbalIncomprehensible" className="form-check-label">2. INCOMPREHENSIBLE</label><br />

                                                                        <input type="checkbox" id="verbalInappropriate" name="verbal" className="form-check-input" />
                                                                        <label htmlFor="verbalInappropriate" className="form-check-label">3. INAPPROPRIATE</label><br />

                                                                        <input type="checkbox" id="verbalConfused" name="verbal" className="form-check-input" />
                                                                        <label htmlFor="verbalConfused" className="form-check-label">4. CONFUSED</label><br />

                                                                        <input type="checkbox" id="verbalOriented" name="verbal" className="form-check-input" />
                                                                        <label htmlFor="verbalOriented" className="form-check-label">5. ORIENTED</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="eyeNone">Eye Opening:</label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="eyeNone" name="eye" className="form-check-input" />
                                                                        <label htmlFor="eyeNone" className="form-check-label">1. NONE</label><br />

                                                                        <input type="checkbox" id="eyeToPain" name="eye" className="form-check-input" />
                                                                        <label htmlFor="eyeToPain" className="form-check-label">2. TO PAIN</label><br />

                                                                        <input type="checkbox" id="eyeToVoice" name="eye" className="form-check-input" />
                                                                        <label htmlFor="eyeToVoice" className="form-check-label">3. TO VOICE</label><br />

                                                                        <input type="checkbox" id="eyeSpontaneous" name="eye" className="form-check-input" />
                                                                        <label htmlFor="eyeSpontaneous" className="form-check-label">4. SPONTANEOUS</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="gcsTotal">GCS Total:</label>
                                                                    <input
                                                                        type="number"
                                                                        className="form-control"
                                                                        id="gcsTotal"
                                                                        name="gcsTotal"
                                                                    />
                                                                </div>

                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: patientCareReportStatus === "Basic Life Support (BLS)" ? "block" : "none" }}>
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="pulsePositive">Pulse:</label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="pulsePositive" name="pulse" className="form-check-input" />
                                                                        <label htmlFor="pulsePositive" className="form-check-label">Positive</label><br />

                                                                        <input type="checkbox" id="pulseRapid" name="pulse" className="form-check-input" />
                                                                        <label htmlFor="pulseRapid" className="form-check-label">Rapid</label><br />

                                                                        <input type="checkbox" id="pulseSlow" name="pulse" className="form-check-input" />
                                                                        <label htmlFor="pulseSlow" className="form-check-label">Slow</label><br />

                                                                        <input type="checkbox" id="pulseNegative" name="pulse" className="form-check-input" />
                                                                        <label htmlFor="pulseNegative" className="form-check-label">Negative</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="airwayClear">Airway:</label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="airwayClear" name="airway" className="form-check-input" />
                                                                        <label htmlFor="airwayClear" className="form-check-label">Clear</label><br />

                                                                        <input type="checkbox" id="airwayPartial" name="airway" className="form-check-input" />
                                                                        <label htmlFor="airwayPartial" className="form-check-label">Partially Obstructed</label><br />

                                                                        <input type="checkbox" id="airwayObstructed" name="airway" className="form-check-input" />
                                                                        <label htmlFor="airwayObstructed" className="form-check-label">Obstructed</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="breathingNormal">Breathing:</label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="breathingNormal" name="breathing" className="form-check-input" />
                                                                        <label htmlFor="breathingNormal" className="form-check-label">Normal</label><br />

                                                                        <input type="checkbox" id="breathingRapid" name="breathing" className="form-check-input" />
                                                                        <label htmlFor="breathingRapid" className="form-check-label">Rapid</label><br />

                                                                        <input type="checkbox" id="breathingSlow" name="breathing" className="form-check-input" />
                                                                        <label htmlFor="breathingSlow" className="form-check-label">Slow</label><br />

                                                                        <input type="checkbox" id="breathingShallow" name="breathing" className="form-check-input" />
                                                                        <label htmlFor="breathingShallow" className="form-check-label">Shallow</label><br />

                                                                        <input type="checkbox" id="breathingHyperventilate" name="breathing" className="form-check-input" />
                                                                        <label htmlFor="breathingHyperventilate" className="form-check-label">Hyperventilate</label><br />

                                                                        <input type="checkbox" id="breathingNone" name="breathing" className="form-check-input" />
                                                                        <label htmlFor="breathingNone" className="form-check-label">None</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="gagReflexPresent">GAG Reflex:</label>

                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="gagReflexPresent" name="gagReflex" className="form-check-input" />
                                                                        <label htmlFor="gagReflexPresent" className="form-check-label">Present</label><br />

                                                                        <input type="checkbox" id="gagReflexAbsent" name="gagReflex" className="form-check-input" />
                                                                        <label htmlFor="gagReflexAbsent" className="form-check-label">Absent</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>
                                                            </div>
                                                        </div>



                                                        <div style={{ display: patientCareReportStatus === "Complaint Details" ? "block" : "none" }}>
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="chiefComplaintInput">Chief Complaint:</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="chiefComplaintInput"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="historyInput">History:</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="historyInput"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="signsSymptomsInput">Signs & Symptoms:</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="signsSymptomsInput"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="allergiesInput">Allergies:</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="allergiesInput"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="medicationsInput">Medications:</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="medicationsInput"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="pastMedicalHistoryInput">Past Medical History:</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="pastMedicalHistoryInput"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="lastMealIntakeInput">Last Meal Intake:</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="lastMealIntakeInput"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="timeInput">Time:</label>
                                                                    <input
                                                                        type="time"
                                                                        className="form-control"
                                                                        id="timeInput"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="eventPriorInput">Event Prior to Incident:</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="eventPriorInput"
                                                                    />
                                                                </div>

                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>
                                                            </div>
                                                        </div>


                                                        <div style={{ display: patientCareReportStatus === "Level of Conciousness" ? "block" : "none" }}>
                                                            <div className="row">
                                                                <div className="col-md-12">
                                                                    <div className="table-responsive">
                                                                        <table className="table table-bordered table-responsive">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th scope="col" className='text-center'></th>
                                                                                    <th scope="col" colSpan="5" className='text-center'>Vital Signs <span className='required-form'>*</span></th>  {/* Merging 5 columns under "Vital Signs" */}
                                                                                    <th scope="col" className='text-center'></th>
                                                                                </tr>
                                                                                <tr className='text-center'>
                                                                                    <th scope="col" style={{ width: '14%' }}>Level of Consciousness <span className='required-form'>*</span></th>  {/* BP column */}
                                                                                    <th scope="col" style={{ width: '14%' }}>BP <span className='required-form'>*</span></th>  {/* BP column */}
                                                                                    <th scope="col" style={{ width: '14%' }}>PR <span className='required-form'>*</span></th>  {/* Respiratory Rate column */}
                                                                                    <th scope="col" style={{ width: '14%' }}>RR <span className='required-form'>*</span></th>  {/* Temperature column */}
                                                                                    <th scope="col" style={{ width: '14%' }}>SPO2 <span className='required-form'>*</span></th>  {/* Oxygen Saturation column */}
                                                                                    <th scope="col" style={{ width: '14%' }}>TEMP <span className='required-form'>*</span></th>  {/* Empty cell for the last column */}
                                                                                    <th scope="col" style={{ width: '14%' }}>Time </th>  {/* BP column */}
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <th scope="row" >
                                                                                        <div className="form-check form-check-inline">
                                                                                            <input type="checkbox" id="row1LOCA" name="row1LOCA" className="form-check-input" />
                                                                                            <label htmlFor="row1LOCA" className="form-check-label">A</label>
                                                                                        </div>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <input type="checkbox" id="row1LOCV" name="row1LOCV" className="form-check-input" />
                                                                                            <label htmlFor="row1LOCV" className="form-check-label">V</label>
                                                                                        </div>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <input type="checkbox" id="row1LOCP" name="row1LOCP" className="form-check-input" />
                                                                                            <label htmlFor="row1LOCP" className="form-check-label">P</label>
                                                                                        </div>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <input type="checkbox" id="row1LOCU" name="row1LOCU" className="form-check-input" />
                                                                                            <label htmlFor="row1LOCU" className="form-check-label">U</label>
                                                                                        </div>
                                                                                    </th>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row1BP' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row1PR' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row1RR' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row1SPO2' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row1TEMP' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row1Time' />
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>

                                                                                <tr>
                                                                                    <th scope="row" >
                                                                                        <div className="form-check form-check-inline">
                                                                                            <input type="checkbox" id="row2LOCA" name="row2LOCA" className="form-check-input" />
                                                                                            <label htmlFor="row2LOCA" className="form-check-label">A</label>
                                                                                        </div>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <input type="checkbox" id="row2LOCV" name="row2LOCV" className="form-check-input" />
                                                                                            <label htmlFor="row2LOCV" className="form-check-label">V</label>
                                                                                        </div>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <input type="checkbox" id="row2LOCP" name="row2LOCP" className="form-check-input" />
                                                                                            <label htmlFor="row2LOCP" className="form-check-label">P</label>
                                                                                        </div>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <input type="checkbox" id="row2LOCU" name="row2LOCU" className="form-check-input" />
                                                                                            <label htmlFor="row2LOCU" className="form-check-label">U</label>
                                                                                        </div>
                                                                                    </th>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row2BP' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row2PR' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row2RR' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row2SPO2' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row2TEMP' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row2Time' />
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>

                                                                                <tr>
                                                                                    <th scope="row" >
                                                                                        <div className="form-check form-check-inline">
                                                                                            <input type="checkbox" id="row3LOCA" name="row3LOCA" className="form-check-input" />
                                                                                            <label htmlFor="row3LOCA" className="form-check-label">A</label>
                                                                                        </div>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <input type="checkbox" id="row3LOCV" name="row3LOCV" className="form-check-input" />
                                                                                            <label htmlFor="row3LOCV" className="form-check-label">V</label>
                                                                                        </div>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <input type="checkbox" id="row3LOCP" name="row3LOCP" className="form-check-input" />
                                                                                            <label htmlFor="row3LOCP" className="form-check-label">P</label>
                                                                                        </div>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <input type="checkbox" id="row3LOCU" name="row3LOCU" className="form-check-input" />
                                                                                            <label htmlFor="row3LOCU" className="form-check-label">U</label>
                                                                                        </div>
                                                                                    </th>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row3BP' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row3PR' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row3RR' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row3SPO2' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row3TEMP' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row3Time' />
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>

                                                                                <tr>
                                                                                    <th scope="row" >
                                                                                        <div className="form-check form-check-inline">
                                                                                            <input type="checkbox" id="row4LOCA" name="row4LOCA" className="form-check-input" />
                                                                                            <label htmlFor="row4LOCA" className="form-check-label">A</label>
                                                                                        </div>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <input type="checkbox" id="row4LOCV" name="row4LOCV" className="form-check-input" />
                                                                                            <label htmlFor="row4LOCV" className="form-check-label">V</label>
                                                                                        </div>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <input type="checkbox" id="row4LOCP" name="row4LOCP" className="form-check-input" />
                                                                                            <label htmlFor="row4LOCP" className="form-check-label">P</label>
                                                                                        </div>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <input type="checkbox" id="row4LOCU" name="row4LOCU" className="form-check-input" />
                                                                                            <label htmlFor="row4LOCU" className="form-check-label">U</label>
                                                                                        </div>
                                                                                    </th>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row4BP' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row4PR' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row4RR' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row4SPO2' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row4TEMP' />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row4Time' />
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>

                                                                <div className="col-md-12">

                                                                    <div className="table-responsive">
                                                                        <table className="table table-bordered">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th scope="col" className='text-center'>Pupil</th>
                                                                                    <th scope="col" className='text-center'>L</th>
                                                                                    <th scope="col" className='text-center'>R</th>
                                                                                    <th scope="col" className='text-center'>Lungs</th>
                                                                                    <th scope="col" className='text-center'>L</th>
                                                                                    <th scope="col" className='text-center'>R</th>
                                                                                    <th scope="col" colSpan="3" className='text-center'>Limp Mov't</th>
                                                                                    <th scope="col" className='text-center'>02-L/m</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <th scope="row" >
                                                                                        PEARRL
                                                                                    </th>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="Pearrl-L" name="Pearrl-L" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="Pearrl-R" name="Pearrl-R" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        CLEAR
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="Clear-L" name="Clear-L" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="Clear-R" name="Clear-R" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        LIMB
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <label htmlFor="limbYes" className="form-check-label">Yes</label>
                                                                                            <input type="checkbox" id="limbYes" name="limbYes" className="form-check-input" />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <label htmlFor="limbNo" className="form-check-label">No</label>
                                                                                            <input type="checkbox" id="limbNo" name="limbNo" className="form-check-input" />
                                                                                        </div>
                                                                                    </td>

                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row1lm' />
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>

                                                                                <tr>
                                                                                    <th scope="row" >
                                                                                        PINPOINT
                                                                                    </th>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="Pinpoint-L" name="Pinpoint-L" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="Pinpoint-R" name="Pinpoint-R" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        ABSENT
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="AbsentL" name="AbsentL" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="AbsentR" name="AbsentR" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        ARMS
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <label htmlFor="armsYes" className="form-check-label">Yes</label>
                                                                                            <input type="checkbox" id="armsYes" name="armsYes" className="form-check-input" />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <label htmlFor="armsNo" className="form-check-label">No</label>
                                                                                            <input type="checkbox" id="armsNo" name="armsNo" className="form-check-input" />
                                                                                        </div>
                                                                                    </td>

                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row2LM' />
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>

                                                                                <tr>
                                                                                    <th scope="row" >
                                                                                        D.LATED
                                                                                    </th>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="dLatedL" name="dLatedL" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="dLatedR" name="dLatedR" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        DECREASE
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="decreaseL" name="decreaseL" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="decreaseR" name="decreaseR" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        ARMS
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <label htmlFor="armsYes" className="form-check-label">Yes</label>
                                                                                            <input type="checkbox" id="arms2Yes" name="arms2Yes" className="form-check-input" />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <label htmlFor="armsNo" className="form-check-label">No</label>
                                                                                            <input type="checkbox" id="arms2No" name="arms2No" className="form-check-input" />
                                                                                        </div>
                                                                                    </td>

                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row3LM' />
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>

                                                                                <tr>
                                                                                    <th scope="row" >
                                                                                        SLUGGISH
                                                                                    </th>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="sluggishL" name="sluggishL" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="sluggishR" name="sluggishR" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        CRACKLES
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="cracklesL" name="cracklesL" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="cracklesR" name="cracklesR" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        LEGS
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <label htmlFor="legs1Yes" className="form-check-label">Yes</label>
                                                                                            <input type="checkbox" id="legs1Yes" name="legs1Yes" className="form-check-input" />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <label htmlFor="legs1No" className="form-check-label">No</label>
                                                                                            <input type="checkbox" id="legs1No" name="legs1No" className="form-check-input" />
                                                                                        </div>
                                                                                    </td>

                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row4LM' />
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>

                                                                                <tr>
                                                                                    <th scope="row" >
                                                                                        FIXED
                                                                                    </th>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="fixedL" name="fixedL" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="fixedR" name="fixedR" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        RONCHI
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="ronchiL" name="ronchiL" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="ronchiR" name="ronchiR" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        LEGS
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <label htmlFor="legs2Yes" className="form-check-label">Yes</label>
                                                                                            <input type="checkbox" id="legs2Yes" name="legs2Yes" className="form-check-input" />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <label htmlFor="legs1No" className="form-check-label">No</label>
                                                                                            <input type="checkbox" id="legs2No" name="legs2No" className="form-check-input" />
                                                                                        </div>
                                                                                    </td>

                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row5LM' />
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>

                                                                                <tr>
                                                                                    <th scope="row" >
                                                                                        CATARACT
                                                                                    </th>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="cataractL" name="cataractL" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="cataractR" name="cataractR" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        WHEEZE
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="wheezeL" name="wheezeL" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline ">
                                                                                            <input type="checkbox" id="wheezeR" name="wheezeR" className="form-check-input " />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        LEGS
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <label htmlFor="legs2Yes" className="form-check-label">Yes</label>
                                                                                            <input type="checkbox" id="legs3Yes" name="legs3Yes" className="form-check-input" />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check form-check-inline">
                                                                                            <label htmlFor="legs1No" className="form-check-label">No</label>
                                                                                            <input type="checkbox" id="legs3No" name="legs3No" className="form-check-input" />
                                                                                        </div>
                                                                                    </td>

                                                                                    <td>
                                                                                        <div className="col-md-12">
                                                                                            <input type="text" className="form-control" id='row6LM' />
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>

                                                                                <tr>
                                                                                    <td colSpan="12" className="text-start">

                                                                                        <div className="row">
                                                                                            <div className="col-md-6">
                                                                                                <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2"><b>Wound:</b></label>

                                                                                                <br /> <hr />
                                                                                                <div className="form-check">
                                                                                                    <input type="checkbox" id="bleedingControl" name="bleedingControl" className="form-check-input" />
                                                                                                    <label htmlFor="bleedingControl" className="form-check-label">Bleeding Control</label><br />

                                                                                                    <input type="checkbox" id="appliedAntiseptic" name="appliedAntiseptic" className="form-check-input" />
                                                                                                    <label htmlFor="appliedAntiseptic" className="form-check-label">Applied Antiseptic</label><br />
                                                                                                </div>
                                                                                            </div>

                                                                                            <div className="col-md-6">
                                                                                                <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2"><b>Care:</b></label>

                                                                                                <br /> <hr />
                                                                                                <div className="form-check">
                                                                                                    <input type="checkbox" id="cleaning" name="cleaning" className="form-check-input" />
                                                                                                    <label htmlFor="cardiac" className="form-check-label">Cleaning</label><br />

                                                                                                    <input type="checkbox" id="dressingBandaging" name="dressingBandaging" className="form-check-input" />
                                                                                                    <label htmlFor="cardiac" className="form-check-label">Dressing & Bandaging</label><br />
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>

                                                                                <tr>
                                                                                    <td colSpan="12" className="text-start">

                                                                                        <div className="row">
                                                                                            <div className="col-md-12">
                                                                                                <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2"><b>Immobilisation:</b></label>

                                                                                                <br /> <hr />
                                                                                                <div className="form-check">
                                                                                                    <input type="checkbox" id="c-collar" name="c-collar" className="form-check-input" />
                                                                                                    <label htmlFor="c-collar" className="form-check-label">C-Collar</label><br />

                                                                                                    <input type="checkbox" id="spineboard" name="spineboard" className="form-check-input" />
                                                                                                    <label htmlFor="spineboard" className="form-check-label">Spineboard</label><br />

                                                                                                    <input type="checkbox" id="KED" name="KED" className="form-check-input" />
                                                                                                    <label htmlFor="KED" className="form-check-label">KED</label><br />

                                                                                                    <input type="checkbox" id="splints" name="splints" className="form-check-input" />
                                                                                                    <label htmlFor="splints" className="form-check-label">Splints</label><br />

                                                                                                    <input type="checkbox" id="scoopStretcher" name="scoopStretcher" className="form-check-input" />
                                                                                                    <label htmlFor="scoopStretcher" className="form-check-label">Scoop Stretcher</label><br />


                                                                                                </div>
                                                                                            </div>

                                                                                        </div>
                                                                                    </td>
                                                                                </tr>

                                                                                <tr>
                                                                                    <td colSpan="12" className="text-start">

                                                                                        <div className="row">
                                                                                            <div className="col-md-12">
                                                                                                <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2"><b>Immobilisation:</b></label>

                                                                                                <br /> <hr />
                                                                                                <div className="form-check">

                                                                                                    <div className="d-flex align-items-center">
                                                                                                        <label style={{ color: 'black', marginRight: '10px', }} htmlFor="ambulanceInput2">Others:</label>
                                                                                                        <input
                                                                                                            id='immobilisationOthers'
                                                                                                            type="text"
                                                                                                            className="form-control"
                                                                                                        />
                                                                                                    </div>

                                                                                                </div>
                                                                                            </div>

                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: patientCareReportStatus === "Character Model" ? "block" : "none" }}>
                                                            <div className="row">
                                                                {/* <div className="col-md-6 position-relative d-flex justify-content-center align-items-center">
                                                                    <div style={{ position: "relative", maxWidth: "100%", height: "auto" }}>
                                                                        <img
                                                                            src="/assets/img/character_model.png"
                                                                            alt="Character Model"
                                                                            className="img-fluid"
                                                                            style={{ width: "100%", height: "auto" }}
                                                                        />

                                                                        {characterModelData.rightHead && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/RightHead.png"
                                                                                alt="Right Head"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "2%",
                                                                                    left: "21%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "4.5%",
                                                                                    height: "13%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightNeck && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/RightNeck.png"
                                                                                alt="Right Head"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "12%",
                                                                                    left: "21.7%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "3.4%",
                                                                                    height: "5%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightShoulder && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/RightShoulder.png"
                                                                                alt="Right Head"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "17.7%",
                                                                                    left: "12.9%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "3.8%",
                                                                                    height: "5%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightChest && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/RightChest.png"
                                                                                alt="Left Chest"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "15.6%",
                                                                                    left: "19%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "8.7%",
                                                                                    height: "14.5%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightArm && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/RightArm.png"
                                                                                alt="Right Arm"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "22.4%",
                                                                                    left: "10.5%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "9.3%",
                                                                                    height: "29%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightHand && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/RightHand.png"
                                                                                alt="Right Arm"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "50.5%",
                                                                                    left: "5.5%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "8%",
                                                                                    height: "10.5%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightAbdomen && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/RightAbdomen.png"
                                                                                alt="Right Abdomen"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "30%",
                                                                                    left: "19.2%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "8.5%",
                                                                                    height: "14%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightHip && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/RightHips.png"
                                                                                alt="Right Hip"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "44%",
                                                                                    left: "19.2%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "8.5%",
                                                                                    height: "5%"
                                                                                }}
                                                                            />
                                                                        )}


                                                                        {characterModelData.rightThigh && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/RightThigh.png"
                                                                                alt="Left Hip"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "49%",
                                                                                    left: "19.3%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "8.7%",
                                                                                    height: "21%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightKnee && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/RightKnee.png"
                                                                                alt="Right Knee"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "70%",
                                                                                    left: "20.4%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "6%",
                                                                                    height: "7%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightShin && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/RightShin.png"
                                                                                alt="Right Shin"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "77%",
                                                                                    left: "20.5%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "6.1%",
                                                                                    height: "17%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightFoot && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/RightFoot.png"
                                                                                alt="Right Foot"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "94%",
                                                                                    left: "21.1%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "6.1%",
                                                                                    height: "4%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftHead && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/LeftHead.png"
                                                                                alt="Right Head"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "2%",
                                                                                    left: "25.44%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "4.5%",
                                                                                    height: "13%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftNeck && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/LeftNeck.png"
                                                                                alt="Right Head"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "12%",
                                                                                    left: "24.8%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "3%",
                                                                                    height: "5%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftShoulder && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/LeftShoulder.png"
                                                                                alt="Left Shoulder"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "17.7%",
                                                                                    left: "33.5%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "3.8%",
                                                                                    height: "5%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftChest && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/LeftChest.png"
                                                                                alt="Left Chest"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "15.6%",
                                                                                    left: "27.4%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "8.7%",
                                                                                    height: "14.5%"
                                                                                }}
                                                                            />
                                                                        )}


                                                                        {characterModelData.leftArm && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/LeftArm.png"
                                                                                alt="Left Arm"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "22.4%",
                                                                                    left: "36.3%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "9.6%",
                                                                                    height: "29%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftHand && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/LeftHand.png"
                                                                                alt="Right Arm"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "50.5%",
                                                                                    left: "41.5%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "7.5%",
                                                                                    height: "10.5%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftAbdomen && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/LeftAbdomen.png"
                                                                                alt="Left Abdomen"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "30%",
                                                                                    left: "27.4%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "8.5%",
                                                                                    height: "14%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftHip && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/LeftHips.png"
                                                                                alt="Left Hip"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "44%",
                                                                                    left: "27.5%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "8.9%",
                                                                                    height: "5%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftThigh && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/LeftThigh.png"
                                                                                alt="Left Hip"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "49%",
                                                                                    left: "27.8%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "8.7%",
                                                                                    height: "21%"
                                                                                }}
                                                                            />
                                                                        )}


                                                                        {characterModelData.leftKnee && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/LeftKnee.png"
                                                                                alt="Left Knee"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "70%",
                                                                                    left: "26.7%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "6%",
                                                                                    height: "7%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftShin && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/LeftShin.png"
                                                                                alt="Left Shin"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "77%",
                                                                                    left: "27.2%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "6.1%",
                                                                                    height: "17%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftFoot && (
                                                                            <img
                                                                                src="/assets/img/FrontModel/LeftFoot.png"
                                                                                alt="Left Foot"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "94%",
                                                                                    left: "27.1%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "6.1%",
                                                                                    height: "4%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightBackHead && (
                                                                            <img
                                                                                src="/assets/img/BackModel/RightBackHead.png"
                                                                                alt="Right Back Head Foot"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "2%",
                                                                                    left: "76.5%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "5%",
                                                                                    height: "11%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightBackNeck && (
                                                                            <img
                                                                                src="/assets/img/BackModel/RightBackNeck.png"
                                                                                alt="Right Back Neck"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "13%",
                                                                                    left: "75.7%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "3.5%",
                                                                                    height: "3.5%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightBackShoulder && (
                                                                            <img
                                                                                src="/assets/img/BackModel/RightBackShoulder.png"
                                                                                alt="Right Back Neck"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "17.5%",
                                                                                    left: "84.2%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "5%",
                                                                                    height: "5%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightBackArm && (
                                                                            <img
                                                                                src="/assets/img/BackModel/RightBackArm.png"
                                                                                alt="Right Back Neck"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "22.5%",
                                                                                    left: "87.2%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "11%",
                                                                                    height: "28%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightBackHand && (
                                                                            <img
                                                                                src="/assets/img/BackModel/RightBackHand.png"
                                                                                alt="Right Back Neck"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "49.5%",
                                                                                    left: "92.2%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "7%",
                                                                                    height: "11%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightBackUpperBack && (
                                                                            <img
                                                                                src="/assets/img/BackModel/RightUpperBack.png"
                                                                                alt="Right Back Upper Back"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "15%",
                                                                                    left: "78.1%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "8%",
                                                                                    height: "15%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightBackLowerBack && (
                                                                            <img
                                                                                src="/assets/img/BackModel/RightLowerBack.png"
                                                                                alt="Right Back Neck"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "30%",
                                                                                    left: "78.3%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "8.5%",
                                                                                    height: "17%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightBackHip && (
                                                                            <img
                                                                                src="/assets/img/BackModel/RightBackHip.png"
                                                                                alt="Right Back Hip"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "47%",
                                                                                    left: "78.5%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "9.2%",
                                                                                    height: "8%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightBackThigh && (
                                                                            <img
                                                                                src="/assets/img/BackModel/RightBackThigh.png"
                                                                                alt="Right Back Thigh"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "55%",
                                                                                    left: "78.5%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "8%",
                                                                                    height: "17%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightCalf && (
                                                                            <img
                                                                                src="/assets/img/BackModel/RightBackCalf.png"
                                                                                alt="Right Back Thigh"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "71.8%",
                                                                                    left: "78%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "6%",
                                                                                    height: "23%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.rightBackFoot && (
                                                                            <img
                                                                                src="/assets/img/BackModel/RightBackFoot.png"
                                                                                alt="Right Back Thigh"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "95%",
                                                                                    left: "78%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "6%",
                                                                                    height: "3%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftBackHead && (
                                                                            <img
                                                                                src="/assets/img/BackModel/LeftBackHead.png"
                                                                                alt="Left Back Head"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "2%",
                                                                                    left: "71.5%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "5%",
                                                                                    height: "11%"
                                                                                }}
                                                                            />
                                                                        )}


                                                                        {characterModelData.leftBackNeck && (
                                                                            <img
                                                                                src="/assets/img/BackModel/LeftBackNeck.png"
                                                                                alt="Left Back Neck"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "13%",
                                                                                    left: "72.3%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "3.5%",
                                                                                    height: "3.5%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftBackUpperBack && (
                                                                            <img
                                                                                src="/assets/img/BackModel/LeftUpperBack.png"
                                                                                alt="Left Upper Back"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "15%",
                                                                                    left: "70.3%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "8%",
                                                                                    height: "15%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftBackShoulder && (
                                                                            <img
                                                                                src="/assets/img/BackModel/LeftBackShoulder.png"
                                                                                alt="Left Back Neck"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "17.5%",
                                                                                    left: "64%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "5%",
                                                                                    height: "5%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftBackArm && (
                                                                            <img
                                                                                src="/assets/img/BackModel/LeftBackArm.png"
                                                                                alt="Right Back Neck"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "22.5%",
                                                                                    left: "61.5%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "11%",
                                                                                    height: "28%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftBackHand && (
                                                                            <img
                                                                                src="/assets/img/BackModel/LeftBackHand.png"
                                                                                alt="Right Back Neck"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "49.4%",
                                                                                    left: "56.5%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "7%",
                                                                                    height: "12%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftBackLowerBack && (
                                                                            <img
                                                                                src="/assets/img/BackModel/LeftLowerBack.png"
                                                                                alt="Right Back Neck"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "30%",
                                                                                    left: "69.9%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "8%",
                                                                                    height: "17%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftBackHip && (
                                                                            <img
                                                                                src="/assets/img/BackModel/LeftBackHip.png"
                                                                                alt="Left Back Hip"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "47%",
                                                                                    left: "70%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "9.2%",
                                                                                    height: "8%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftBackThigh && (
                                                                            <img
                                                                                src="/assets/img/BackModel/LeftBackThigh.png"
                                                                                alt="Left Back Thigh"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "55%",
                                                                                    left: "70%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "8%",
                                                                                    height: "17%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftCalf && (
                                                                            <img
                                                                                src="/assets/img/BackModel/LeftBackCalf.png"
                                                                                alt="Left Back Thigh"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "71.8%",
                                                                                    left: "71%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "6%",
                                                                                    height: "23%"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {characterModelData.leftBackFoot && (
                                                                            <img
                                                                                src="/assets/img/BackModel/LeftBackFoot.png"
                                                                                alt="Left Back Foot"
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "95%",
                                                                                    left: "71%",
                                                                                    transform: "translateX(-50%)",
                                                                                    width: "6%",
                                                                                    height: "3%"
                                                                                }}
                                                                            />
                                                                        )}


                                                                    </div>
                                                                </div>



                                                                <div class="col-md-2">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2"><b>Front Model</b></label>
                                                                    <hr />

                                                                    <div class="form-check">
                                                                        <div class="form-check">
                                                                            <input type="checkbox" id="rightHead" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.rightHead}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        rightHead: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="rightHead" class="form-check-label">Right Head</label><br />

                                                                            <input type="checkbox" id="rightNeck" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.rightNeck}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        rightNeck: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="rightNeck" class="form-check-label">Right Neck</label><br />

                                                                            <input type="checkbox" id="rightShoulder" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.rightShoulder}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        rightShoulder: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="rightShoulder" class="form-check-label">Right Shoulder</label><br />

                                                                            <input type="checkbox" id="rightArm" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.rightArm}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        rightArm: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="rightArm" class="form-check-label">Right Arm</label><br />

                                                                            <input type="checkbox" id="rightHand" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.rightHand}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        rightHand: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="rightHand" class="form-check-label">Right Hand</label><br />

                                                                            <input type="checkbox" id="rightChest" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.rightChest}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        rightChest: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="rightChest" class="form-check-label">Right Chest</label><br />

                                                                            <input type="checkbox" id="rightAbdomen" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.rightAbdomen}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        rightAbdomen: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="rightAbdomen" class="form-check-label">Right Abdomen</label><br />

                                                                            <input type="checkbox" id="rightHip" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.rightHip}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        rightHip: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="rightHip" class="form-check-label">Right Hip</label><br />

                                                                            <input type="checkbox" id="rightThigh" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.rightThigh}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        rightThigh: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="rightThigh" class="form-check-label">Right Thigh</label><br />

                                                                            <input type="checkbox" id="rightKnee" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.rightKnee}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        rightKnee: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="rightKnee" class="form-check-label">Right Knee</label><br />

                                                                            <input type="checkbox" id="rightShin" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.rightShin}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        rightShin: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="rightShin" class="form-check-label">Right Shin</label><br />

                                                                            <input type="checkbox" id="rightFoot" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.rightFoot}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        rightFoot: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="rightFoot" class="form-check-label">Right Foot</label><br /><br /><br />

                                                                            <input type="checkbox" id="leftHead" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.leftHead}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        leftHead: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="leftHead" class="form-check-label">Left Head</label><br />

                                                                            <input type="checkbox" id="leftNeck" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.leftNeck}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        leftNeck: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="leftNeck" class="form-check-label">Left Neck</label><br />

                                                                            <input type="checkbox" id="leftShoulder" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.leftShoulder}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        leftShoulder: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="leftShoulder" class="form-check-label">Left Shoulder</label><br />

                                                                            <input type="checkbox" id="leftArm" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.leftArm}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        leftArm: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="leftArm" class="form-check-label">Left Arm</label><br />

                                                                            <input type="checkbox" id="leftHand" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.leftHand}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        leftHand: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="leftHand" class="form-check-label">Left Hand</label><br />

                                                                            <input type="checkbox" id="leftChest" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.leftChest}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        leftChest: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="leftChest" class="form-check-label">Left Chest</label><br />

                                                                            <input type="checkbox" id="leftAbdomen" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.leftAbdomen}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        leftAbdomen: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="leftAbdomen" class="form-check-label">Left Abdomen</label><br />

                                                                            <input type="checkbox" id="leftHip" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.leftHip}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        leftHip: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="leftHip" class="form-check-label">Left Hip</label><br />

                                                                            <input type="checkbox" id="leftThigh" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.leftThigh}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        leftThigh: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="leftThigh" class="form-check-label">Left Thigh</label><br />

                                                                            <input type="checkbox" id="leftKnee" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.leftKnee}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        leftKnee: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="leftKnee" class="form-check-label">Left Knee</label><br />

                                                                            <input type="checkbox" id="leftShin" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.leftShin}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        leftShin: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="leftShin" class="form-check-label">Left Shin</label><br />

                                                                            <input type="checkbox" id="leftFoot" name="charactermodel" class="form-check-input"
                                                                                checked={characterModelData.leftFoot}
                                                                                onChange={(e) =>
                                                                                    setCharacterModelData(prev => ({
                                                                                        ...prev,
                                                                                        leftFoot: e.target.checked
                                                                                    }))
                                                                                } />
                                                                            <label for="leftFoot" class="form-check-label">Left Foot</label><br /><br />
                                                                        </div>

                                                                    </div>
                                                                </div>


                                                                <div class="col-md-2">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2"><b>Back Model</b></label>
                                                                    <hr />

                                                                    <div class="form-check">
                                                                        <input type="checkbox" id="rightBackHead" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.rightBackHead}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    rightBackHead: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="rightBackHead" class="form-check-label">Right Back Head</label><br />

                                                                        <input type="checkbox" id="rightBackNeck" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.rightBackNeck}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    rightBackNeck: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="rightBackNeck" class="form-check-label">Right Back Neck</label><br />

                                                                        <input type="checkbox" id="rightBackShoulder" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.rightBackShoulder}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    rightBackShoulder: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="rightBackShoulder" class="form-check-label">Right Back Shoulder</label><br />

                                                                        <input type="checkbox" id="rightBackArm" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.rightBackArm}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    rightBackArm: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="rightBackArm" class="form-check-label">Right Back Arm</label><br />

                                                                        <input type="checkbox" id="rightBackHand" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.rightBackHand}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    rightBackHand: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="rightBackHand" class="form-check-label">Right Back Hand</label><br />

                                                                        <input type="checkbox" id="rightBackUpperBack" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.rightBackUpperBack}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    rightBackUpperBack: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="rightBackUpperBack" class="form-check-label">Right Upper Back</label><br />

                                                                        <input type="checkbox" id="rightBackLowerBack" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.rightBackLowerBack}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    rightBackLowerBack: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="rightBackLowerBack" class="form-check-label">Right Lower Back</label><br />

                                                                        <input type="checkbox" id="rightBackHip" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.rightBackHip}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    rightBackHip: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="rightBackHip" class="form-check-label">Right Back Hip</label><br />

                                                                        <input type="checkbox" id="rightBackThigh" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.rightBackThigh}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    rightBackThigh: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="rightBackThigh" class="form-check-label">Right Back Thigh</label><br />

                                                                        <input type="checkbox" id="rightCalf" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.rightCalf}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    rightCalf: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="rightCalf" class="form-check-label">Right Calf</label><br />

                                                                        <input type="checkbox" id="rightBackFoot" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.rightBackFoot}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    rightBackFoot: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="rightBackFoot" class="form-check-label">Right Back Foot</label><br /><br />

                                                                        <input type="checkbox" id="leftBackHead" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.leftBackHead}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    leftBackHead: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="leftBackHead" class="form-check-label">Left Back Head</label><br />

                                                                        <input type="checkbox" id="leftBackNeck" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.leftBackNeck}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    leftBackNeck: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="leftBackNeck" class="form-check-label">Left Back Neck</label><br />

                                                                        <input type="checkbox" id="leftBackShoulder" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.leftBackShoulder}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    leftBackShoulder: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="leftBackShoulder" class="form-check-label">Left Back Shoulder</label><br />

                                                                        <input type="checkbox" id="leftBackArm" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.leftBackArm}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    leftBackArm: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="leftBackArm" class="form-check-label">Left Back Arm</label><br />

                                                                        <input type="checkbox" id="leftBackHand" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.leftBackHand}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    leftBackHand: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="leftBackHand" class="form-check-label">Left Back Hand</label><br />

                                                                        <input type="checkbox" id="leftBackUpperBack" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.leftBackUpperBack}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    leftBackUpperBack: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="leftBackUpperBack" class="form-check-label">Left Upper Back</label><br />

                                                                        <input type="checkbox" id="leftBackLowerBack" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.leftBackLowerBack}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    leftBackLowerBack: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="leftBackLowerBack" class="form-check-label">Left Lower Back</label><br />

                                                                        <input type="checkbox" id="leftBackHip" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.leftBackHip}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    leftBackHip: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="leftBackHip" class="form-check-label">Left Back Hip</label><br />

                                                                        <input type="checkbox" id="leftBackThigh" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.leftBackThigh}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    leftBackThigh: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="leftBackThigh" class="form-check-label">Left Back Thigh</label><br />

                                                                        <input type="checkbox" id="leftCalf" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.leftCalf}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    leftCalf: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="leftCalf" class="form-check-label">Left Calf</label><br />

                                                                        <input type="checkbox" id="leftBackFoot" name="charactermodel" class="form-check-input"
                                                                            checked={characterModelData.leftBackFoot}
                                                                            onChange={(e) =>
                                                                                setCharacterModelData(prev => ({
                                                                                    ...prev,
                                                                                    leftBackFoot: e.target.checked
                                                                                }))
                                                                            } />
                                                                        <label for="leftBackFoot" class="form-check-label">Left Back Foot</label><br />

                                                                    </div>

                                                                </div> */}

                                                                <CharacterModel data={patientDetails} />

                                                                <div class="col-md-2">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2"><b>Patient Conditions</b></label>
                                                                    <hr />

                                                                    <div class="form-check">
                                                                        <div class="form-check">
                                                                            <input type="checkbox" id="deformity" name="condition" class="form-check-input" />
                                                                            <label for="deformity" class="form-check-label">D - Deformity</label><br />

                                                                            <input type="checkbox" id="confusion" name="condition" class="form-check-input" />
                                                                            <label for="confusion" class="form-check-label">C - Confusion</label><br />

                                                                            <input type="checkbox" id="abrasion" name="condition" class="form-check-input" />
                                                                            <label for="abrasion" class="form-check-label">A - Abrasion</label><br />

                                                                            <input type="checkbox" id="puncture" name="condition" class="form-check-input" />
                                                                            <label for="puncture" class="form-check-label">P - Puncture</label><br />

                                                                            <input type="checkbox" id="burn" name="condition" class="form-check-input" />
                                                                            <label for="burn" class="form-check-label">B - Burn</label><br />

                                                                            <input type="checkbox" id="tenderness" name="condition" class="form-check-input" />
                                                                            <label for="tenderness" class="form-check-label">T - Tenderness</label><br />

                                                                            <input type="checkbox" id="laceration" name="condition" class="form-check-input" />
                                                                            <label for="laceration" class="form-check-label">L - Laceration</label><br />

                                                                            <input type="checkbox" id="swelling" name="condition" class="form-check-input" />
                                                                            <label for="swelling" class="form-check-label">S - Swelling</label><br /><br />

                                                                            <input type="checkbox" id="fracture" name="condition" class="form-check-input" />
                                                                            <label for="fracture" class="form-check-label">F - Fracture</label><br />

                                                                            <input type="checkbox" id="avulsion" name="condition" class="form-check-input" />
                                                                            <label for="avulsion" class="form-check-label">AV - Avulsion</label><br />

                                                                            <input type="checkbox" id="dislocation" name="condition" class="form-check-input" />
                                                                            <label for="dislocation" class="form-check-label">DISL - Dislocation</label><br />

                                                                            <input type="checkbox" id="pain" name="condition" class="form-check-input" />
                                                                            <label for="pain" class="form-check-label">PN - Pain</label><br />

                                                                            <input type="checkbox" id="rashes" name="condition" class="form-check-input" />
                                                                            <label for="rashes" class="form-check-label">R - Rashes</label><br />

                                                                            <input type="checkbox" id="numbness" name="condition" class="form-check-input" />
                                                                            <label for="numbness" class="form-check-label">N - Numbness</label><br />

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>


                                                        <div style={{ display: patientCareReportStatus === "Endorsed Team" ? "block" : "none" }}>
                                                            <div className="row">
                                                                <div className="col-md-12">
                                                                    <div className="row">
                                                                        <div className="col-md-12">
                                                                            <label
                                                                                style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                                htmlFor="endorsedByTeam"
                                                                            >
                                                                                Endorsed By: Team
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                id="endorsedByTeam"
                                                                                name="endorsedByTeam"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <div className="row">
                                                                        <div className="col-md-12">
                                                                            <label
                                                                                style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                                htmlFor="tlInput"
                                                                            >
                                                                                TL:
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                id="tlInput"
                                                                                name="tlInput"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <div className="row">
                                                                        <div className="col-md-12">
                                                                            <label
                                                                                style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                                htmlFor="r1Input"
                                                                            >
                                                                                R1:
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                id="r1Input"
                                                                                name="r1Input"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <div className="row">
                                                                        <div className="col-md-12">
                                                                            <label
                                                                                style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                                htmlFor="r2Input"
                                                                            >
                                                                                R2:
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                id="r2Input"
                                                                                name="r2Input"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <div className="row">
                                                                        <div className="col-md-12">
                                                                            <label
                                                                                style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                                htmlFor="r3Input"
                                                                            >
                                                                                R3:
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                id="r3Input"
                                                                                name="r3Input"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <div className="row">
                                                                        <div className="col-md-12">
                                                                            <label
                                                                                style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                                htmlFor="r4Input"
                                                                            >
                                                                                R4:
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                id="r4Input"
                                                                                name="r4Input"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <div className="row">
                                                                        <div className="col-md-12">
                                                                            <label
                                                                                style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                                htmlFor="r5Input"
                                                                            >
                                                                                R5:
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                id="r5Input"
                                                                                name="r5Input"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>


                                                        <div style={{ display: patientCareReportStatus === "Incident Information" ? "block" : "none" }}>
                                                            <div className="row">
                                                                <div className="col-md-12">
                                                                    <hr />
                                                                    <h5 className="card-title text-center mb-3" style={{ color: 'black' }}>
                                                                        Incident Information
                                                                    </h5>
                                                                </div>

                                                                <div className="col-md-6">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                        htmlFor="incidentType"
                                                                    >
                                                                        Incident Type:
                                                                    </label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="vehicularAccident" name="incidentType" className="form-check-input" />
                                                                        <label htmlFor="vehicularAccident" className="form-check-label">Vehicular Accident</label><br />

                                                                        <input type="checkbox" id="medicalAttention" name="incidentType" className="form-check-input" />
                                                                        <label htmlFor="medicalAttention" className="form-check-label">Medical Attention</label><br />

                                                                        <input type="checkbox" id="patientTransport" name="incidentType" className="form-check-input" />
                                                                        <label htmlFor="patientTransport" className="form-check-label">Patient Transport</label><br />

                                                                        <input type="checkbox" id="openWaterIncident" name="incidentType" className="form-check-input" />
                                                                        <label htmlFor="openWaterIncident" className="form-check-label">Open Water Incident</label><br />

                                                                        <input type="checkbox" id="drowningIncident" name="incidentType" className="form-check-input" />
                                                                        <label htmlFor="drowningIncident" className="form-check-label">Drowning Incident</label><br />

                                                                        <input type="checkbox" id="maritimeIncident" name="incidentType" className="form-check-input" />
                                                                        <label htmlFor="maritimeIncident" className="form-check-label">Maritime Incident</label><br />

                                                                        <input type="checkbox" id="fireIncident" name="incidentType" className="form-check-input" />
                                                                        <label htmlFor="fireIncident" className="form-check-label">Fire Incident</label><br />

                                                                        <input type="checkbox" id="specialCases" name="incidentType" className="form-check-input" />
                                                                        <label htmlFor="specialCases" className="form-check-label">Special Cases</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-6">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                        htmlFor="incidentSummary"
                                                                    >
                                                                        Incident Summary:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="incidentSummary"
                                                                        name="incidentSummary"
                                                                    />
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="noPatientFound" name="incidentSummaryOptions" className="form-check-input" />
                                                                        <label htmlFor="noPatientFound" className="form-check-label">No Patient Found</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-12">
                                                                    <hr />
                                                                    <h5 className="card-title text-center mb-3" style={{ color: 'black' }}>
                                                                        Incident Location
                                                                    </h5>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                        htmlFor="incident_sameAsResidence"
                                                                    >
                                                                        Incident Location:
                                                                    </label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="incident_sameAsResidence" name="incident_incidentLocationOptions" className="form-check-input" />
                                                                        <label htmlFor="sameAsResidence" className="form-check-label">Same as Residence</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                        htmlFor="incident_landmarkPlace"
                                                                    >
                                                                        Landmark / Place:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="incident_landmarkPlace"
                                                                        name="incident_landmarkPlace"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                        htmlFor="incident_roadStreetName"
                                                                    >
                                                                        Road / Street Name:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="incident_roadStreetName"
                                                                        name="incident_roadStreetName"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                        htmlFor="incident_purok"
                                                                    >
                                                                        Purok:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="incident_purok"
                                                                        name="incident_purok"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                                        htmlFor="incident_barangay"
                                                                    >
                                                                        Barangay:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="incident_barangay"
                                                                        name="incident_barangay"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                                        htmlFor="incident_municipalityCity"
                                                                    >
                                                                        Municipality / City:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="incident_municipalityCity"
                                                                        name="incident_municipalityCity"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                                        htmlFor="incident_province"
                                                                    >
                                                                        Province:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="incident_province"
                                                                        name="incident_province"
                                                                    />
                                                                </div>



                                                                <div className="col-md-12">
                                                                    <hr />
                                                                    <h5 className="card-title text-center mb-3" style={{ color: 'black' }}>
                                                                        Transport Location
                                                                    </h5>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                        htmlFor="transport_incidentLocation"
                                                                    >
                                                                        Incident Location:
                                                                    </label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="transport_sameAsResidence" name="transport_incidentLocationOption" className="form-check-input" />
                                                                        <label htmlFor="sameAsResidence" className="form-check-label">Same as Residence</label><br />

                                                                        <input type="checkbox" id="transport_refusedTransport" name="transport_incidentLocationOption" className="form-check-input" />
                                                                        <label htmlFor="refusedTransport" className="form-check-label">Refused Transport</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                        htmlFor="transport_landmarkPlace"
                                                                    >
                                                                        Landmark / Place:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="transport_landmarkPlace"
                                                                        name="transport_landmarkPlace"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                        htmlFor="roadStreetName"
                                                                    >
                                                                        Road / Street Name:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="transport_roadStreetName"
                                                                        name="transport_roadStreetName"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                        htmlFor="transport_purok"
                                                                    >
                                                                        Purok:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="transport_purok"
                                                                        name="transport_purok"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                                        htmlFor="transport_barangay"
                                                                    >
                                                                        Barangay:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="transport_barangay"
                                                                        name="transport_barangay"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                                        htmlFor="transport_municipalityCity"
                                                                    >
                                                                        Municipality / City:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="transport_municipalityCity"
                                                                        name="transport_municipalityCity"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                                        htmlFor="transport_province"
                                                                    >
                                                                        Province:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="transport_province"
                                                                        name="transport_province"
                                                                    />
                                                                </div>

                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: patientCareReportStatus === "Part 1. Vehicular Accident Incident Details" ? "block" : "none" }}>
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                        htmlFor="vehicularAccidentDetails"
                                                                    >
                                                                        Part 1. Vehicular Accident Incident Details Location
                                                                    </label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input
                                                                            type="checkbox"
                                                                            id="selfAccident"
                                                                            name="vehicularAccidentType"
                                                                            className="form-check-input"
                                                                        />
                                                                        <label htmlFor="selfAccident" className="form-check-label">Self Accident</label><br />

                                                                        <input
                                                                            type="checkbox"
                                                                            id="motorVehicleCollision"
                                                                            name="vehicularAccidentType"
                                                                            className="form-check-input"
                                                                        />
                                                                        <label htmlFor="motorVehicleCollision" className="form-check-label">Motor Vehicle Collision</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-6">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                        htmlFor="incidentSummary123"
                                                                    >
                                                                        V.A Incident Summary: (Indicate if has motor vehicle collision ex. MC VS MC)
                                                                    </label>
                                                                    <br /> <hr />
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="collision_incidentSummary"
                                                                        name="collision_incidentSummary"
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                                        htmlFor="severity"
                                                                    >
                                                                        Severity:
                                                                    </label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input
                                                                            type="checkbox"
                                                                            id="fatal"
                                                                            name="severity"
                                                                            className="form-check-input"
                                                                        />
                                                                        <label htmlFor="fatal" className="form-check-label">Fatal</label><br />

                                                                        <input
                                                                            type="checkbox"
                                                                            id="injury"
                                                                            name="severity"
                                                                            className="form-check-input"
                                                                        />
                                                                        <label htmlFor="injury" className="form-check-label">Injury</label><br />

                                                                        <input
                                                                            type="checkbox"
                                                                            id="propertyDamage"
                                                                            name="severity"
                                                                            className="form-check-input"
                                                                        />
                                                                        <label htmlFor="propertyDamage" className="form-check-label">Property Damage</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                                        htmlFor="incidentMainCause"
                                                                    >
                                                                        Incident Main Cause:
                                                                    </label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input
                                                                            type="checkbox"
                                                                            id="humanError"
                                                                            name="incidentMainCause"
                                                                            className="form-check-input"
                                                                        />
                                                                        <label htmlFor="humanError" className="form-check-label">Human Error</label><br />

                                                                        <input
                                                                            type="checkbox"
                                                                            id="vehicleDefect"
                                                                            name="incidentMainCause"
                                                                            className="form-check-input"
                                                                        />
                                                                        <label htmlFor="vehicleDefect" className="form-check-label">Vehicle Defect</label><br />

                                                                        <input
                                                                            type="checkbox"
                                                                            id="roadDefect"
                                                                            name="incidentMainCause"
                                                                            className="form-check-input"
                                                                        />
                                                                        <label htmlFor="roadDefect" className="form-check-label">Road Defect</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                                        htmlFor="collisionType"
                                                                    >
                                                                        Collision Type:
                                                                    </label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="rearEnd" name="collisionType" className="form-check-input" />
                                                                        <label htmlFor="rearEnd" className="form-check-label">Rear End</label><br />

                                                                        <input type="checkbox" id="sideSwipe" name="collisionType" className="form-check-input" />
                                                                        <label htmlFor="sideSwipe" className="form-check-label">Side Swipe</label><br />

                                                                        <input type="checkbox" id="headOn" name="collisionType" className="form-check-input" />
                                                                        <label htmlFor="headOn" className="form-check-label">Head On</label><br />

                                                                        <input type="checkbox" id="hitObject" name="collisionType" className="form-check-input" />
                                                                        <label htmlFor="hitObject" className="form-check-label">Hit Object in Road</label><br />

                                                                        <input type="checkbox" id="hitPedestrian" name="collisionType" className="form-check-input" />
                                                                        <label htmlFor="hitPedestrian" className="form-check-label">Hit Pedestrian</label><br />

                                                                        <input type="checkbox" id="sideImpact" name="collisionType" className="form-check-input" />
                                                                        <label htmlFor="sideImpact" className="form-check-label">Side Impact</label><br />

                                                                        <input type="checkbox" id="rollover" name="collisionType" className="form-check-input" />
                                                                        <label htmlFor="rollover" className="form-check-label">Rollover</label><br />

                                                                        <input type="checkbox" id="multipleVehicle" name="collisionType" className="form-check-input" />
                                                                        <label htmlFor="multipleVehicle" className="form-check-label">Multiple Vehicle</label><br />

                                                                        <input type="checkbox" id="hitParkedVehicle" name="collisionType" className="form-check-input" />
                                                                        <label htmlFor="hitParkedVehicle" className="form-check-label">Hit Parked Vehicle</label><br />

                                                                        <input type="checkbox" id="hitAnimal" name="collisionType" className="form-check-input" />
                                                                        <label htmlFor="hitAnimal" className="form-check-label">Hit Animal</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label
                                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                        htmlFor="incidentDescription12"
                                                                    >
                                                                        Incident Description:
                                                                    </label>
                                                                    <br /> <hr />
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="incidentDescription"
                                                                        name="incidentDescription"
                                                                    />
                                                                </div>

                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>
                                                            </div>
                                                        </div>


                                                        <div style={{ display: patientCareReportStatus === "Part 2. Vehicular Accident Incident Details" ? "block" : "none" }}>
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Part 2. Vehicular Accident Vehicle Details</label>
                                                                    <br /> <hr />
                                                                    <input
                                                                        id='vehicularAccidentDetails'
                                                                        type="text"
                                                                        className="form-control"
                                                                    />
                                                                </div>


                                                                <div className="col-md-6">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="classification">
                                                                        Classification:
                                                                    </label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input
                                                                            type="checkbox"
                                                                            id="classificationPrivate"
                                                                            name="classification"
                                                                            value="Private"
                                                                            className="form-check-input"
                                                                        />
                                                                        <label htmlFor="classificationPrivate" className="form-check-label">Private</label><br />

                                                                        <input
                                                                            type="checkbox"
                                                                            id="classificationPublic"
                                                                            name="classification"
                                                                            value="Public"
                                                                            className="form-check-input"
                                                                        />
                                                                        <label htmlFor="classificationPublic" className="form-check-label">Public</label><br />

                                                                        <input
                                                                            type="checkbox"
                                                                            id="classificationGovernment"
                                                                            name="classification"
                                                                            value="Government"
                                                                            className="form-check-input"
                                                                        />
                                                                        <label htmlFor="classificationGovernment" className="form-check-label">Government</label><br />

                                                                        <input
                                                                            type="checkbox"
                                                                            id="classificationDiplomat"
                                                                            name="classification"
                                                                            value="Diplomat"
                                                                            className="form-check-input"
                                                                        />
                                                                        <label htmlFor="classificationDiplomat" className="form-check-label">Diplomat</label><br />
                                                                    </div>
                                                                </div>


                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>

                                                                <div className="col-md-6">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Type of Vehicle Involved:</label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="motorcycle" name="vehicleType" value="Motorcycle" className="form-check-input" />
                                                                        <label htmlFor="motorcycle" className="form-check-label">Motorcycle</label><br />

                                                                        <input type="checkbox" id="bike" name="vehicleType" value="Bike" className="form-check-input" />
                                                                        <label htmlFor="bike" className="form-check-label">Bike</label><br />

                                                                        <input type="checkbox" id="jeepney" name="vehicleType" value="Jeepney" className="form-check-input" />
                                                                        <label htmlFor="jeepney" className="form-check-label">Jeepney</label><br />

                                                                        <input type="checkbox" id="ambulance" name="vehicleType" value="Ambulance" className="form-check-input" />
                                                                        <label htmlFor="ambulance" className="form-check-label">Ambulance</label><br />

                                                                        <input type="checkbox" id="heavyEquipment" name="vehicleType" value="Heavy Equipment" className="form-check-input" />
                                                                        <label htmlFor="heavyEquipment" className="form-check-label">Heavy Equipment</label><br />

                                                                        <input type="checkbox" id="aircraft" name="vehicleType" value="aircraft" className="form-check-input" />
                                                                        <label htmlFor="aircraft" className="form-check-label">Aircraft</label><br />

                                                                        <input type="checkbox" id="tricycle" name="vehicleType" value="Tricycle" className="form-check-input" />
                                                                        <label htmlFor="tricycle" className="form-check-label">Tricycle</label><br />

                                                                        <input type="checkbox" id="eBike" name="vehicleType" value="E-Bike" className="form-check-input" />
                                                                        <label htmlFor="eBike" className="form-check-label">E-Bike</label><br />

                                                                        <input type="checkbox" id="horseDriven" name="vehicleType" value="Horse Driven" className="form-check-input" />
                                                                        <label htmlFor="horseDriven" className="form-check-label">Horse Driven</label><br />

                                                                        <input type="checkbox" id="pushCart" name="vehicleType" value="Push Cart" className="form-check-input" />
                                                                        <label htmlFor="pushCart" className="form-check-label">Push Cart</label><br />

                                                                        <input type="checkbox" id="car" name="vehicleType" value="Car" className="form-check-input" />
                                                                        <label htmlFor="car" className="form-check-label">Car</label><br />

                                                                        <input type="checkbox" id="eTricycle" name="vehicleType" value="E-Tricycle" className="form-check-input" />
                                                                        <label htmlFor="eTricycle" className="form-check-label">E-Tricycle</label><br />

                                                                        <input type="checkbox" id="pedicab" name="vehicleType" value="Pedicab" className="form-check-input" />
                                                                        <label htmlFor="pedicab" className="form-check-label">Pedicab</label><br />

                                                                        <input type="checkbox" id="fourWheelsAtv" name="vehicleType" value="4 Wheels ATV" className="form-check-input" />
                                                                        <label htmlFor="fourWheelsAtv" className="form-check-label">4 Wheels ATV</label><br />

                                                                        <input type="checkbox" id="waterVessel" name="vehicleType" value="Water Vessel" className="form-check-input" />
                                                                        <label htmlFor="waterVessel" className="form-check-label">Water Vessel</label><br />

                                                                        <input type="checkbox" id="truck" name="vehicleType" value="Truck" className="form-check-input" />
                                                                        <label htmlFor="truck" className="form-check-label">Truck</label><br />

                                                                        <input type="checkbox" id="hauler" name="vehicleType" value="Hauler" className="form-check-input" />
                                                                        <label htmlFor="hauler" className="form-check-label">Hauler</label><br />

                                                                        <input type="checkbox" id="bus" name="vehicleType" value="Bus" className="form-check-input" />
                                                                        <label htmlFor="bus" className="form-check-label">Bus</label><br />

                                                                        <input type="checkbox" id="armoredCar" name="vehicleType" value="Armored Car" className="form-check-input" />
                                                                        <label htmlFor="armoredCar" className="form-check-label">Armored Car</label><br />

                                                                        <input type="checkbox" id="animal" name="vehicleType" value="Animal" className="form-check-input" />
                                                                        <label htmlFor="animal" className="form-check-label">Animal</label><br />

                                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }} htmlFor="vehicleOthers">Others:</label>
                                                                        <input type="text" id="vehicleOthers" name="vehicleOthers" className="form-control" />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-6">
                                                                    <div className="form-check">
                                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }} htmlFor="vehicleMake">Make:</label>
                                                                        <input type="text" id="vehicleMake" name="vehicleMake" className="form-control" />
                                                                    </div>
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }} htmlFor="vehicleModel">Model:</label>
                                                                        <input type="text" id="vehicleModel" name="vehicleModel" className="form-control" />
                                                                    </div>
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }} htmlFor="plateNumber">Plate No.:</label>
                                                                        <input type="text" id="plateNumber" name="plateNumber" className="form-control" />
                                                                    </div>
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }} htmlFor="tcBodyNumber">TC Body No.:</label>
                                                                        <input type="text" id="tcBodyNumber" name="tcBodyNumber" className="form-control" />
                                                                    </div>
                                                                    <hr />
                                                                </div>


                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Manuever: </label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="leftTurn" name="maneuver" className="form-check-input" />
                                                                        <label htmlFor="leftTurn" className="form-check-label">Left Turn</label><br />

                                                                        <input type="checkbox" id="rightTurn" name="maneuver" className="form-check-input" />
                                                                        <label htmlFor="rightTurn" className="form-check-label">Right Turn</label><br />

                                                                        <input type="checkbox" id="uTurn" name="maneuver" className="form-check-input" />
                                                                        <label htmlFor="uTurn" className="form-check-label">U Turn</label><br />

                                                                        <input type="checkbox" id="crossTraffic" name="maneuver" className="form-check-input" />
                                                                        <label htmlFor="crossTraffic" className="form-check-label">Cross Traffic</label><br />

                                                                        <input type="checkbox" id="merging" name="maneuver" className="form-check-input" />
                                                                        <label htmlFor="merging" className="form-check-label">Merging</label><br />

                                                                        <input type="checkbox" id="diverging" name="maneuver" className="form-check-input" />
                                                                        <label htmlFor="diverging" className="form-check-label">Diverging</label><br />

                                                                        <input type="checkbox" id="overtaking" name="maneuver" className="form-check-input" />
                                                                        <label htmlFor="overtaking" className="form-check-label">Overtaking</label><br />

                                                                        <input type="checkbox" id="goingAhead" name="maneuver" className="form-check-input" />
                                                                        <label htmlFor="goingAhead" className="form-check-label">Going Ahead</label><br />

                                                                        <input type="checkbox" id="reversing" name="maneuver" className="form-check-input" />
                                                                        <label htmlFor="reversing" className="form-check-label">Reversing</label><br />

                                                                        <input type="checkbox" id="suddenStop" name="maneuver" className="form-check-input" />
                                                                        <label htmlFor="suddenStop" className="form-check-label">Sudden Stop</label><br />

                                                                        <input type="checkbox" id="suddenStart" name="maneuver" className="form-check-input" />
                                                                        <label htmlFor="suddenStart" className="form-check-label">Sudden Start</label><br />

                                                                        <input type="checkbox" id="parkedOffRoad" name="maneuver" className="form-check-input" />
                                                                        <label htmlFor="parkedOffRoad" className="form-check-label">Parked Off Road</label><br />

                                                                        <input type="checkbox" id="parkedOnRoad" name="maneuver" className="form-check-input" />
                                                                        <label htmlFor="parkedOnRoad" className="form-check-label">Parked On Road</label><br />

                                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }} htmlFor="ambulanceInput2">Others:   </label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            id="otherManeuver"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Damage: </label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="damageRear" name="damage" className="form-check-input" />
                                                                        <label htmlFor="damageRear" className="form-check-label">Rear</label><br />

                                                                        <input type="checkbox" id="damageRoof" name="damage" className="form-check-input" />
                                                                        <label htmlFor="damageRoof" className="form-check-label">Roof</label><br />

                                                                        <input type="checkbox" id="damageNone" name="damage" className="form-check-input" />
                                                                        <label htmlFor="damageNone" className="form-check-label">None</label><br />

                                                                        <input type="checkbox" id="damageRight" name="damage" className="form-check-input" />
                                                                        <label htmlFor="damageRight" className="form-check-label">Right</label><br />

                                                                        <input type="checkbox" id="damageMultiple" name="damage" className="form-check-input" />
                                                                        <label htmlFor="damageMultiple" className="form-check-label">Multiple</label><br />

                                                                        <input type="checkbox" id="damageFront" name="damage" className="form-check-input" />
                                                                        <label htmlFor="damageFront" className="form-check-label">Front</label><br />

                                                                        <input type="checkbox" id="damageLeft" name="damage" className="form-check-input" />
                                                                        <label htmlFor="damageLeft" className="form-check-label">Left</label><br />

                                                                        <input type="checkbox" id="damageOthers" name="damage" className="form-check-input" />
                                                                        <label htmlFor="damageOthers" className="form-check-label">Others</label><br />

                                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }} htmlFor="damage">Others:</label>
                                                                        <input type="text" id="damageOthersInput" name="damage" className="form-control" />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Defect: </label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="defectBrakes" name="defect" className="form-check-input" />
                                                                        <label htmlFor="defectBrakes" className="form-check-label">Brakes</label><br />

                                                                        <input type="checkbox" id="defectMultiple" name="defect" className="form-check-input" />
                                                                        <label htmlFor="defectMultiple" className="form-check-label">Multiple</label><br />

                                                                        <input type="checkbox" id="defectNone" name="defect" className="form-check-input" />
                                                                        <label htmlFor="defectNone" className="form-check-label">None</label><br />

                                                                        <input type="checkbox" id="defectSteering" name="defect" className="form-check-input" />
                                                                        <label htmlFor="defectSteering" className="form-check-label">Steering</label><br />

                                                                        <input type="checkbox" id="defectEngine" name="defect" className="form-check-input" />
                                                                        <label htmlFor="defectEngine" className="form-check-label">Engine</label><br />

                                                                        <input type="checkbox" id="defectLights" name="defect" className="form-check-input" />
                                                                        <label htmlFor="defectLights" className="form-check-label">Lights</label><br />

                                                                        <input type="checkbox" id="defectTires" name="defect" className="form-check-input" />
                                                                        <label htmlFor="defectTires" className="form-check-label">Tires</label><br />

                                                                        <input type="checkbox" id="defectOthers" name="defect" className="form-check-input" />
                                                                        <label htmlFor="defectOthers" className="form-check-label">Others</label><br />

                                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }} htmlFor="defect">Others:</label>
                                                                        <input type="text" id="defectOthersInput" name="defect" className="form-control" />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Loading: </label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="loadingLegal" name="loading" className="form-check-input" />
                                                                        <label htmlFor="loadingLegal" className="form-check-label">Legal</label><br />

                                                                        <input type="checkbox" id="loadingOverloaded" name="loading" className="form-check-input" />
                                                                        <label htmlFor="loadingOverloaded" className="form-check-label">Overloaded</label><br />

                                                                        <input type="checkbox" id="loadingUnsafe" name="loading" className="form-check-input" />
                                                                        <label htmlFor="loadingUnsafe" className="form-check-label">Unsafe Load</label><br />
                                                                    </div>
                                                                </div>


                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>
                                                            </div>
                                                        </div>


                                                        <div style={{ display: patientCareReportStatus === "Part 3. Vehicular Accident Involved Incident Details" ? "block" : "none" }}>
                                                            <div className="row">
                                                                <div className="col-md-4">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Part 3. Vehicular Involved People Details</label>
                                                                    <br /> <hr />
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id='part3'
                                                                    />
                                                                </div>


                                                                <div className="col-md-4">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Involvement:</label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="involvement_driver" name="involvement_driver" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Driver</label><br />

                                                                        <input type="checkbox" id="involvement_passenger" name="involvement_passenger" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Passenger</label><br />

                                                                        <input type="checkbox" id="involvement_pedestrian" name="involvement_pedestrian" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Pedestrian</label><br />
                                                                    </div>
                                                                </div>


                                                                <div className="col-md-4">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">License No.:</label>
                                                                    <br /> <hr />
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id='licenseNumber'
                                                                    />

                                                                    <hr />

                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="NolicenseNumber" name="NolicenseNumber" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">No License</label><br />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="driverError">Driver of Vehicle Error:</label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="driverErrorFatigued" name="driverError" className="form-check-input" />
                                                                        <label htmlFor="driverErrorFatigued" className="form-check-label">Fatigued/Sleep</label><br />

                                                                        <input type="checkbox" id="driverErrorNoSignal" name="driverError" className="form-check-input" />
                                                                        <label htmlFor="driverErrorNoSignal" className="form-check-label">No Signal</label><br />

                                                                        <input type="checkbox" id="driverErrorBadOvertaking" name="driverError" className="form-check-input" />
                                                                        <label htmlFor="driverErrorBadOvertaking" className="form-check-label">Bad Overtaking</label><br />

                                                                        <input type="checkbox" id="driverErrorInattentive" name="driverError" className="form-check-input" />
                                                                        <label htmlFor="driverErrorInattentive" className="form-check-label">Inattentive</label><br />

                                                                        <input type="checkbox" id="driverErrorBadTurning" name="driverError" className="form-check-input" />
                                                                        <label htmlFor="driverErrorBadTurning" className="form-check-label">Bad Turning</label><br />

                                                                        <input type="checkbox" id="driverErrorTooFast" name="driverError" className="form-check-input" />
                                                                        <label htmlFor="driverErrorTooFast" className="form-check-label">Too Fast</label><br />

                                                                        <input type="checkbox" id="driverErrorUsingCellphone" name="driverError" className="form-check-input" />
                                                                        <label htmlFor="driverErrorUsingCellphone" className="form-check-label">Using Cellphone</label><br />

                                                                        <input type="checkbox" id="driverErrorTooClose" name="driverError" className="form-check-input" />
                                                                        <label htmlFor="driverErrorTooClose" className="form-check-label">Too Close</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="injury">Injury:</label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="injuryFatal" name="injury" className="form-check-input" />
                                                                        <label htmlFor="injuryFatal" className="form-check-label">Fatal</label><br />

                                                                        <input type="checkbox" id="injurySerious" name="injury" className="form-check-input" />
                                                                        <label htmlFor="injurySerious" className="form-check-label">Serious</label><br />

                                                                        <input type="checkbox" id="injuryMinor" name="injury" className="form-check-input" />
                                                                        <label htmlFor="injuryMinor" className="form-check-label">Minor</label><br />

                                                                        <input type="checkbox" id="injuryNotInjured" name="injury" className="form-check-input" />
                                                                        <label htmlFor="injuryNotInjured" className="form-check-label">Not Injured</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="alcoholDrugs">Alcohol/Drugs:</label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="alcoholSuspected" name="alcoholDrugs" className="form-check-input" />
                                                                        <label htmlFor="alcoholSuspected" className="form-check-label">Alcohol Suspected</label><br />

                                                                        <input type="checkbox" id="drugsSuspected" name="alcoholDrugs" className="form-check-input" />
                                                                        <label htmlFor="drugsSuspected" className="form-check-label">Drugs Suspected</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="seatbeltHelmet">Seatbelt/Helmet:</label>
                                                                    <br /> <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="seatbeltHelmetWorn" name="seatbeltHelmet" className="form-check-input" />
                                                                        <label htmlFor="seatbeltHelmetWorn" className="form-check-label">Seatbelt/Helmet Worn</label><br />

                                                                        <input type="checkbox" id="seatbeltHelmetNotWorn" name="seatbeltHelmet" className="form-check-input" />
                                                                        <label htmlFor="seatbeltHelmetNotWorn" className="form-check-label">Not Worn</label><br />

                                                                        <input type="checkbox" id="seatbeltHelmetNotWornCorrectly" name="seatbeltHelmet" className="form-check-input" />
                                                                        <label htmlFor="seatbeltHelmetNotWornCorrectly" className="form-check-label">Not Worn Correctly</label><br />

                                                                        <input type="checkbox" id="seatbeltHelmetNoSeatbelt" name="seatbeltHelmet" className="form-check-input" />
                                                                        <label htmlFor="seatbeltHelmetNoSeatbelt" className="form-check-label">No Seatbelt / Helmet</label><br />
                                                                    </div>
                                                                </div>

                                                                <div className="col-md-12">
                                                                    <hr />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                            {/* <button type="submit" className="btn btn-primary" id='saveChangesBtn' >Save changes</button> */}
                                            {showSubmit && (
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    id="saveChangesBtn"
                                                >
                                                    Save changes
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div >


                    </div >
                </section >
            </div >
        </>
    );
}

export default PatientCareReportContent;
