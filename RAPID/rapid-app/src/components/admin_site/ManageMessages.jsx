import React, { useEffect, useState } from 'react';
import FetchNotification from './scripts/FetchNotification';
import { FetchAmbulanceDetails } from './scripts/FetchAmbulanceDetails';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Modal } from "bootstrap";
import { useNavigate } from "react-router-dom";
import ViewTrackingInformationModal from './TrackingInformationModal';

function ManageMessages() {

    const [notificationList, setNotificationList] = useState([]);
    const [trackingData, setTrackingData] = useState();
    const [activeTrackingId, setActiveTrackingId] = useState();
    const [retrieve_ambulanceName, setAmbulanceName] = useState();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = FetchNotification((data) => {
            setNotificationList(data);
        });
        return () => unsubscribe();
    }, []);

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

    const handleViewTrackingInformation = (TransactionId, ambulanceName) => {
        const modal = new Modal(document.getElementById("viewTrackingModal"));
        modal.show();
        setActiveTrackingId(TransactionId);
        setAmbulanceName(ambulanceName);
    };

    const sortedNotifications = notificationList.sort((a, b) => b.savedAt.toDate() - a.savedAt.toDate());
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = sortedNotifications.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(sortedNotifications.length / recordsPerPage);

    return (
        <>
            <main id="main" className="main">
                <div className="content">
                    <h1>Notification</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><a>Admin</a></li>
                            <li className="breadcrumb-item active">Notification</li>
                        </ol>
                    </nav>
                </div>

                <hr />

                <main className="py-6">
                    <div className="container-fluid">
                        <section className="section dashboard">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="card info-card sales-card">
                                        <div className="card-body">
                                            {/* Filter and Search Section */}
                                            <div className="row mb-3 justify-content-end">
                                                <div className="col-sm-3">
                                                    <label>Filter:</label>
                                                </div>
                                                <div className="col-sm-3">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Search Account Name"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="table-responsive">
                                                <table className="table datatable table-custom">
                                                    <thead>
                                                        <tr>
                                                            <th>No.</th>
                                                            <th>Sender</th>
                                                            <th>Message Sent</th>
                                                            <th>Datetime Sent</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentRecords.length > 0 ? (
                                                            currentRecords
                                                                .filter(record =>
                                                                    record.NotificationStatus === "TrackingMessage" &&
                                                                    `${record.accountData.firstName} ${record.accountData.middleName} ${record.accountData.lastName}`
                                                                        .toLowerCase()
                                                                        .includes(searchTerm.toLowerCase()) // Filter by sender's name
                                                                )
                                                                .map((record, index) => (
                                                                    <tr key={record.TransactionId}>
                                                                        <td>{indexOfFirstRecord + index + 1}</td>
                                                                        <td>
                                                                            {record.accountData.firstName} {record.accountData.middleName} {record.accountData.lastName}
                                                                        </td>
                                                                        <td>{record.Message || "N/A"}</td>
                                                                        <td>
                                                                            {record.savedAt
                                                                                ? new Date(record.savedAt.toDate()).toLocaleString("en-US", {
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
                                                                            <button
                                                                                className="btn btn-success btn-sm"
                                                                                data-bs-toggle="modal"
                                                                                data-bs-target="#trackingModal"
                                                                                onClick={() =>
                                                                                    handleViewTrackingInformation(record.TransactionId, trackingData[record.AmbulanceId]?.AmbulanceName)
                                                                                }
                                                                            >
                                                                                <i className="fas fa-eye"></i> View
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="5" className="text-center">
                                                                    No records found.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
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
                        </section>
                    </div>
                </main>
            </main>

            <ViewTrackingInformationModal currentUid={activeTrackingId} ambulanceName={retrieve_ambulanceName} />
        </>
    );
}

export default ManageMessages;
