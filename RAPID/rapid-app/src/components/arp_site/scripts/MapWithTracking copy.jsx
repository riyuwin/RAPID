import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../../../css/style.css';
import { firestore } from '../../../firebase/firebase';
import { addDoc, collection, getDocs, query, where, doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import FetchActiveARP from './FetchActiveARP';
import { useFetchCurrentUser } from './FetchCurrentUser';
import { useFetchARPAmbulance } from './FetchARPAmbulance';
import { useFetchActiveTracking } from './FetchActiveTracking'
import { handleSaveTracking } from './SaveTracking';
import { handleUpdateLocation } from './UpdateLocation';

function MapWithTracking() {
    const [map, setMap] = useState(null);
    const markerRef = useRef(null);
    const [tracking, setTracking] = useState(false);
    const [watchId, setWatchId] = useState(null);
    const [intervalId, setIntervalId] = useState(null);
    const positions = useRef([]); // Store positions for drawing the path
    const pathRef = useRef(null); // Reference for the polyline  

    const { accountId, currentUserloading } = useFetchCurrentUser(); // Get accountId from hook 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [arpId, setArpId] = useState(null);
    const { ambulanceId } = useFetchARPAmbulance(accountId);
    const { activeTrackingData, trackingloading, trackingerror } = useFetchActiveTracking(arpId);



    useEffect(() => {
        // Make sure the accountId is available before fetching
        if (accountId) {
            // Fetch the ARP ID using FetchActiveARP
            FetchActiveARP(accountId, (id, err) => {
                if (err) {
                    setError(err); // Set error if any
                } else {
                    setArpId(id); // Set the ARP document ID
                }
            });
        }
    }, [accountId]); // This will rerun whenever accountId changes   

    /* console.log(accountId, 'asf23')
    console.log(arpId, 'asf')
    console.log(ambulanceId, 'asf123')
    console.log(activeTrackingData, 'asf1234') */




    useEffect(() => {
        // Initialize the map
        const initMap = L.map('map', {
            center: [14.0996, 122.9550],
            zoom: 13,
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(initMap);

        // Add marker
        const marker = L.marker([14.0996, 122.9550]).addTo(initMap)
            .bindPopup('Default Location')
            .openPopup();

        markerRef.current = marker;
        setMap(initMap);

        // Clean up on unmount
        return () => {
            initMap.remove();
            if (intervalId) clearInterval(intervalId);
        };
    }, [intervalId]);

    const updateMarkerPosition = (lat, lng) => {
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng])
                .bindPopup(`Lat: ${lat}, Lng: ${lng}`)
                .openPopup();
            map.setView([lat, lng], map.getZoom());
        }
    };


    const handleStartTracking = async () => {
        const result = await Swal.fire({
            title: 'Start tracking your location?',
            text: "Once you've clicked 'Yes', your location will be tracked in real-time until you stop.",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, track it!',
        });

        if (result.isConfirmed) {
            const id = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    updateMarkerPosition(latitude, longitude); // Update marker position

                    // Add the new position to the positions array
                    positions.current.push([latitude, longitude]);

                    // Update the polyline on the map with the new path
                    if (pathRef.current) {
                        pathRef.current.setLatLngs(positions.current);
                    } else {
                        // Create the polyline if not already created
                        pathRef.current = L.polyline(positions.current, { color: 'blue' }).addTo(map);
                    }
                },
                (error) => {
                    console.error('Error fetching location:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: `Failed to track your location: ${error.message}`,
                    });
                },
                {
                    enableHighAccuracy: true,
                }
            );
            setWatchId(id);
            setTracking(true);

            // Log location every 30 seconds
            const interval = setInterval(() => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log(`Location logged: Lat: ${latitude}, Lng: ${longitude} as`);


                        /* console.log(activeTrackingData[0], 'hakdog1223'); */
                        console.log(activeTrackingData?.[0]?.tracking_status, 'sas');

                        if (activeTrackingData[0]?.tracking_status == "Active") {
                            console.log("HE")

                            const coordinates = activeTrackingData[0]?.coordinates || [];


                            // Check if there are coordinates to avoid empty array errors
                            if (coordinates.length > 0) {
                                // Find the index of the coordinate with the latest timestamp
                                const latestIndex = coordinates.reduce((latestIdx, currentCoord, idx, arr) => {
                                    const currentTimestamp = new Date(currentCoord.timestamp);
                                    const latestTimestamp = new Date(arr[latestIdx].timestamp);

                                    // Compare timestamps to find the latest one
                                    return currentTimestamp > latestTimestamp ? idx : latestIdx;
                                }, 0);  // Start by assuming the first element is the latest

                                // Output the index of the latest coordinate
                                console.log('Latest coordinate index:', latestIndex);

                                // Get the next index to avoid overwriting (increment by 1)
                                const nextIndex = latestIndex + 1;

                                // Log the next index (this will be the "next available slot")
                                console.log('Next index to add a coordinate:', nextIndex);

                                /* handleUpdateLocation(nextIndex, activeTrackingData[0].trackingId, longitude, latitude)
                                    .then(() => console.log("Tracking saved successfully"))
                                    .catch(error => console.error("Error:", error)); */

                            } else {
                                console.log('No coordinates available to check.');
                            }
                        } else if (activeTrackingData == "None") {
                            console.log("Walaa")
                            /* handleSaveTracking(arpId, ambulanceId, longitude, latitude)
                                .then(() => console.log("Tracking saved successfully"))
                                .catch(error => console.error("Error:", error)); */
                        } else {
                            console.log("Saving error...")
                        }


                    },
                    (error) => {
                        console.error('Error fetching location:', error);
                    },
                    {
                        enableHighAccuracy: true,
                    }
                );
            }, 5000); // 30 seconds
            setIntervalId(interval);
        }
    };

    const handleStopTracking = async () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
            setTracking(false);
        }

        if (intervalId !== null) {
            clearInterval(intervalId);
            setIntervalId(null);
        }

        await Swal.fire({
            icon: 'success',
            title: 'Tracking stopped!',
            text: 'Your real-time location tracking has been stopped.',
        });
    };

    return (
        <>
            <div className="row">
                <div className="col-12 "  >
                    <h5 className="card-title">Location Track Record</h5>
                </div>

                <div className="col-6"  >
                    <label >Active Tracking: </label>
                </div>

                <div className="col-6">
                    <div className="d-flex justify-content-end">
                        <button className="btn btn-sm btn-success">
                            <i className="bx bx-map"
                                onClick={handleStartTracking}
                                disabled={tracking}></i> Start Tracking
                        </button>
                        <button
                            className="btn btn-sm btn-danger"
                            style={{ marginLeft: '10px' }}
                            onClick={handleStopTracking}
                            disabled={!tracking}
                        >
                            <i className="bx bx-stop-circle"></i> Stop Tracking
                        </button>
                    </div>
                </div>
            </div>

        </>

    );
}

export default MapWithTracking;
