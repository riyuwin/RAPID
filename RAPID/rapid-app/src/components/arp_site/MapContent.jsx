import React, { useState, useEffect, useRef } from 'react';
/* import '../../../css/style.css'; */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function MapContent() {
    const [map, setMap] = useState(null);
    const markerRef = useRef(null);

    useEffect(() => {
        const initMap = L.map('map', {
            center: [14.0996, 122.9550],
            zoom: 13,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(initMap);

        const marker = L.marker([14.0996, 122.9550]).addTo(initMap)
            .bindPopup('Default Location')
            .openPopup();

        markerRef.current = marker;
        setMap(initMap);

        return () => {
            initMap.remove();
        };
    }, []);

    const updateMarkerPosition = (lat, lng) => {
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng])
                .bindPopup(`Lat: ${lat}, Lng: ${lng}`)
                .openPopup();
            map.setView([lat, lng], map.getZoom());
        }
    };

    return (
        <div id="map" style={{ height: '300px', width: '100%' }}></div>
    );
}

export default MapContent;
