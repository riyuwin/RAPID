import React, { useEffect, useState } from "react";
import ManageAmbulanceContent from "../../components/admin_site/ManageAmbulanceContent";
import NavBar from "../../components/admin_site/NavBar";
import { Routing } from "../routing/routing";


function ManageAmbulance() {
    const [authorization, setAuthorization] = useState(false);

    useEffect(() => {
        setAuthorization(false); // Initially, assume not authorized
    }, []);

    return (

        <>
            <Routing pageAuth="Admin" setAuthorization={setAuthorization} />

            {authorization ? (
                <>
                    <NavBar />
                    <ManageAmbulanceContent />
                </>
            ) : (
                <div>You do not have permission to view this page.</div>
            )}
        </>

    );

}

export default ManageAmbulance;