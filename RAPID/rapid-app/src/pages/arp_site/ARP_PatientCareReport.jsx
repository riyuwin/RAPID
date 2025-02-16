import React, { useEffect, useState } from "react";
import ARP_PatientCareReportContent from "../../components/arp_site/ARP_PatientCareReportContent";
import NavBar from "../../components/arp_site/NavBar";
import PatientCareReportContent from "../../components/arp_site/PatientCareReportContent";
import Sidebar from "../../components/arp_site/Sidebar";
import { Routing } from "../routing/routing";


function ARP_PatientCareReport() {
    const [authorization, setAuthorization] = useState(false);

    useEffect(() => {
        setAuthorization(false); // Initially, assume not authorized
    }, []);

    return (

        <>
            <Routing pageAuth="AmbulancePersonnel" setAuthorization={setAuthorization} />

            <>
                <NavBar />
                <PatientCareReportContent />
            </>

        </>

    );
}

export default ARP_PatientCareReport;