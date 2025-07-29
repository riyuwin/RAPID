import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Modal } from "bootstrap";
import { useNavigate } from "react-router-dom";
import ViewTrackingInformationModal from './TrackingInformationModal';
import FetchMessages from './scripts/FetchMessages';
import PopUpNotification from './PopUpNotification';

function ManageMessages() {
    const [notificationList, setNotificationList] = useState([]);
    const [trackingData, setTrackingData] = useState({});
    const [activeTrackingId, setActiveTrackingId] = useState();
    const [retrieve_ambulanceName, setAmbulanceName] = useState();
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = FetchMessages((data) => {
            setNotificationList(data);
        });
        return () => unsubscribe();
    }, []);

    const handleViewTrackingInformation = (TransactionId, ambulanceName) => {
        const modal = new Modal(document.getElementById("viewTrackingModal"));
        modal.show();
        setActiveTrackingId(TransactionId);
        setAmbulanceName(ambulanceName);
    };


    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    // Sort first before paginating
    const sortedRecords = [...notificationList].sort((a, b) => (b.savedAt?.seconds || 0) - (a.savedAt?.seconds || 0));

    // Compute indexes for pagination
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = sortedRecords.slice(indexOfFirstRecord, indexOfLastRecord);

    const totalPages = Math.ceil(sortedRecords.length / recordsPerPage);

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
                                            <br />
                                            <div className="row mb-3 justify-content-end">
                                                <div className="col-sm-3">
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
                                                        {notificationList.length > 0 ? (
                                                            notificationList.map((record, index) => (
                                                                <tr key={record.TransactionId}>
                                                                    <td>{index + 1}</td>
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </main>

            <ViewTrackingInformationModal currentUid={activeTrackingId} ambulanceName={retrieve_ambulanceName} />
            <PopUpNotification />
        </>
    );
}

export default ManageMessages;
