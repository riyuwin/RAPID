import React, { useEffect, useState } from "react";
import LocationTrackingContent from "../../components/arp_site/LocationTrackingContent";
import NavBar from "../../components/arp_site/NavBar";
import Sidebar from "../../components/arp_site/Sidebar";
import { Routing } from "../routing/routing";


function LocationTracking() {
    const [authorization, setAuthorization] = useState(false);

    useEffect(() => {
        setAuthorization(false); // Initially, assume not authorized
    }, []);

    return (

        <>
            <Routing pageAuth="AmbulancePersonnel" setAuthorization={setAuthorization} />

            {authorization ? (
                <>
                    <NavBar />
                    <LocationTrackingContent />
                </>
            ) : (
                <div>You do not have permission to view this page.</div>
            )}
        </>

    );
}

export default LocationTracking;