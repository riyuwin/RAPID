import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Modal } from "bootstrap";
import { useNavigate } from "react-router-dom";
import { FetchAmbulanceDetails } from '../admin_site/scripts/FetchAmbulanceDetails';
import PatientCareFormModal from '../admin_site/PatientCareFormModal';
import ViewTrackingInformationModal from '../admin_site/TrackingInformationModal';
import FetchARPNotification from './scripts/FetchARPNotification';
import { useFetchCurrentUser } from './scripts/FetchCurrentUser';
import FetchNotification from '../admin_site/scripts/FetchNotification';

function NotificationContent() {
    const [notificationList, setNotificationList] = useState([]);
    const [trackingData, setTrackingData] = useState();
    const [patientID, setPatientID] = useState();
    const [transactionStatus, setTransactionStatus] = useState();
    const [notifStatus, setNotifStatus] = useState();
    const [activeTrackingId, setActiveTrackingId] = useState();
    const [retrieve_ambulanceName, setAmbulanceName] = useState();

    const { accountId, currentUserloading } = useFetchCurrentUser();

    /* useEffect(() => {
        if (!accountId || currentUserloading) return;
        console.log("HEEEE123", accountId)


        const unsubscribe = FetchARPNotification(accountId, (data) => {
            setNotificationList(data);
        });

        return () => {
            unsubscribe();
        };
    }, [accountId, currentUserloading]); */

    useEffect(() => {


        const unsubscribe = FetchNotification((data) => {
            setNotificationList(data);
        });

        return () => {
            unsubscribe();
        };
    });

    useEffect(() => {
        const fetchTrackingDetails = async () => {
            const trackingResults = {};

            for (const data of notificationList) {
                if (data.TrackingStatus === "Started Location Tracking") {
                    const ambulanceDetail = await FetchAmbulanceDetails(data.AmbulanceId);
                    trackingResults[data.AmbulanceId] = ambulanceDetail[0];
                }
            }

            setTrackingData(trackingResults);
        };

        fetchTrackingDetails();

    }, [notificationList]);

    /* useEffect(() => {
        console.log("Updated trackingData:", trackingData);
    }, [trackingData]); */

    const handleViewPatientCareFormModal = ((TransactionId, transactionStatus, notifStatus) => {
        const modal = new Modal(document.getElementById("viewPatientCareReport"));
        modal.show();

        setPatientID(TransactionId)
        setTransactionStatus(transactionStatus)
        setNotifStatus(notifStatus)
    })

    const handleViewAccountProfile = ((TransactionId) => {
        navigate(`/admin/user_details/${TransactionId}`);
    })

    const handleViewTrackingInformation = ((TransactionId, ambulanceName) => {
        const modal = new Modal(document.getElementById("viewTrackingModal"));
        modal.show();

        setActiveTrackingId(TransactionId)
        setAmbulanceName(ambulanceName)

    })

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    // Sorting and Pagination
    const sortedNotifications = notificationList.sort((a, b) => b.savedAt.toDate() - a.savedAt.toDate());
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = sortedNotifications.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(sortedNotifications.length / recordsPerPage);

    return (
        <>
            <main id="main_arp" className="main_arp">
                <div className="content">
                    <h1>Notification</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a>Ambulance Personnel</a>
                            </li>
                            <li className="breadcrumb-item active">Notification</li>
                        </ol>
                    </nav>
                </div>

                <hr />


                <main className="py-6 ">
                    <div className="container-fluid">
                        <section className="section dashboard">
                            <div className="row">


                                <div className="col-lg-12">
                                    <div className="row">
                                        <div className="col-xxl-12 col-md-12">
                                            <div className="card info-card sales-card" >
                                                <div className="card-body">
                                                    <div>
                                                        <div className="row">
                                                            {currentRecords.map((data, index) => (
                                                                <div className="col-md-12" key={data.id}>
                                                                    <div className="row d-flex justify-content-center align-items-center itemContainer">
                                                                        {/* Profile Image */}
                                                                        <div className="col-md-2 d-flex justify-content-center align-items-center notifColumn">
                                                                            <img src="/assets/img/profile.png" className="userProfileContainer img-fluid rounded-circle" alt="User Profile" />
                                                                        </div>

                                                                        {/* Notification Content */}
                                                                        <div className="col-md-8 justify-content-center align-items-center notifColumn">
                                                                            <h4 className='notifUserText'>
                                                                                {data.accountData.firstName} {data.accountData.middleName} {data.accountData.lastName} &nbsp;
                                                                                <span className='notifMembershipText'>
                                                                                    | &nbsp;
                                                                                    {data.accountData.membership === "AmbulancePersonnel" && "Ambulance Personnel"}
                                                                                    {data.accountData.membership === "EmergencyPersonnel" && "Emergency Personnel"}
                                                                                    {data.accountData.membership === "Admin" && "Admin"}
                                                                                </span>
                                                                            </h4>

                                                                            {/* Notification Messages */}
                                                                            {data.NotificationStatus === "DeletePatientStatus" && (
                                                                                <p className='notifText'>The Patient Care Report has been <b>Deleted</b>.</p>
                                                                            )}
                                                                            {data.NotificationStatus === "UpdatePatientStatus" && (
                                                                                <p className='notifText'>The Patient Care Report status has been updated to <b>{data.PatientStatus}</b>.</p>
                                                                            )}
                                                                            {data.NotificationStatus === "EditPatientCareReport" && (
                                                                                <p className='notifText'>The Patient Care Report has been <b>Edited</b>.</p>
                                                                            )}
                                                                            {data.NotificationStatus === "AddPatientCareReport" && (
                                                                                <p className='notifText'>The Patient Care Report has been <b>Added</b>.</p>
                                                                            )}
                                                                            {data.TrackingStatus === "Started Location Tracking" && (
                                                                                <p className='notifText'>
                                                                                    <b>Started</b> Location Tracking using {trackingData[data.AmbulanceId]?.AmbulanceName || "Loading..."}.
                                                                                </p>
                                                                            )}
                                                                            {data.TrackingStatus === "Updated Location Tracking" && (
                                                                                <p className='notifText'>
                                                                                    <b>Continue</b> Location Tracking using {trackingData[data.AmbulanceId]?.AmbulanceName || "Loading..."}.
                                                                                </p>
                                                                            )}
                                                                            {data.NotificationStatus === "CreateAccount" && (
                                                                                <p className='notifText'>An account has been created for <b>{data.accountData.firstName} {data.accountData.middleName} {data.accountData.lastName}</b>.</p>
                                                                            )}
                                                                            {data.NotificationStatus === "TrackingMessage" && (
                                                                                <p className='notifText'>
                                                                                    {data.accountData.firstName} {data.accountData.middleName} {data.accountData.lastName} has sent a message:
                                                                                    <b> "{data.Message}"</b>.
                                                                                </p>
                                                                            )}
                                                                        </div>

                                                                        {/* View Buttons */}
                                                                        <div className="col-md-2 d-flex justify-content-center align-items-center notifColumn">
                                                                            {(data.NotificationStatus === "AddPatientCareReport" ||
                                                                                data.NotificationStatus === "EditPatientCareReport" ||
                                                                                data.NotificationStatus === "UpdatePatientStatus") && (
                                                                                    <button
                                                                                        className='btn btn-link'
                                                                                        type='button'
                                                                                        data-bs-toggle="modal"
                                                                                        data-bs-target="#viewPatientCareReport"
                                                                                        onClick={() => handleViewPatientCareFormModal(data.TransactionId, data.PatientStatus || "Emergency", data.NotificationStatus)}
                                                                                    >
                                                                                        View
                                                                                    </button>
                                                                                )}

                                                                            {data.NotificationStatus === "CreateAccount" && (
                                                                                <button
                                                                                    className='btn btn-link'
                                                                                    type='button'
                                                                                    onClick={() => handleViewAccountProfile(data.TransactionId)}
                                                                                >
                                                                                    View
                                                                                </button>
                                                                            )}

                                                                            {(data.NotificationStatus === "TrackingLocation" ||
                                                                                data.NotificationStatus === "TrackingMessage") && (
                                                                                    <button
                                                                                        className='btn btn-link'
                                                                                        type='button'
                                                                                        data-bs-toggle="modal"
                                                                                        data-bs-target="#viewTrackingModal"
                                                                                        onClick={() => handleViewTrackingInformation(data.TransactionId, trackingData[data.AmbulanceId]?.AmbulanceName)}
                                                                                    >
                                                                                        View
                                                                                    </button>
                                                                                )}
                                                                        </div>

                                                                        {/* Notification Date */}
                                                                        <div className="col-md-12 d-flex justify-content-end align-items-center">
                                                                            <p className='dateText'>
                                                                                {new Intl.DateTimeFormat("en-US", {
                                                                                    year: "numeric",
                                                                                    month: "long",
                                                                                    day: "numeric",
                                                                                    hour: "2-digit",
                                                                                    minute: "2-digit",
                                                                                    second: "2-digit",
                                                                                    hour12: true,
                                                                                    timeZone: "Asia/Manila",
                                                                                }).format(data.savedAt.toDate())}
                                                                            </p>
                                                                        </div>

                                                                        <div className="col-md-12">
                                                                            <hr />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

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

                            </div>
                        </section>
                    </div>
                </main>
            </main>

            <PatientCareFormModal retrieve_PatientID={patientID} retrieve_transactionStatus={transactionStatus} notifStatus={notifStatus} />
            <ViewTrackingInformationModal currentUid={activeTrackingId} ambulanceName={retrieve_ambulanceName} />
        </>
    );
}

export default NotificationContent;
