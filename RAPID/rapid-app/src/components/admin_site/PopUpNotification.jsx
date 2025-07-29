import { useEffect, useState, useRef } from "react";
import { Modal } from "bootstrap";
import FetchLatestPatient from "./scripts/FetchLatestPatient";
import { UpdateNotifPatient } from "./scripts/UpdateNotifPatient";
import CharacterModel from "../arp_site/CharacterModel";
import { ResetForms } from "../arp_site/scripts/ResetForms";
import PatientCareReportFetcher from "../arp_site/scripts/PatientCareReportFetcher";
import { useFetchCurrentUser } from "../arp_site/scripts/FetchCurrentUser";
import { PopulatePatientCareReport } from "../arp_site/scripts/PopulatePatientCareReport";

function PopUpNotification() {
    const [notifications, setNotifications] = useState([]);
    const modalRef = useRef(null);
    const modalInstanceRef = useRef(null);

    const [patientCareReportStatus, setPatientCareReportStatus] = useState("Basic Information");
    const [isDisabled, setIsDisabled] = useState(true);
    const [patientDetails, setPatientDetails] = useState(null);

    const [isNoLicenseChecked, setIsNoLicenseChecked] = useState(false);

    const handleCheckboxChange = () => {
        setIsNoLicenseChecked(!isNoLicenseChecked);
    };

    const handlePatientCareReportStatus = (e) => {
        setPatientCareReportStatus(e.target.value);
    }

    /* Nationality Selector */
    const [selectedNationality, setSelectedNationality] = useState("");
    const [otherNationality, setOtherNationality] = useState("");

    const handleNationalityChange = (e) => {
        setSelectedNationality(e.target.value);
    };

    const handleOtherNationalityChange = (e) => {
        setOtherNationality(e.target.value);
    };

    useEffect(() => {
        const unsubscribe = FetchLatestPatient((data) => {
            if (data.length > 0) {
                const sortedData = [...data].sort((a, b) => b.savedAt.seconds - a.savedAt.seconds);
                setNotifications(sortedData);
                openModal();
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (modalRef.current) {
            modalInstanceRef.current = new Modal(modalRef.current);

            modalRef.current.addEventListener("hidden.bs.modal", () => {
                setNotifications([]); // Clear notifications when modal is closed
            });
        }
    }, []);

    const openModal = () => {
        if (modalInstanceRef.current) {
            modalInstanceRef.current.show();
        }
    };

    const closeModal = () => {
        if (modalInstanceRef.current) {
            modalInstanceRef.current.hide();
        }
    };

    const handleMarkAsRead = async (patientId) => {
        await UpdateNotifPatient(patientId, "Read");
        setNotifications((prev) => prev.filter((notif) => notif.id !== patientId));

        if (notifications.length === 1) {
            closeModal();
        }
    };

    const [editPatientID, setPatientID] = useState("");
    const [viewPatientStatus, setPatientStatus] = useState("");
    const [modalRemarks, setModalRemarks] = useState("");
    const [showSubmit, setShowSubmit] = useState(true);
    const [actionParameter, setActionParameter] = useState(null);
    const [modalTitle, setModalTitle] = useState("");
    const { accountId, currentUserloading } = useFetchCurrentUser();

    const handleViewClick = (patientId, patient_status, remarks) => {

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
                    setShowSubmit(false);
                    setPatientStatus(patient_status)
                    setModalRemarks(remarks);

                    setPatientDetails(data);
                } else {
                    console.error("No data returned for patient ID:", patientId);
                }
            }
        });
    };

    return (
        <>
            <div className="modal fade" id="popUpNotifModal" tabIndex="-1" ref={modalRef} aria-labelledby="popUpNotifModal" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Patient Care Report Unread Notifications</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={closeModal} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ overflowX: "auto" }}>
                                {notifications.length > 0 ? (
                                    <table className="table table-striped text-center align-middle">
                                        <thead>
                                            <tr>
                                                <th>No.</th>
                                                <th>Patient Name</th>
                                                <th>Responder Name</th>
                                                <th>Triage Tagging</th>
                                                <th>Datetime Reported</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {notifications.map((notif, index) => {
                                                /* let triageClass = "triage-default"; // Default class

                                                if (notif.triageTagging.triageTaggingB) {
                                                    triageClass = "triage-blue";
                                                } else if (notif.triageTagging.triageTaggingG) {
                                                    triageClass = "triage-green";
                                                } else if (notif.triageTagging.triageTaggingR) {
                                                    triageClass = "triage-red";
                                                } else if (notif.triageTagging.triageTaggingY) {
                                                    triageClass = "triage-yellow";
                                                } */

                                                return (
                                                    <tr key={notif.id} className={` text-center align-middle`}>
                                                        <td>{index + 1}</td>
                                                        <td>{notif.basicInformation.firstName} {notif.basicInformation.middleName} {notif.basicInformation.surname}</td>
                                                        <td>{notif.accountData.firstName} {notif.accountData.middleName} {notif.accountData.lastName}</td>
                                                        <td>
                                                            <div className={`triage-box 
                                                                ${notif.triageTagging.triageTaggingB ? "triage-blue" : ""}
                                                                ${notif.triageTagging.triageTaggingG ? "triage-green" : ""}
                                                                ${notif.triageTagging.triageTaggingR ? "triage-red" : ""}
                                                                ${notif.triageTagging.triageTaggingY ? "triage-yellow" : ""}`}>
                                                                {notif.triageTagging.triageTaggingB
                                                                    ? "B"
                                                                    : notif.triageTagging.triageTaggingG
                                                                        ? "G"
                                                                        : notif.triageTagging.triageTaggingR
                                                                            ? "R"
                                                                            : notif.triageTagging.triageTaggingY
                                                                                ? "Y"
                                                                                : "N/A"}
                                                            </div>
                                                        </td>

                                                        <td>
                                                            {notif.savedAt
                                                                ? new Date(notif.savedAt.seconds * 1000).toLocaleString("en-US", {
                                                                    month: "long",
                                                                    day: "2-digit",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                })
                                                                : "N/A"}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex justify-content-center gap-2">
                                                                <button className="btn btn-secondary btn-sm" onClick={() => handleViewClick(notif.patientId, notif.patient_status, "View")}
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#addPatientCareReport">
                                                                    <i class="bi bi-eye"></i> &nbsp;
                                                                    View
                                                                </button>
                                                                <button className="btn btn-secondary btn-sm" onClick={() => handleMarkAsRead(notif.id)}>
                                                                    <i class="bi bi-envelope-check"></i> &nbsp;
                                                                    Mark as Read
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                ) : (
                                    <p>No unread notifications.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="addPatientCareReport" tabindex="-1" aria-labelledby="addPatientCareReport" aria-hidden="true">
                <div className="modal-dialog modal-xl"> {/* Apply modal-lg for a larger width */}
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="modalTitle">{modalTitle}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form  >
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
                                                            {/* < GeneratePdf /> */}
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
                                                            type="time"
                                                            className="form-control"
                                                        />
                                                    </div>

                                                    <div className="col-md-3">
                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">To Scene: <span className='required-form'>*</span></label>
                                                        <input
                                                            id='toScene'
                                                            type="time"
                                                            className="form-control"
                                                        />
                                                    </div>

                                                    <div className="col-md-3">
                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">At Scene: <span className='required-form'>*</span></label>
                                                        <input
                                                            id='atSceneInput'
                                                            type="time"
                                                            className="form-control"
                                                        />
                                                    </div>

                                                    <div className="col-md-3">
                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">To Hospital: <span className='required-form'>*</span></label>
                                                        <input
                                                            id='toHospitalInput'
                                                            type="time"
                                                            className="form-control"
                                                        />
                                                    </div>

                                                    <div className="col-md-3">
                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">At Hospital: <span className='required-form'>*</span></label>
                                                        <input
                                                            id='atHospitalInput'
                                                            type="time"
                                                            className="form-control"
                                                        />
                                                    </div>

                                                    <div className="col-md-3">
                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Base: <span className='required-form'>*</span></label>
                                                        <input
                                                            id='baseInput'
                                                            type="time"
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

                                                            {/* <input type="checkbox" id="obsGynPreDelivery" name="obsGyn" className="form-check-input" />
                                                            <label htmlFor="obsGynPreDelivery" className="form-check-label">Pre-Hospital Delivery</label><br /> */}

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


                                                    {/* <div className="col-md-3">
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

                                                    </div> */}

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
                                                            <input type="radio" id="motorNone" name="motor" className="form-check-input" />
                                                            <label htmlFor="motorNone" className="form-check-label">1. NONE</label><br />

                                                            <input type="radio" id="motorExtension" name="motor" className="form-check-input" />
                                                            <label htmlFor="motorExtension" className="form-check-label">2. EXTENSION</label><br />

                                                            <input type="radio" id="motorFlexion" name="motor" className="form-check-input" />
                                                            <label htmlFor="motorFlexion" className="form-check-label">3. FLEXION</label><br />

                                                            <input type="radio" id="motorWithdraw" name="motor" className="form-check-input" />
                                                            <label htmlFor="motorWithdraw" className="form-check-label">4. WITHDRAW</label><br />

                                                            <input type="radio" id="motorLocalize" name="motor" className="form-check-input" />
                                                            <label htmlFor="motorLocalize" className="form-check-label">5. LOCALIZE</label><br />

                                                            <input type="radio" id="motorObey" name="motor" className="form-check-input" />
                                                            <label htmlFor="motorObey" className="form-check-label">6. OBEY</label><br />
                                                        </div>
                                                    </div>


                                                    <div className="col-md-3">
                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="verbalNone">Verbal:</label>

                                                        <br /> <hr />
                                                        <div className="form-check">
                                                            <input type="radio" id="verbalNone" name="verbal" className="form-check-input" />
                                                            <label htmlFor="verbalNone" className="form-check-label">1. NONE</label><br />

                                                            <input type="radio" id="verbalIncomprehensible" name="verbal" className="form-check-input" />
                                                            <label htmlFor="verbalIncomprehensible" className="form-check-label">2. INCOMPREHENSIBLE</label><br />

                                                            <input type="radio" id="verbalInappropriate" name="verbal" className="form-check-input" />
                                                            <label htmlFor="verbalInappropriate" className="form-check-label">3. INAPPROPRIATE</label><br />

                                                            <input type="radio" id="verbalConfused" name="verbal" className="form-check-input" />
                                                            <label htmlFor="verbalConfused" className="form-check-label">4. CONFUSED</label><br />

                                                            <input type="radio" id="verbalOriented" name="verbal" className="form-check-input" />
                                                            <label htmlFor="verbalOriented" className="form-check-label">5. ORIENTED</label><br />
                                                        </div>
                                                    </div>

                                                    <div className="col-md-3">
                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="eyeNone">Eye Opening:</label>

                                                        <br /> <hr />
                                                        <div className="form-check">
                                                            <input type="radio" id="eyeNone" name="eye" className="form-check-input" />
                                                            <label htmlFor="eyeNone" className="form-check-label">1. NONE</label><br />

                                                            <input type="radio" id="eyeToPain" name="eye" className="form-check-input" />
                                                            <label htmlFor="eyeToPain" className="form-check-label">2. TO PAIN</label><br />

                                                            <input type="radio" id="eyeToVoice" name="eye" className="form-check-input" />
                                                            <label htmlFor="eyeToVoice" className="form-check-label">3. TO VOICE</label><br />

                                                            <input type="radio" id="eyeSpontaneous" name="eye" className="form-check-input" />
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
                                                            <input type="radio" id="pulsePositive" name="pulse" className="form-check-input" />
                                                            <label htmlFor="pulsePositive" className="form-check-label">Positive</label><br />

                                                            <input type="radio" id="pulseRapid" name="pulse" className="form-check-input" />
                                                            <label htmlFor="pulseRapid" className="form-check-label">Rapid</label><br />

                                                            <input type="radio" id="pulseSlow" name="pulse" className="form-check-input" />
                                                            <label htmlFor="pulseSlow" className="form-check-label">Slow</label><br />

                                                            <input type="radio" id="pulseNegative" name="pulse" className="form-check-input" />
                                                            <label htmlFor="pulseNegative" className="form-check-label">Negative</label><br />
                                                        </div>
                                                    </div>

                                                    <div className="col-md-3">
                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="airwayClear">Airway:</label>

                                                        <br /> <hr />
                                                        <div className="form-check">
                                                            <input type="radio" id="airwayClear" name="airway" className="form-check-input" />
                                                            <label htmlFor="airwayClear" className="form-check-label">Clear</label><br />

                                                            <input type="radio" id="airwayPartial" name="airway" className="form-check-input" />
                                                            <label htmlFor="airwayPartial" className="form-check-label">Partially Obstructed</label><br />

                                                            <input type="radio" id="airwayObstructed" name="airway" className="form-check-input" />
                                                            <label htmlFor="airwayObstructed" className="form-check-label">Obstructed</label><br />
                                                        </div>
                                                    </div>

                                                    <div className="col-md-3">
                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="breathingNormal">Breathing:</label>

                                                        <br /> <hr />
                                                        <div className="form-check">
                                                            <input type="radio" id="breathingNormal" name="breathing" className="form-check-input" />
                                                            <label htmlFor="breathingNormal" className="form-check-label">Normal</label><br />

                                                            <input type="radio" id="breathingRapid" name="breathing" className="form-check-input" />
                                                            <label htmlFor="breathingRapid" className="form-check-label">Rapid</label><br />

                                                            <input type="radio" id="breathingSlow" name="breathing" className="form-check-input" />
                                                            <label htmlFor="breathingSlow" className="form-check-label">Slow</label><br />

                                                            <input type="radio" id="breathingShallow" name="breathing" className="form-check-input" />
                                                            <label htmlFor="breathingShallow" className="form-check-label">Shallow</label><br />

                                                            <input type="radio" id="breathingHyperventilate" name="breathing" className="form-check-input" />
                                                            <label htmlFor="breathingHyperventilate" className="form-check-label">Hyperventilate</label><br />

                                                            <input type="radio" id="breathingNone" name="breathing" className="form-check-input" />
                                                            <label htmlFor="breathingNone" className="form-check-label">None</label><br />
                                                        </div>
                                                    </div>

                                                    <div className="col-md-3">
                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="gagReflexPresent">GAG Reflex:</label>

                                                        <br /> <hr />
                                                        <div className="form-check">
                                                            <input type="radio" id="gagReflexPresent" name="gagReflex" className="form-check-input" />
                                                            <label htmlFor="gagReflexPresent" className="form-check-label">Present</label><br />

                                                            <input type="radio" id="gagReflexAbsent" name="gagReflex" className="form-check-input" />
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
                                                                                <input type="radio" id="row1LOCA" name="row1LOCA" className="form-check-input" />
                                                                                <label htmlFor="row1LOCA" className="form-check-label">A</label>
                                                                            </div>
                                                                            <div className="form-check form-check-inline">
                                                                                <input type="radio" id="row1LOCV" name="row1LOCV" className="form-check-input" />
                                                                                <label htmlFor="row1LOCV" className="form-check-label">V</label>
                                                                            </div>
                                                                            <div className="form-check form-check-inline">
                                                                                <input type="radio" id="row1LOCP" name="row1LOCP" className="form-check-input" />
                                                                                <label htmlFor="row1LOCP" className="form-check-label">P</label>
                                                                            </div>
                                                                            <div className="form-check form-check-inline">
                                                                                <input type="radio" id="row1LOCU" name="row1LOCU" className="form-check-input" />
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
                                                                                <input type="radio" id="row2LOCA" name="row2LOCA" className="form-check-input" />
                                                                                <label htmlFor="row2LOCA" className="form-check-label">A</label>
                                                                            </div>
                                                                            <div className="form-check form-check-inline">
                                                                                <input type="radio" id="row2LOCV" name="row2LOCV" className="form-check-input" />
                                                                                <label htmlFor="row2LOCV" className="form-check-label">V</label>
                                                                            </div>
                                                                            <div className="form-check form-check-inline">
                                                                                <input type="radio" id="row2LOCP" name="row2LOCP" className="form-check-input" />
                                                                                <label htmlFor="row2LOCP" className="form-check-label">P</label>
                                                                            </div>
                                                                            <div className="form-check form-check-inline">
                                                                                <input type="radio" id="row2LOCU" name="row2LOCU" className="form-check-input" />
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
                                                                                <input type="radio" id="row3LOCA" name="row3LOCA" className="form-check-input" />
                                                                                <label htmlFor="row3LOCA" className="form-check-label">A</label>
                                                                            </div>
                                                                            <div className="form-check form-check-inline">
                                                                                <input type="radio" id="row3LOCV" name="row3LOCV" className="form-check-input" />
                                                                                <label htmlFor="row3LOCV" className="form-check-label">V</label>
                                                                            </div>
                                                                            <div className="form-check form-check-inline">
                                                                                <input type="radio" id="row3LOCP" name="row3LOCP" className="form-check-input" />
                                                                                <label htmlFor="row3LOCP" className="form-check-label">P</label>
                                                                            </div>
                                                                            <div className="form-check form-check-inline">
                                                                                <input type="radio" id="row3LOCU" name="row3LOCU" className="form-check-input" />
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
                                                                                <input type="radio" id="row4LOCA" name="row4LOCA" className="form-check-input" />
                                                                                <label htmlFor="row4LOCA" className="form-check-label">A</label>
                                                                            </div>
                                                                            <div className="form-check form-check-inline">
                                                                                <input type="radio" id="row4LOCV" name="row4LOCV" className="form-check-input" />
                                                                                <label htmlFor="row4LOCV" className="form-check-label">V</label>
                                                                            </div>
                                                                            <div className="form-check form-check-inline">
                                                                                <input type="radio" id="row4LOCP" name="row4LOCP" className="form-check-input" />
                                                                                <label htmlFor="row4LOCP" className="form-check-label">P</label>
                                                                            </div>
                                                                            <div className="form-check form-check-inline">
                                                                                <input type="radio" id="row4LOCU" name="row4LOCU" className="form-check-input" />
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
                                                                                <input type="radio" id="Pearrl-L" name="Pearrl-L" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="Pearrl-R" name="Pearrl-R" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            CLEAR
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="Clear-L" name="Clear-L" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="Clear-R" name="Clear-R" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            LIMB
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline">
                                                                                <label htmlFor="limbYes" className="form-check-label">Yes</label>
                                                                                <input type="radio" id="limbYes" name="limbYes" className="form-check-input" />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline">
                                                                                <label htmlFor="limbNo" className="form-check-label">No</label>
                                                                                <input type="radio" id="limbNo" name="limbNo" className="form-check-input" />
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
                                                                                <input type="radio" id="Pinpoint-L" name="Pinpoint-L" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="Pinpoint-R" name="Pinpoint-R" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            ABSENT
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="AbsentL" name="AbsentL" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="AbsentR" name="AbsentR" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            ARMS
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline">
                                                                                <label htmlFor="armsYes" className="form-check-label">Yes</label>
                                                                                <input type="radio" id="armsYes" name="armsYes" className="form-check-input" />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline">
                                                                                <label htmlFor="armsNo" className="form-check-label">No</label>
                                                                                <input type="radio" id="armsNo" name="armsNo" className="form-check-input" />
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
                                                                                <input type="radio" id="dLatedL" name="dLatedL" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="dLatedR" name="dLatedR" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            DECREASE
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="decreaseL" name="decreaseL" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="decreaseR" name="decreaseR" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            ARMS
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline">
                                                                                <label htmlFor="armsYes" className="form-check-label">Yes</label>
                                                                                <input type="radio" id="arms2Yes" name="arms2Yes" className="form-check-input" />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline">
                                                                                <label htmlFor="armsNo" className="form-check-label">No</label>
                                                                                <input type="radio" id="arms2No" name="arms2No" className="form-check-input" />
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
                                                                                <input type="radio" id="sluggishL" name="sluggishL" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="sluggishR" name="sluggishR" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            CRACKLES
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="cracklesL" name="cracklesL" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="cracklesR" name="cracklesR" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            LEGS
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline">
                                                                                <label htmlFor="legs1Yes" className="form-check-label">Yes</label>
                                                                                <input type="radio" id="legs1Yes" name="legs1Yes" className="form-check-input" />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline">
                                                                                <label htmlFor="legs1No" className="form-check-label">No</label>
                                                                                <input type="radio" id="legs1No" name="legs1No" className="form-check-input" />
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
                                                                                <input type="radio" id="fixedL" name="fixedL" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="fixedR" name="fixedR" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            RONCHI
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="ronchiL" name="ronchiL" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="ronchiR" name="ronchiR" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            LEGS
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline">
                                                                                <label htmlFor="legs2Yes" className="form-check-label">Yes</label>
                                                                                <input type="radio" id="legs2Yes" name="legs2Yes" className="form-check-input" />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline">
                                                                                <label htmlFor="legs1No" className="form-check-label">No</label>
                                                                                <input type="radio" id="legs2No" name="legs2No" className="form-check-input" />
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
                                                                                <input type="radio" id="cataractL" name="cataractL" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="cataractR" name="cataractR" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            WHEEZE
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="wheezeL" name="wheezeL" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline ">
                                                                                <input type="radio" id="wheezeR" name="wheezeR" className="form-check-input " />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            LEGS
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline">
                                                                                <label htmlFor="legs2Yes" className="form-check-label">Yes</label>
                                                                                <input type="radio" id="legs3Yes" name="legs3Yes" className="form-check-input" />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-check form-check-inline">
                                                                                <label htmlFor="legs1No" className="form-check-label">No</label>
                                                                                <input type="radio" id="legs3No" name="legs3No" className="form-check-input" />
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
                                                                type="radio"
                                                                id="humanError"
                                                                name="incidentMainCause"
                                                                className="form-check-input"
                                                            />
                                                            <label htmlFor="humanError" className="form-check-label">Human Error</label><br />

                                                            <input
                                                                type="radio"
                                                                id="vehicleDefect"
                                                                name="incidentMainCause"
                                                                className="form-check-input"
                                                            />
                                                            <label htmlFor="vehicleDefect" className="form-check-label">Vehicle Defect</label><br />

                                                            <input
                                                                type="radio"
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
                                                            <input type="radio" id="seatbeltHelmetWorn" name="seatbeltHelmet" className="form-check-input" />
                                                            <label htmlFor="seatbeltHelmetWorn" className="form-check-label">Seatbelt/Helmet Worn</label><br />

                                                            <input type="radio" id="seatbeltHelmetNotWorn" name="seatbeltHelmet" className="form-check-input" />
                                                            <label htmlFor="seatbeltHelmetNotWorn" className="form-check-label">Not Worn</label><br />

                                                            <input type="radio" id="seatbeltHelmetNotWornCorrectly" name="seatbeltHelmet" className="form-check-input" />
                                                            <label htmlFor="seatbeltHelmetNotWornCorrectly" className="form-check-label">Not Worn Correctly</label><br />

                                                            <input type="radio" id="seatbeltHelmetNoSeatbelt" name="seatbeltHelmet" className="form-check-input" />
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
                            </div>
                        </form>
                    </div>
                </div>
            </div >
        </>
    );
}

export default PopUpNotification;
