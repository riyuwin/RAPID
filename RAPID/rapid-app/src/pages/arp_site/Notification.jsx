import React, { useEffect, useState } from "react";
import LocationTrackingContent from "../../components/arp_site/LocationTrackingContent";
import NavBar from "../../components/arp_site/NavBar";
import Sidebar from "../../components/arp_site/Sidebar";
import { Routing } from "../routing/routing";
import NotificationContent from "../../components/arp_site/NotificationContent";


function ARP_Notification() {
    const [authorization, setAuthorization] = useState(false);

    useEffect(() => {
        setAuthorization(false); // Initially, assume not authorized
    }, []);

    return (

        <>
            <Routing pageAuth="AmbulancePersonnel" setAuthorization={setAuthorization} />

            <>
                <NavBar />
                <NotificationContent />
            </>
        </>

    );
}

export default ARP_Notification;