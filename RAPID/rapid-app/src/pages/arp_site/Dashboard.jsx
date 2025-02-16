import React, { useEffect, useState } from "react";
import ARP_DashboardContent from "../../components/arp_site/ARP_DashboardContent";
import NavBar from "../../components/arp_site/NavBar";
import Sidebar from "../../components/arp_site/Sidebar";
import { Routing } from "../routing/routing";

function ARP_Dashboard() {
    const [authorization, setAuthorization] = useState(false);

    useEffect(() => {
        setAuthorization(false); // Initially, assume not authorized
    }, []);

    return (

        <>
            <Routing pageAuth="AmbulancePersonnel" setAuthorization={setAuthorization} />

            <>
                <NavBar />
                <ARP_DashboardContent />
            </>
        </>

    );

}

export default ARP_Dashboard;