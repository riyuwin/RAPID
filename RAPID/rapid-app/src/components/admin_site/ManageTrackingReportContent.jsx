import React, { useEffect, useState } from "react";
import { collection, doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase"; // Ensure this is correctly initialized
import "../../../css/style.css";
import "../../../css/style3.css";
import FetchTrackingReport from "./scripts/FetchTrackingReports";
import SelectTrackInformation from "../arp_site/scripts/SelectTrackInfromation";
import { useFetchTrackingInformation } from "../arp_site/scripts/FetchTrackingInformation";
import { StartMap } from "../arp_site/scripts/StartMap";
import { UpdateTrackingStatus } from "../arp_site/scripts/UpdateTrackingStatus";

function ManageTrackingReportContent() {
    const [allTrackingReports, setAllTrackingReports] = useState([]);
    const [arpNames, setArpNames] = useState({});
    const [ambulanceNames, setAmbulanceNames] = useState({});
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const fetchAccountInformation = async (accountId) => {
        try {
            const accountRef = doc(firestore, "AccountInformation", accountId);
            const accountSnapshot = await getDoc(accountRef);

            if (accountSnapshot.exists()) {
                const { firstName, lastName } = accountSnapshot.data();
                return `${firstName || "N/A"} ${lastName || "N/A"}`;
            } else {
                return "N/A";
            }
        } catch (error) {
            console.error("Error fetching account information:", error);
            return "N/A";
        }
    };

    const fetchAmbulanceInformation = async (ambulanceId) => {
        try {
            const ambulanceRef = doc(firestore, "AmbulanceInformation", ambulanceId);
            const ambulanceSnapshot = await getDoc(ambulanceRef);

            if (ambulanceSnapshot.exists()) {
                const { AmbulanceName } = ambulanceSnapshot.data();
                return AmbulanceName || "N/A";
            } else {
                return "N/A";
            }
        } catch (error) {
            console.error("Error fetching ambulance information:", error);
            return "N/A";
        }
    };

    const fetchArpNames = async (records) => {
        const namesMap = {};
        for (const record of records) {
            if (record.ARP_ID && !namesMap[record.ARP_ID]) {
                const arpName = await fetchAccountInformation(record.ARP_ID);
                namesMap[record.ARP_ID] = arpName;
            }
        }
        setArpNames(namesMap);
    };

    const fetchAmbulanceNames = async (records) => {
        const ambulanceMap = {};
        for (const record of records) {
            if (record.ambulanceId && !ambulanceMap[record.ambulanceId]) {
                const ambulanceName = await fetchAmbulanceInformation(record.ambulanceId);
                ambulanceMap[record.ambulanceId] = ambulanceName;
            }
        }
        setAmbulanceNames(ambulanceMap);
    };

    const handlePatientRealtimeUpdates = (data) => {
        if (data) {
            setAllTrackingReports(data);
            setFilteredAccounts(data); // Initialize filtered data
            fetchArpNames(data);
            fetchAmbulanceNames(data);
        }
    };

    const fetchAllPatientRecords = async () => {
        try {
            FetchTrackingReport(handlePatientRealtimeUpdates);
        } catch (error) {
            console.error("Error fetching patient data:", error);
        }
    };

    const handleFilterChange = () => {
        let filtered = [...allTrackingReports];
        if (statusFilter) {
            filtered = filtered.filter((report) => report.tracking_status === statusFilter);
        }
        if (searchTerm) {
            filtered = filtered.filter((report) =>
                arpNames[report.ARP_ID]?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredAccounts(filtered);
    };

    useEffect(() => {
        fetchAllPatientRecords();
    }, []);

    useEffect(() => {
        handleFilterChange();
    }, [searchTerm, statusFilter, allTrackingReports, arpNames]);


    const [selectedTrackingData, setSelectedTrackingData] = useState(null);
    const [coordinatesDetails, setCoordinatesDetails] = useState([]);

    const [ambulanceName, setAmbulanceName] = useState(null);
    const [arpName, setARPName] = useState(null);
    const [remarks, setRemarks] = useState(null);

    const [mapStatus, setMapStatus] = useState(false);

    useEffect(() => {
        const modal = document.getElementById("trackingModal");

        const handleModalHide = () => {
            setMapStatus(false); // Set mapStatus to false when the modal is hidden
        };

        if (modal) {
            modal.addEventListener("hide.bs.modal", handleModalHide);
        }

        // Cleanup listener on component unmount
        return () => {
            if (modal) {
                modal.removeEventListener("hide.bs.modal", handleModalHide);
            }
        };
    }, []);

    // Define a callback to handle real-time updates
    const handleRealtimeUpdates = (data) => {
        if (data) {
            console.log("Real-time data:", data);

            setSelectedTrackingData(data);
            setCoordinatesDetails(data.coordinates);
            setMapStatus(true);
        } else {
            console.log("No document found with the matching trackId.");
        }
    };

    const fetchTrackingData = async (trackId, ambulanceName, arpName, remarks) => {
        try {
            setRemarks(remarks)
            setAmbulanceName(ambulanceName)
            setARPName(arpName);
            const unsubscribe = SelectTrackInformation(trackId, handleRealtimeUpdates);
        } catch (error) {
            console.error("Error fetching tracking data:", error);
        }
    };

    const [locations, setLocations] = useState({}); // To store location names by coordinate index

    // Function to get the location name using latitude and longitude
    const getLocationName = (latitude, longitude, index) => {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.display_name) {
                    const location = data.display_name;
                    // Update the state with the location for the specific index
                    setLocations(prevState => ({
                        ...prevState,
                        [index]: location, // Store the location with the coordinate index
                    }));
                } else {
                    console.error("No location found for the coordinates.");
                }
            })
            .catch(error => console.error("Error: ", error));
    };

    // Use useEffect to call getLocationName for each coordinate when the data is available
    useEffect(() => {
        if (selectedTrackingData?.coordinates?.length) {
            selectedTrackingData.coordinates.forEach((coordinate, index) => {
                // Fetch the location for each coordinate if not already fetched
                if (!locations[index]) {
                    getLocationName(coordinate.latitude, coordinate.longitude, index);
                }
            });
        }
    }, [selectedTrackingData, locations]);

    const handleDelete = (collectionName, documentId) => {
        DeleteTrackingRecord(collectionName, documentId, () => {
            // Refresh the page after successful deletion
            window.location.reload();
        });
    };

    const handleUpdate = (trackingId, tracking_status) => {
        UpdateTrackingStatus(trackingId, tracking_status, () => {
            // Refresh the page after successful deletion
            window.location.reload();
        });
    };

    return (
        <main id="main" className="main">
            <div className="content">
                <h1>Tracking Report</h1>
                <nav>
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><a>Admin</a></li>
                        <li className="breadcrumb-item active">Tracking Report</li>
                    </ol>
                </nav>
            </div>
            <div className="h-screen flex-grow-1 overflow-y-lg-auto">
                <header className="bg-surface-primary border-bottom pt-6">
                    <div className="container-fluid">
                        <div className="row align-items-center">
                            <div className="col-sm-6 col-12 mb-4 mb-sm-0">
                                <h1 className="h2 mb-0 ls-tight"></h1>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="py-6 bg-surface-secondary">
                    <div className="container-fluid">
                        <div className="card shadow border-0 mb-7">
                            <div className="card-header">
                                <h5 className="mb-0">List of Tracking Reports</h5>
                            </div>
                            <div className="card-body">
                                <div className="row mb-3 justify-content-end">
                                    <div className="col-sm-3">
                                        <div className="input-group justify-content-end">
                                            <label>Filter:</label>
                                        </div>
                                    </div>
                                    <div className="col-sm-3">
                                        <select
                                            className="form-select"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="">All</option>
                                            <option value="Active">Active</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Did not Arrive">Did not Arrive</option>
                                        </select>
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
                                                <th>Ambulance Name</th>
                                                <th>Responder Name</th>
                                                <th>Track Started</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAccounts.length > 0 ? (
                                                filteredAccounts.map((record, index) => (
                                                    <tr key={record.trackingId}>
                                                        <td>{index + 1}</td>
                                                        <td>{ambulanceNames[record.ambulanceId] || "Loading..."}</td>
                                                        <td>{arpNames[record.ARP_ID] || "Loading..."}</td>
                                                        <td>
                                                            {record.SavedAt
                                                                ? new Date(record.SavedAt).toLocaleString("en-US", {
                                                                    month: "long",
                                                                    day: "2-digit",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                })
                                                                : "N/A"}
                                                        </td>
                                                        <td>{record.tracking_status || "N/A"}</td>
                                                        <td>
                                                            <button className="btn btn-success btn-sm"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#trackingModal"
                                                                onClick={() => {
                                                                    fetchTrackingData(record.trackingId, ambulanceNames[record.ambulanceId], arpNames[record.ARP_ID], "View");
                                                                }}>
                                                                <i className="fas fa-eye"></i> View
                                                            </button>
                                                            <button className="btn btn-primary btn-sm"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#trackingModal"
                                                                onClick={() => {
                                                                    fetchTrackingData(record.trackingId, ambulanceNames[record.ambulanceId], arpNames[record.ARP_ID], "Edit");
                                                                }}>
                                                                <i className="fas fa-edit"></i> Edit
                                                            </button>
                                                            <button className="btn btn-danger btn-sm"
                                                                onClick={() => {
                                                                    handleDelete("TrackingInformation", record.trackingId);
                                                                }}>
                                                                <i className="fas fa-trash"></i> Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center">
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
                </main>
            </div>

            <div className="modal fade" id="trackingModal" tabindex="-1" aria-labelledby="trackingModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">

                            {remarks == "View" &&
                                <h5 className="modal-title" id="trackingModalLabel"> View Tracking</h5>
                            }

                            {remarks == "Edit" &&
                                <h5 className="modal-title" id="trackingModalLabel"> Edit Tracking</h5>
                            }

                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="row" style={{ padding: '16px' }}>

                            <div className="col-md-12">
                                <div className="modal-body">
                                    {/* Displaying the map only when mapStatus is true */}
                                    {mapStatus && <StartMap coordinates={coordinatesDetails} />}
                                    <hr />
                                </div>
                            </div>

                            {remarks == "View" &&

                                <>
                                    <div className="col-md-6">
                                        <div className="modal-body">
                                            {/* Displaying selected tracking data */}
                                            {selectedTrackingData && (
                                                <>


                                                    <label style={{ color: 'black', marginTop: '10px' }} >Tracking Details:</label>
                                                    <hr />

                                                    <p style={{ color: 'black', marginBottom: '5px', marginTop: '10px' }}><b>Ambulance Personnel:</b> {arpName || "N/A"}</p>
                                                    <p style={{ color: 'black', marginBottom: '5px' }}><b>Ambulance Name:</b> {ambulanceName || "N/A"}</p>
                                                    <p style={{ color: 'black', marginBottom: '5px' }}><b>Tracking Status:</b> {selectedTrackingData.tracking_status || "N/A"}</p>
                                                    <p style={{ color: 'black', marginBottom: '5px' }}><b>Date Tracked:</b> {selectedTrackingData.SavedAt ? new Date(selectedTrackingData.SavedAt).toLocaleDateString() : "N/A"}</p>
                                                    <p style={{ color: 'black', marginBottom: '5px' }}><b>Time Tracked:</b> {selectedTrackingData.SavedAt ? new Date(selectedTrackingData.SavedAt).toLocaleTimeString() : "N/A"}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </>
                            }

                            {remarks == "Edit" &&

                                <>
                                    <div className="col-md-6">
                                        <div className="modal-body">
                                            <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} >Action:</label>

                                            {/* Displaying selected tracking data */}
                                            {selectedTrackingData && (
                                                <>
                                                    <div>
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            type="button"
                                                            onClick={() => handleUpdate(selectedTrackingData.trackingId, "Active")}
                                                        >
                                                            <i className="bx bx-map"></i> Active
                                                        </button>

                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            type="button"
                                                            style={{ marginLeft: '10px' }}
                                                            onClick={() => handleUpdate(selectedTrackingData.trackingId, "Completed")}
                                                        >
                                                            <i className="bx bx-map"></i> Completed
                                                        </button>

                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            style={{ marginLeft: '10px' }}
                                                            type="button"
                                                            onClick={() => handleUpdate(selectedTrackingData.trackingId, "Did not Arrive")}
                                                        >
                                                            <i className="bx bx-stop-circle"></i> Did not Arrive
                                                        </button>
                                                    </div>

                                                    <hr />

                                                    <label style={{ color: 'black', marginTop: '10px' }} >Tracking Details:</label>
                                                    <hr />

                                                    <label style={{ color: 'black', marginTop: '10px' }}><b>Ambulance Personnel:</b> {arpName || "N/A"}</label><br />
                                                    <label style={{ color: 'black', marginTop: '10px' }}><b>Ambulance Name:</b> {ambulanceName || "N/A"}</label><br />
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}><b>Tracking Status:</b> {selectedTrackingData.tracking_status || "N/A"}</label><br />
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}><b>Date Tracked:</b> {selectedTrackingData.SavedAt ? new Date(selectedTrackingData.SavedAt).toLocaleDateString() : "N/A"}</label><br />
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}><b>Time Tracked:</b> {selectedTrackingData.SavedAt ? new Date(selectedTrackingData.SavedAt).toLocaleTimeString() : "N/A"}</label><br />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </>
                            }



                            <div className="col-md-6">
                                <div className="modal-body">
                                    <label style={{ color: 'black', marginTop: '10px' }} >Breakdown of Tracking Details:</label>
                                    <hr />

                                    {selectedTrackingData?.coordinates && selectedTrackingData.coordinates.length > 0 && (
                                        <div className="additionalTrackingInfo">
                                            <div className="row">
                                                <div className="col-12">
                                                    <p><strong>Coordinates:</strong></p>
                                                    {selectedTrackingData.coordinates.map((coordinate, index) => (
                                                        <div className="trackingDetailsItem" key={index}>
                                                            <div className="row">
                                                                <div className="col-2 d-flex justify-content-center align-items-center">
                                                                    <div className="locationLogoContainer">
                                                                        <img src="../../../assets/img/location_logo.png" alt="Logo" className="locationLogo" />
                                                                    </div>
                                                                </div>

                                                                <div className="col-10">
                                                                    <p><strong>Timestamp: </strong>
                                                                        {coordinate.timestamp
                                                                            ? new Date(coordinate.timestamp).toLocaleString('en-US', {
                                                                                month: 'long', day: 'numeric', year: 'numeric',
                                                                                hour: 'numeric', minute: 'numeric', hour12: true
                                                                            })
                                                                            : "N/A"}
                                                                    </p>

                                                                    <p><strong>Latitude:</strong> {coordinate.latitude || "N/A"}</p>
                                                                    <p><strong>Longitude:</strong> {coordinate.longitude || "N/A"}</p>

                                                                    {/* Render location from the state */}
                                                                    <p><strong>Location Name:</strong> {locations[index] || "Loading..."}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}


                                </div>
                            </div>


                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            {/* <button type="button" className="btn btn-primary">Save changes</button> */}
                        </div>
                    </div>
                </div>
            </div >
        </main>
    );
}

export default ManageTrackingReportContent;
