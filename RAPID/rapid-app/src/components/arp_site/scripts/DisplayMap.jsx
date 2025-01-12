import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../../../css/style.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

export const DisplayMap = ({ coordinates }) => {
    const [showMap, setShowMap] = useState(true);
    const [startPoint, setStartPoint] = useState([14.0996, 122.9550]); // Default fallback location
    const [currentLocation, setCurrentLocation] = useState(null);
    const mapRef = useRef(null);
    const routingControlRef = useRef(null);
    const markersRef = useRef([]);

    const fetchCurrentLocation = async () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        resolve([latitude, longitude]);
                    },
                    (error) => {
                        console.error("Error fetching location:", error);
                        reject(error);
                    }
                );
            } else {
                console.error("Geolocation is not supported by this browser.");
                reject(new Error("Geolocation not supported"));
            }
        });
    };

    const getLocationName = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            return data.display_name || "Unknown Location";
        } catch (error) {
            console.error("Error fetching location:", error);
            return "Unknown Location";
        }
    };

    useEffect(() => {
        if (!showMap) return;

        const initializeMap = async () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }

            const initMap = L.map('map', {
                center: startPoint,
                zoom: 13,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(initMap);

            // Fetch current location
            let userLocation = startPoint;
            try {
                userLocation = await fetchCurrentLocation();
                setCurrentLocation(userLocation);
            } catch (error) {
                console.warn("Failed to fetch current location, using fallback.");
            }

            getLocationName(userLocation[0], userLocation[1])
                .then((resolvedValue) => {
                    const userLocationMarker = L.marker(userLocation)
                        .addTo(initMap)
                        .bindPopup(`Your Current Location: ${resolvedValue}`);
                    userLocationMarker.openPopup();
                })
                .catch((error) => {
                    console.error("Error resolving promise:", error);
                });

            // Initialize the routing control
            routingControlRef.current = L.Routing.control({
                waypoints: [L.latLng(userLocation), ...coordinates.map(coord => L.latLng(coord.latitude, coord.longitude))],
                routeWhileDragging: false,
                showAlternatives: false,
                lineOptions: { styles: [{ color: 'red', weight: 4 }] },
                createMarker: () => null, // Disable the default markers
            }).addTo(initMap);

            // Add markers for coordinates
            markersRef.current = [];
            for (const coord of coordinates) {
                const locationName = await getLocationName(coord.latitude, coord.longitude);
                const formattedTimestamp = coord.timestamp
                    ? new Date(coord.timestamp).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    }).replace(",", " at ")
                    : "N/A";

                const marker = L.marker([coord.latitude, coord.longitude])
                    .addTo(initMap)
                    .bindPopup(`
                        <b>Timestamp:</b> ${formattedTimestamp}<br/>
                        <b>Latitude:</b> ${coord.latitude}<br/>
                        <b>Longitude:</b> ${coord.longitude}<br/>
                        <b>Location:</b> ${locationName}
                    `);

                markersRef.current.push(marker);
            }

            mapRef.current = initMap;
        };

        initializeMap();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
    }, [showMap]);

    useEffect(() => {
        if (mapRef.current && routingControlRef.current) {
            // Update the route and markers when coordinates change
            routingControlRef.current.setWaypoints([L.latLng(currentLocation || startPoint), ...coordinates.map(coord => L.latLng(coord.latitude, coord.longitude))]);

            // Remove old markers and add new ones
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];

            coordinates.forEach(async (coord) => {
                const locationName = await getLocationName(coord.latitude, coord.longitude);
                const formattedTimestamp = coord.timestamp
                    ? new Date(coord.timestamp).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    }).replace(",", " at ")
                    : "N/A";

                const marker = L.marker([coord.latitude, coord.longitude])
                    .addTo(mapRef.current)
                    .bindPopup(`
                        <b>Timestamp:</b> ${formattedTimestamp}<br/>
                        <b>Latitude:</b> ${coord.latitude}<br/>
                        <b>Longitude:</b> ${coord.longitude}<br/>
                        <b>Location:</b> ${locationName}
                    `);

                markersRef.current.push(marker);
            });
        }
    }, [coordinates, currentLocation]);

    return (
        <div className="col-md-12">
            {showMap && <div id="map" style={{ height: '500px', width: '100%' }}></div>}
        </div>
    );
};
