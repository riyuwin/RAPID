import { useState, useEffect, useRef } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase";
import L from 'leaflet';
import MapWithTracking from "./MapWithTracking";
import SelectTrackInformation from "./SelectTrackInfromation";
import { StartMap } from "./StartMap";
import { UpdateTrackingStatus } from "./UpdateTrackingStatus";
import DeleteTrackingRecord from "./DeleteTrackingRecord";

export function useFetchTrackingInformation(currentUid) {
    const [trackingDetails, setTrackingDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUid) {
            setError("Current UID is not provided");
            setLoading(false);
            return;
        }

        const accountsRef = collection(firestore, "TrackingInformation");
        const q = query(accountsRef, where("ARP_ID", "==", currentUid));

        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                if (!querySnapshot.empty) {
                    const ambulanceList = querySnapshot.docs.map((doc) => doc.data());
                    setTrackingDetails(ambulanceList);
                    setError(null); // Clear error if previously set
                } else {
                    setTrackingDetails([]);
                    setError("No accounts found with the matching accountId.");
                }
                setLoading(false);
            },
            (error) => {
                setError(`Error fetching account details: ${error.message}`);
                setLoading(false);
            }
        );

        return () => {
            unsubscribe(); // Cleanup subscription on unmount
        };
    }, [currentUid]);

    return {
        trackingDetails,
        loading,
        error,
    };
}


function TrackingTable({ currentUid }) {
    const { trackingDetails, loading, error } = useFetchTrackingInformation(currentUid);
    const [selectedTrackingData, setSelectedTrackingData] = useState(null);
    const [coordinatesDetails, setCoordinatesDetails] = useState([]);

    const [mapStatus, setMapStatus] = useState(false);

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

    const fetchTrackingData = async (trackId) => {
        try {
            const unsubscribe = SelectTrackInformation(trackId, handleRealtimeUpdates);
        } catch (error) {
            console.error("Error fetching tracking data:", error);
        }
    };

    // Hook to handle modal show and hide events
    useEffect(() => {
        const modalElement = document.getElementById('trackingModal');

        // When the modal is shown, set mapStatus to true
        const onModalShown = () => {
            setMapStatus(true);
        };

        // When the modal is hidden, set mapStatus to false
        const onModalHidden = () => {
            setMapStatus(false);
        };

        modalElement.addEventListener('shown.bs.modal', onModalShown);
        modalElement.addEventListener('hidden.bs.modal', onModalHidden);

        // Cleanup event listeners when the component is unmounted
        return () => {
            modalElement.removeEventListener('shown.bs.modal', onModalShown);
            modalElement.removeEventListener('hidden.bs.modal', onModalHidden);
        };
    }, []);


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


    // Filtering

    const [filteredAccounts, setFilteredAccounts] = useState(trackingDetails);

    const handleStatusFilter = (event) => {
        const selectedStatus = event.target.value;

        // If "All" is selected, reset to show all accounts
        if (!selectedStatus) {
            setFilteredAccounts(trackingDetails);
            return;
        }

        // Filter accounts based on the selected status
        const filtered = trackingDetails.filter(account => {
            console.log(account.tracking_status, 'janjanaaa'); // Log the status for debugging
            return account.tracking_status === selectedStatus; // Ensure the function returns a boolean
        });

        setFilteredAccounts(filtered);
    };


    // Update filteredAccounts when patientList changes
    useEffect(() => {
        if (trackingDetails.length > 0) {
            setFilteredAccounts(trackingDetails);
        }
    }, [trackingDetails]);

    return (
        <>
            <div className="col-lg-12">
                <div className="row">
                    <div className="col-xxl-12 col-md-12">
                        <div className="card info-card sales-card">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-12">
                                        <h5 className="card-title">Location Track Record</h5>
                                    </div>

                                    <MapWithTracking page={"Location Tracking Report"} />
                                </div>

                                <br />

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
                                                <option value="Did not Arrive">Did not Arrive</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Table Section */}
                                <div className="table-responsive">
                                    <table className="table datatable table-custom">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Date Tracked</th>
                                                <th>Time Tracked</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="5" className="text-center">
                                                        Loading patient data...
                                                    </td>
                                                </tr>
                                            ) : filteredAccounts.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="text-center">
                                                        No patient records found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                [...filteredAccounts] // Use the filtered array here
                                                    .sort((a, b) =>
                                                        a.tracking_status === "Active" ? -1 : b.tracking_status === "Active" ? 1 : 0
                                                    )
                                                    .map((tracking, index) => (
                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>
                                                                {tracking.SavedAt
                                                                    ? new Date(tracking.SavedAt).toLocaleString("en-US", {
                                                                        month: "long",
                                                                        day: "numeric",
                                                                        year: "numeric",
                                                                    }).replace(",", ",")
                                                                    : "N/A"}
                                                            </td>
                                                            <td>
                                                                {tracking.SavedAt
                                                                    ? new Date(tracking.SavedAt).toLocaleString("en-US", {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        hour12: true,
                                                                    }).replace(",", " at")
                                                                    : "N/A"}
                                                            </td>
                                                            <td>{tracking.tracking_status || "Pending"}</td>
                                                            <td>
                                                                {/* <button
                                                                    className="btn btn-success btn-sm"
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#trackingModal"
                                                                >
                                                                    <i className="fas fa-eye"></i> View
                                                                </button> */}

                                                                <button
                                                                    className="btn btn-primary btn-sm"
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#trackingModal"
                                                                    onClick={() => {
                                                                        fetchTrackingData(tracking.trackingId);
                                                                    }}
                                                                >
                                                                    <i className="fas fa-edit"></i> Edit
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleDelete("TrackingInformation", tracking.trackingId);
                                                                    }}
                                                                >
                                                                    <i className="fas fa-trash"></i> Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                            )}
                                        </tbody>

                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="modal fade" id="trackingModal" tabindex="-1" aria-labelledby="trackingModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="trackingModalLabel"> Edit Tracking</h5>
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

                                            <label style={{ color: 'black', marginTop: '10px' }} >Details:</label>
                                            <hr />

                                            <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}><b>Tracking Status:</b> {selectedTrackingData.tracking_status || "N/A"}</label><br />
                                            <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}><b>Date Tracked:</b> {selectedTrackingData.SavedAt ? new Date(selectedTrackingData.SavedAt).toLocaleDateString() : "N/A"}</label><br />
                                            <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}><b>Time Tracked:</b> {selectedTrackingData.SavedAt ? new Date(selectedTrackingData.SavedAt).toLocaleTimeString() : "N/A"}</label><br />
                                            <label style={{ color: 'black', marginTop: '10px' }}><b>Ambulance Name:</b> {selectedTrackingData.ambulanceName || "N/A"}</label>
                                        </>
                                    )}
                                </div>
                            </div>

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
        </>
    );
}

export default TrackingTable;
