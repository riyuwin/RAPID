import React, { useEffect, useState } from "react";
import NavBar from "../../components/admin_site/NavBar";
import Sidebar from "../../components/admin_site/Sidebar";
import MapContent from "../../components/admin_site/MapContent";
import { Routing } from "../routing/routing";


function Map() {
    const [authorization, setAuthorization] = useState(false);

    useEffect(() => {
        setAuthorization(false); // Initially, assume not authorized
    }, []);

    return (

        <>
            {/* <Routing pageAuth="Admin" setAuthorization={setAuthorization} /> */}

            <>
                <NavBar />
                <Sidebar />
                <MapContent />
            </>

        </>

    );

}

export default Map;