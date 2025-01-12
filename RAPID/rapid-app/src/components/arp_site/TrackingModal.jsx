import { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import L from 'leaflet';
import MapWithTracking from "./scripts/MapWithTracking";
import SelectTrackInformation from "./scripts/SelectTrackInfromation";
import { StartMap } from "./scripts/StartMap";
import { UpdateTrackingStatus } from "./scripts/UpdateTrackingStatus";
import DeleteTrackingRecord from "./scripts/DeleteTrackingRecord";


function TrackingModal({ trackId, onReturnValue, trackingStatus }) {

    const [selectedTrackingData, setSelectedTrackingData] = useState(null);
    const [coordinatesDetails, setCoordinatesDetails] = useState([]);

    const [mapStatus, setMapStatus] = useState(false);

    const fetchTrackingData = async (trackId) => {
        try {
            const data = await SelectTrackInformation(trackId);
            setSelectedTrackingData(data);
            setCoordinatesDetails(data.coordinates); // This updates the coordinates and triggers the map refresh
            setMapStatus(true); // Set mapStatus to true when data is fetched 
        } catch (error) {
            console.error("Error fetching tracking data:", error);
        }
    };

    useEffect(() => {
        const modalElement = document.getElementById('trackingModal');

        const onModalShown = () => {
            setMapStatus(true); // Enable the map
            fetchTrackingData(trackId); // Fetch data only when modal is shown
            console.log("opeeen")
        };

        const onModalHidden = () => {
            setMapStatus(false); // Disable the map
            setSelectedTrackingData(null); // Clear tracking data when modal is hidden
            setCoordinatesDetails([]); // Clear coordinates 

            console.log("Clooose")

            onReturnValue(false);;
        };



        modalElement.addEventListener('shown.bs.modal', onModalShown);
        modalElement.addEventListener('hidden.bs.modal', onModalHidden);

        return () => {
            modalElement.removeEventListener('shown.bs.modal', onModalShown);
            modalElement.removeEventListener('hidden.bs.modal', onModalHidden);
        };
    }, [trackId]);


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


    /* if (trackingStatus == true) {
        console.log("Heeees")
        fetchTrackingData(trackId);
        onModalShown();
    } */

    return (
        <>

            <a
                className="btn btn-primary btn-sm"
                type="button"
                data-bs-toggle="modal"
                data-bs-target="#trackingModal"
                onClick={() => fetchTrackingData(trackId)}
            >
                <i className="bx bx-edit-alt"></i> View
            </a>

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
                                                    onClick={() => handleUpdate(selectedTrackingData.trackingId, "Arrived at the Hospital")}
                                                >
                                                    <i className="bx bx-map"></i> Arrived at the Hospital
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    style={{ marginLeft: '10px' }}
                                                    type="button"
                                                    onClick={() => handleUpdate(selectedTrackingData.trackingId, "Accident")}
                                                >
                                                    <i className="bx bx-stop-circle"></i> Accident
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
                                    <label style={{ color: 'black', marginTop: '10px' }} >Summary of Tracking Details:</label>
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

export default TrackingModal;
