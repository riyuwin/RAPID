import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
/* import '../../../../css/style.css'; */
import 'leaflet-routing-machine';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { useFetchCurrentUser } from './FetchCurrentUser';
import FetchActiveARP from './FetchActiveARP';
import FetchActiveTracking from './FetchActiveTracking';
import { handleUpdateLocation } from './UpdateLocation';
import { handleSaveTracking } from './SaveTracking';
import { useFetchARPAmbulance } from './FetchARPAmbulance';

function MapWithTracking({ page }) {
    const [map, setMap] = useState(null);
    const [tracking, setTracking] = useState(false);
    const [hasActiveTracking, setHasActiveTracking] = useState(false);
    const [startPoint, setStartPoint] = useState([14.0996, 122.9550]);  // Default start location
    const markerRef = useRef(null);

    const trackingInterval = useRef(null); // Persist interval across renders 

    const { accountId, currentUserloading } = useFetchCurrentUser(); // Get accountId from hook     
    const { ambulanceId, loading } = useFetchARPAmbulance(accountId);

    const [pageName, setPageName] = useState(null);

    const [activeTrackingData, setActiveTrackingData] = useState([]);
    const [trackingActiveDetails, setTrackingActiveDetails] = useState(false);

    useEffect(() => {
        if (page === "Dashboard" && !sessionStorage.getItem("reloaded")) {
            sessionStorage.setItem("reloaded", "true"); // Set flag
            window.location.reload(); // Force reload
        }

    }, []);

    const TrackingInitializer = async (user_accountId) => {
        const text_activeTrackingLabel = document.getElementById('activeTrackingLabel');
        const detailsTrackingData = await fetchData(user_accountId);

        if (detailsTrackingData?.activeTrackingData) {
            if (detailsTrackingData.activeTrackingData[0]?.SavedAt) {

                const savedAt = detailsTrackingData.activeTrackingData[0].SavedAt;
                const date = new Date(savedAt);

                // Format the date to "Month Day, Year"
                const formattedDate = date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "2-digit",
                    year: "numeric",
                });

                // Format the time to "hh:mm AM/PM"
                const formattedTime = date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                });

                // Update the label with both date and time
                text_activeTrackingLabel.textContent = `${formattedDate} at ${formattedTime}`;
            } else {
                text_activeTrackingLabel.textContent = "No active tracking";
            }
        } else {
            text_activeTrackingLabel.textContent = "No active tracking";
        }
    };


    useEffect(() => {
        if (accountId) {
            TrackingInitializer(accountId)
        }
    }, [accountId]);


    const fetchData = async (user_accountId) => {
        try {
            // Fetch the ARP ID first
            const arpId = await FetchActiveARP(user_accountId);

            if (arpId) {
                return new Promise((resolve) => {
                    const unsubscribe = FetchActiveTracking(arpId, (data) => {
                        setActiveTrackingData(data);

                        if (data && data.length > 0) {
                            resolve({ activeTrackingData: data });
                        } else {
                            resolve({ activeTrackingData: [] });
                        }
                    });
                });
            } else {
                console.log("No matching ARP ID found.");
                return { activeTrackingData: [] }; // Return an empty array if no ARP ID is found
            }
        } catch (error) {
            console.error("Error:", error.message);
            throw error; // Ensure the error is thrown and can be caught by the caller
        }
    };


    const startMap = () => {
        useEffect(() => {
            // Initialize the map
            const initMap = L.map('map', {
                center: startPoint,  // Center the map at the start location
                zoom: 13,
            });

            // Add OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(initMap);

            // Add marker at the starting location
            const startMarker = L.marker(startPoint).addTo(initMap)
                .bindPopup('Start Location')
                .openPopup();

            markerRef.current = startMarker;

            // Create routing control (two waypoints for start and destination) - Initially not added
            let control;

            if (tracking) {
                control = L.Routing.control({
                    waypoints: [
                        L.latLng(startPoint),  // Dynamic start point
                        L.latLng(14.092400955257917, 122.95721267269474),  // Destination point (adjust as needed)
                    ],
                    routeWhileDragging: true,
                    showAlternatives: true,
                }).addTo(initMap);
            }

            // Update map state
            setMap(initMap);

            // Clean up on unmount
            return () => {
                initMap.remove();
            };
        }, [tracking, startPoint]);
    }

    const startTracking = (user_accountId, start_cooridnates) => {
        const processTrackingData = async () => {
            try {
                // Fetch tracking data
                const detailsTrackingData = await fetchData(user_accountId);

                if (detailsTrackingData?.activeTrackingData?.length > 0) {
                    // Start tracking if data is available
                    startTrackingInterval(detailsTrackingData);

                    const text_activeTrackingLabel = document.getElementById('activeTrackingLabel');

                    // Ensure `SavedAt` exists in the tracking data
                    const savedAt = detailsTrackingData.activeTrackingData[0]?.SavedAt;
                    if (savedAt) {
                        const date = new Date(savedAt);

                        // Format the date to "Month Day, Year"
                        const formattedDate = date.toLocaleDateString("en-US", {
                            month: "long",
                            day: "2-digit",
                            year: "numeric",
                        });

                        // Format the time to "hh:mm AM/PM"
                        const formattedTime = date.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        });

                        // Update the label with both date and time
                        text_activeTrackingLabel.textContent = `${formattedDate} at ${formattedTime}`;
                    } else {
                        text_activeTrackingLabel.textContent = "Active Tracking: No data available";
                    }

                    return;
                }

                console.log("No tracking data available.");
                if (!user_accountId) {
                    console.log("Fetching data, please wait...");
                    return;
                }

                // Start new tracking if no active tracking data is found
                setTracking(true);

                const arpId = await FetchActiveARP(user_accountId);
                await handleSaveTracking(arpId, ambulanceId, start_cooridnates[1], start_cooridnates[0], accountId);

                console.log("Tracking saved successfully");

                // Fetch updated tracking data after saving
                const updatedTrackingData = await fetchData(user_accountId);
                startTrackingInterval(updatedTrackingData);

                // Show SweetAlert notification after tracking starts
                Swal.fire({
                    title: 'Tracking Started!',
                    text: 'You are now tracking your location.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
            } catch (error) {
                console.error("Error in tracking process:", error);
            }
        };

        processTrackingData();
    };


    const startTrackingInterval = (detailsTrackingData) => {
        if (!trackingInterval.current) {
            setTracking(true);

            trackingInterval.current = setInterval(() => {
                console.log("Tracking...");

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log("Current Location:", { latitude, longitude });

                        handleUpdateLocation(detailsTrackingData.activeTrackingData[0].trackingId, longitude, latitude, accountId, ambulanceId)
                            .then(() => console.log("Location updated successfully"))
                            .catch(error => console.error("Error updating location:", error));
                    },
                    (error) => {
                        console.error("Error fetching location:", error.message);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                    }
                );
            }, 10000);

            console.log("Tracking started.");
        }
    };

    const stopTracking = () => {
        if (trackingInterval.current) {
            clearInterval(trackingInterval.current); // Stop the interval
            trackingInterval.current = null; // Reset the interval reference

            setTracking(false); // Disable tracking state
            setHasActiveTracking(false);
            console.log("Tracking stopped.");
        } else {
            console.log("No active tracking interval to stop.");
        }
    };

    const handleLocationAndTracking = async () => {
        try {
            if (!ambulanceId) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error saving changes!',
                    text: "Please select an ambulance first.",
                    confirmButtonText: 'Okay',
                });
            } else {
                const newStartPoint = await getCurrentLocation();
                startTracking(accountId, newStartPoint);
            }

        } catch (error) {
            console.error("Error fetching location:", error.message);
        }
    };


    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const newStartPoint = [position.coords.latitude, position.coords.longitude];
                        setStartPoint(newStartPoint); // Update the start point with the user's location

                        if (markerRef.current) {
                            markerRef.current.setLatLng(newStartPoint); // Update marker position
                        }
                        resolve(newStartPoint); // Return the new start point through resolve
                    },
                    (error) => {
                        alert('Error getting location: ' + error.message);
                        reject(error); // Reject the promise if there's an error
                    }
                );
            } else {
                alert('Geolocation is not supported by this browser.');
                reject(new Error('Geolocation is not supported')); // Reject if geolocation is not supported
            }
        });
    };


    return (
        <>
            {page === "Location Tracking Report" && (
                <>
                    <div className="col-6">
                        <p>
                            Active Tracking: <br />
                            <b id="activeTrackingLabel"></b>
                        </p>
                    </div>

                    <div className="col-6">
                        <div className="d-flex justify-content-end">
                            {/* Start/Continue Tracking Button */}
                            <button
                                className="btn btn-sm btn-success"
                                onClick={handleLocationAndTracking} // Call the handler
                                disabled={tracking}
                            >
                                <i className="bx bx-map"></i>{' '}
                                {hasActiveTracking
                                    ? 'Continue Tracking'
                                    : tracking
                                        ? 'Tracking Started'
                                        : 'Start Tracking'}
                            </button>

                            {/* Stop Tracking Button */}
                            <button
                                className="btn btn-sm btn-danger"
                                style={{ marginLeft: '10px' }}
                                onClick={stopTracking}
                                disabled={!tracking}
                            >
                                <i className="bx bx-stop-circle"></i> Stop Tracking
                            </button>
                        </div>
                    </div>
                </>
            )}

            {page === "Dashboard" && (
                <>
                    <div className="col-12">
                        <p>
                            Active Tracking: <br />
                            <b id="activeTrackingLabel"></b>
                        </p>
                    </div>

                    <div className="col-12">
                        <hr />
                    </div>

                    <div className="col-12">
                        <div className="d-flex justify-content-center">
                            {/* Start/Continue Tracking Button */}
                            <button
                                className="btn btn-sm btn-success"
                                onClick={handleLocationAndTracking} // Call the handler
                                disabled={tracking}
                            >
                                <i className="bx bx-map"></i>{' '}
                                {hasActiveTracking
                                    ? 'Continue Tracking'
                                    : tracking
                                        ? 'Tracking Started'
                                        : 'Start Tracking'}
                            </button>

                            {/* Stop Tracking Button */}
                            <button
                                className="btn btn-sm btn-danger"
                                style={{ marginLeft: '10px' }}
                                onClick={stopTracking}
                                disabled={!tracking}
                            >
                                <i className="bx bx-stop-circle"></i> Stop Tracking
                            </button>
                        </div>
                    </div>
                </>
            )}

        </>
    );
}

export default MapWithTracking;
