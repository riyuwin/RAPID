import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
/* import '../../../css/style.css';
import '../../../css/style3.css'; */


function MapContent() {
    useEffect(() => {
        // Create a map and set the view to the desired latitude and longitude
        const map = L.map('map').setView([14.0996, 122.9550], 13); // Updated coordinates

        // Add a tile layer (OpenStreetMap in this case)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add a marker to the map at the default coordinates
        L.marker([14.0996, 122.9550]).addTo(map)
            .bindPopup('Default Location')
            .openPopup();

        // Cleanup the map on component unmount
        return () => {
            map.remove();
        };
    }, []);

    return (
        <>
            <main id="main" className="main">
                <div className="content">
                    <h1>Map</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a href="/">Home</a>
                            </li>
                            <li className="breadcrumb-item active">Map</li>
                        </ol>
                    </nav>
                </div>
                <div className="h-screen flex-grow-1 overflow-y-lg-auto">
                    <header className="bg-surface-primary border-bottom pt-6">
                        <div className="container-fluid">
                            <div className="mb-npx">
                                <div className="row align-items-center">
                                    <div className="col-sm-6 col-12 mb-4 mb-sm-0">
                                        <h1 className="h2 mb-0 ls-tight"></h1>
                                    </div>
                                    <ul className="nav nav-tabs mt-4 overflow-x border-0"></ul>
                                </div>
                            </div>
                        </div>
                    </header>
                    <main className="py-6 bg-surface-secondary">
                        <div className="container-fluid">
                            <section className="section dashboard">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="row">
                                            <div className="col-xxl-12 col-md-12">
                                                <div className="card info-card sales-card">
                                                    <div className="card-body">
                                                        {/* Leaflet map */}
                                                        <div id="map" style={{ height: '700px', width: '100%' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </main>
        </>
    );
}

export default MapContent;
