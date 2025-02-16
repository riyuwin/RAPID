import NavBar from "../../components/arp_site/NavBar";
import UserDetailsContent from "../../components/admin_site/UserDetailsContent";
import React, { useEffect, useState } from "react";
import { Routing } from "../routing/routing";
import ProfileContent from "../../components/arp_site/ProfileContent";

function ARP_Profile() {
    const [authorization, setAuthorization] = useState(false);

    useEffect(() => {
        setAuthorization(false); // Initially, assume not authorized
    }, []);

    return (

        <>
            <Routing pageAuth="AmbulancePersonnel" setAuthorization={setAuthorization} />

            <>
                <NavBar />
                <ProfileContent />
            </>

        </>

    );

}

export default ARP_Profile