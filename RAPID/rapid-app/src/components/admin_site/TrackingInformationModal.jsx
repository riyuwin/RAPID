import { useState, useEffect, useRef } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import L from 'leaflet';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Modal } from "bootstrap";
import { firestore } from "../../firebase/firebase";
import SelectTrackInformation from "../arp_site/scripts/SelectTrackInfromation";
import { StartMap } from "../arp_site/scripts/StartMap";
import { UpdateTrackingStatus } from "../arp_site/scripts/UpdateTrackingStatus";
import DeleteTrackingRecord from "../arp_site/scripts/DeleteTrackingRecord";
import { useFetchCurrentUser } from "../arp_site/scripts/FetchCurrentUser";
import { handleUpdateMessage } from "../arp_site/scripts/UpdateMessage";

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
        const q = query(accountsRef, where("trackingId", "==", currentUid));

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


function ViewTrackingInformationModal({ currentUid, ambulanceName }) {
    const { trackingDetails, loading, error } = useFetchTrackingInformation(currentUid);
    const [selectedTrackingData, setSelectedTrackingData] = useState(null);
    const [coordinatesDetails, setCoordinatesDetails] = useState([]);

    const [mapStatus, setMapStatus] = useState(false);
    const { accountId, currentUserloading } = useFetchCurrentUser();
    const [trackingButtons, setTrackingButtons] = useState("Breakdown of Location Tracking");


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

    const onModalShown = () => {
        setMapStatus(true);

        // Get modal element and initialize Bootstrap modal
        const modalElement = document.getElementById("viewTrackingModal");
        const modal = new Modal(modalElement);
        modal.show();

        // Listen for when the modal is hidden
        modalElement.addEventListener("hidden.bs.modal", () => {
            setMapStatus(false);
        });
    };

    const handleHideTrackingInformation = () => {
        const modalElement = document.getElementById("viewTrackingModal");
        if (modalElement) {
            const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
            modal.hide();

            setTimeout(() => {
                // 🔥 Force remove any existing backdrops
                document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());

                // 🔥 Reset body styles
                document.body.classList.remove("modal-open");
                document.body.style.overflow = "auto";
                document.body.style.paddingRight = "0px"; // Fix Bootstrap scrollbar issue
            }, 300);
        } else {
            console.error("Modal element not found!");
        }
    };

    const fetchTrackingData = async (trackId) => {
        try {
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

    const handleUpdate = (trackingId, tracking_status, accountId) => {
        UpdateTrackingStatus(trackingId, tracking_status, accountId, () => {
            // Refresh the page after successful deletion
            window.location.reload();
        });
    };

    useEffect(() => {
        fetchTrackingData(currentUid)
    }, [currentUid]);


    const handleSendMessage = (trackingId, user_membership, accountId, ambulanceId) => {
        const messageInput = document.getElementById("messageInput").value;

        handleUpdateMessage(trackingId, user_membership, messageInput, accountId, ambulanceId)
    };

    const handleTrackingButtons = (trackingButtons) => {
        setTrackingButtons(trackingButtons);
    };
    return (
        <>

            <div className="modal fade" id="viewTrackingModal" tabindex="-1" aria-labelledby="trackingModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="trackingModalLabel"> Edit Tracking</h5>
                            <button type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                onClick={handleHideTrackingInformation}>
                            </button>
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
                                                    onClick={() => handleUpdate(selectedTrackingData.trackingId, "Active", accountId)}
                                                >
                                                    <i className="bx bx-map"></i> Active
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-success"
                                                    type="button"
                                                    style={{ marginLeft: '10px' }}
                                                    onClick={() => handleUpdate(selectedTrackingData.trackingId, "Completed", accountId)}
                                                >
                                                    <i className="bx bx-map"></i> Completed
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    style={{ marginLeft: '10px' }}
                                                    type="button"
                                                    onClick={() => handleUpdate(selectedTrackingData.trackingId, "Did not Arrive", accountId)}
                                                >
                                                    <i className="bx bx-stop-circle"></i> Did not Arrive
                                                </button>
                                            </div>

                                            <hr />

                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="modal-body">

                                    {/* Displaying selected tracking data */}
                                    {selectedTrackingData && (
                                        <>
                                            <label style={{ color: 'black', marginTop: '10px' }} >Details:</label>
                                            <hr />

                                            <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}><b>Tracking Status:</b> {selectedTrackingData.tracking_status || "N/A"}</label><br />
                                            <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}><b>Date Tracked:</b> {selectedTrackingData.SavedAt ? new Date(selectedTrackingData.SavedAt).toLocaleDateString() : "N/A"}</label><br />
                                            <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}><b>Time Tracked:</b> {selectedTrackingData.SavedAt ? new Date(selectedTrackingData.SavedAt).toLocaleTimeString() : "N/A"}</label><br />
                                            <label style={{ color: 'black', marginTop: '10px' }}><b>Ambulance Name:</b> {ambulanceName || "N/A"}</label>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-12">
                                <div className="modal-body">

                                    <hr />

                                    <button
                                        className={`btn btn-link ${trackingButtons === "Breakdown of Location Tracking" ? "active" : ""}`}
                                        style={{ marginRight: '10px' }}
                                        onClick={() => handleTrackingButtons("Breakdown of Location Tracking")}
                                    >
                                        Breakdown of Location Tracking
                                    </button>

                                    <button
                                        className={`btn btn-link ${trackingButtons === "Messages" ? "active" : ""}`}
                                        style={{ marginRight: '10px' }}
                                        onClick={() => handleTrackingButtons("Messages")}
                                    >
                                        Messages
                                    </button>


                                    <hr />

                                    <label style={{ color: 'black', marginTop: '10px' }} >Breakdown of Tracking Details:</label>
                                    <hr />

                                    <div className="trackingButtonsContainer">

                                        {trackingButtons === "Breakdown of Location Tracking" &&
                                            <>
                                                <label style={{ color: 'black', marginTop: '10px' }} >Breakdown of Tracking Details:</label>
                                                <br /><br />

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
                                            </>
                                        }


                                        {trackingButtons === "Messages" && (
                                            <>
                                                <label style={{ color: 'black', marginTop: '10px' }}>Messages:</label>
                                                <br /><br />

                                                <div className="additionalTrackingInfo">
                                                    <div className="row">
                                                        {selectedTrackingData?.coordinates && selectedTrackingData.coordinates.length > 0 ? (
                                                            <>
                                                                {/* Message Input Box */}
                                                                <div className="col-12">
                                                                    <div className="trackingDetailsItem">
                                                                        <div className="row">
                                                                            <div className="col-10">
                                                                                <input
                                                                                    id="messageInput"
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                    placeholder="Enter your message"
                                                                                />
                                                                            </div>
                                                                            <div className="col-2">
                                                                                <button
                                                                                    className="btn btn-sm btn-primary"
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        handleSendMessage(
                                                                                            selectedTrackingData?.trackingId,
                                                                                            "Admin",
                                                                                            accountId,
                                                                                            selectedTrackingData?.ambulanceId
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <i className="bx bx-send"></i> Send Message
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Check if messages exist before sorting & mapping */}
                                                                {Array.isArray(selectedTrackingData?.messages) &&
                                                                    selectedTrackingData.messages.length > 0 ? (
                                                                    selectedTrackingData.messages
                                                                        .slice() // Prevent modifying original array
                                                                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Oldest to latest
                                                                        .map((data, index) => (
                                                                            <div className="col-12" key={index}>
                                                                                <div className="trackingDetailsItem">
                                                                                    <div className="row">
                                                                                        <div className="col-12">
                                                                                            {data.user_membership === "Admin" ? (
                                                                                                <div className="row">
                                                                                                    <div className="col-4"></div>
                                                                                                    <div className="col-8 receiverMessageContainer">
                                                                                                        <p>Admin: {data.messages}</p>
                                                                                                        <p className="receiver_timestamp">
                                                                                                            {data.timestamp
                                                                                                                ? new Date(data.timestamp).toLocaleString('en-US', {
                                                                                                                    month: 'long',
                                                                                                                    day: 'numeric',
                                                                                                                    year: 'numeric',
                                                                                                                    hour: 'numeric',
                                                                                                                    minute: 'numeric',
                                                                                                                    hour12: true,
                                                                                                                })
                                                                                                                : "N/A"}
                                                                                                        </p>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="row">
                                                                                                    <div className="col-8 senderMessageContainer">
                                                                                                        <p>{data.messages}</p>
                                                                                                        <p className="sender_timestamp">
                                                                                                            {data.timestamp
                                                                                                                ? new Date(data.timestamp).toLocaleString('en-US', {
                                                                                                                    month: 'long',
                                                                                                                    day: 'numeric',
                                                                                                                    year: 'numeric',
                                                                                                                    hour: 'numeric',
                                                                                                                    minute: 'numeric',
                                                                                                                    hour12: true,
                                                                                                                })
                                                                                                                : "N/A"}
                                                                                                        </p>
                                                                                                    </div>
                                                                                                    <div className="col-4"></div>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                ) : (
                                                                    // Fallback when there are no messages
                                                                    <div className="col-12 text-center">
                                                                        <p style={{ color: 'gray' }}>No messages available</p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            // Fallback when coordinates are not available
                                                            <div className="col-12 text-center">
                                                                <p style={{ color: 'gray' }}>Tracking data not available</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                    </div>


                                </div>
                            </div>

                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal"
                                onClick={handleHideTrackingInformation}>Close</button>
                            {/* <button type="button" className="btn btn-primary">Save changes</button> */}
                        </div>
                    </div>
                </div>
            </div >

        </>
    );
}

export default ViewTrackingInformationModal;
