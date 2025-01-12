import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../../../css/style.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'; // Ensure CSS for routing

export const StartMap = ({ coordinates }) => {
    const [map, setMap] = useState(null);
    const [showMap, setShowMap] = useState(false); // Control when to show the map
    const [startPoint, setStartPoint] = useState([14.0996, 122.9550]); // Default start location

    const getLocationName = async (latitude, longitude) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await response.json();
            return data.display_name || "Unknown Location";
        } catch (error) {
            console.error("Error fetching location:", error);
            return "Unknown Location";
        }
    };

    useEffect(() => {
        // Only initialize the map when the modal is opened
        if (!showMap) return;

        const initializeMap = async () => {
            // Remove previous map instance if exists
            if (map) {
                map.remove();
            }

            // Initialize the map
            const initMap = L.map('map', {
                center: startPoint, // Center the map at the start location
                zoom: 13,
            });

            // Add OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(initMap);

            // Add markers and connect routes between points if coordinates are provided
            if (coordinates && coordinates.length > 1) {
                const routeControl = L.Routing.control({
                    waypoints: coordinates.map(coord => L.latLng(coord.latitude, coord.longitude)),
                    routeWhileDragging: false, // Disable dragging
                    showAlternatives: false, // Do not show alternative routes
                    lineOptions: { styles: [{ color: 'red', weight: 4 }] }, // Red line for routes
                    createMarker: () => null, // Do not show default markers
                    router: L.Routing.osrmv1({
                        serviceUrl: 'https://router.project-osrm.org/route/v1', // OSRM server for routing
                    }),
                    show: true, // Show the instruction panel
                    formatter: new L.Routing.Formatter({ units: 'metric', round: true, itineraryFormatter: () => '' }),
                }).addTo(initMap);

                // Add markers for each coordinate point
                for (const coord of coordinates) {
                    const formattedTimestamp = coord.timestamp
                        ? new Date(coord.timestamp).toLocaleString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                        }).replace(",", " at ")
                        : "N/A";

                    // Fetch the location name based on the coordinates
                    const locationName = await getLocationName(coord.latitude, coord.longitude);

                    L.marker([coord.latitude, coord.longitude])
                        .addTo(initMap)
                        .bindPopup(`
                            <b>Timestamp:</b> ${formattedTimestamp}<br/>
                            <b>Latitude:</b> ${coord.latitude}<br/>
                            <b>Longitude:</b> ${coord.longitude}<br/>
                            <b>Location:</b> ${locationName}
                        `);
                }
            }

            // Update map state
            setMap(initMap);
        };

        initializeMap();

        // Clean up on unmount or when the coordinates change
        return () => {
            if (map) map.remove();
        };
    }, [showMap, coordinates]); // Re-run the effect when coordinates change

    return (
        <>
            <div className="col-md-12">
                <div className="modal-body d-flex justify-content-center align-items-center">
                    {!showMap && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowMap(true)}
                        >
                            Show Map
                        </button>
                    )}
                </div>

                {showMap && <div id="map" style={{ height: '500px', width: '100%' }}></div>}
            </div>
        </>
    );
};
