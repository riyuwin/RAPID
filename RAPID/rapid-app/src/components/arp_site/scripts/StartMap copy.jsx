import React, { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Import marker images manually
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

export const StartMap = ({ coordinates }) => {
    const [map, setMap] = useState(null);
    const [routingControl, setRoutingControl] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const startPoint = [14.0996, 122.9550]; // Default start location

    // Define a custom marker icon
    const customMarker = L.icon({
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
        iconSize: [25, 41], // Default Leaflet icon size
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    useEffect(() => {
        if (!showMap) return;

        const initializeMap = async () => {
            if (map) {
                map.remove();
            }

            const initMap = L.map("map", {
                center: startPoint,
                zoom: 13,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(initMap);

            if (coordinates && coordinates.length > 1) {
                const waypoints = coordinates.map((coord) =>
                    L.latLng(coord.latitude, coord.longitude)
                );

                const routeControl = L.Routing.control({
                    waypoints: waypoints,
                    routeWhileDragging: false,
                    showAlternatives: false,
                    lineOptions: { styles: [{ color: "red", weight: 5 }] }, // Red route line
                    createMarker: (i, waypoint) => {
                        return L.marker(waypoint.latLng, { icon: customMarker });
                    },
                    router: L.Routing.osrmv1({
                        serviceUrl: "https://router.project-osrm.org/route/v1",
                    }),
                }).addTo(initMap);

                setRoutingControl(routeControl);
            }

            setMap(initMap);
        };

        initializeMap();

        return () => {
            if (map) map.remove();
            if (routingControl) routingControl.remove();
        };
    }, [showMap, coordinates]);

    return (
        <>
            <div className="col-md-12">
                <div className="modal-body d-flex justify-content-center align-items-center">
                    {!showMap && (
                        <button className="btn btn-primary" onClick={() => setShowMap(true)}>
                            Show Map
                        </button>
                    )}
                </div>

                {showMap && <div id="map" style={{ height: "500px", width: "100%" }}></div>}
            </div>
        </>
    );
};
