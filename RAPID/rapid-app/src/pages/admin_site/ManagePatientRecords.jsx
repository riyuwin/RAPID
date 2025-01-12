import React, { useEffect, useState } from "react";
import NavBar from "../../components/admin_site/NavBar";
import Sidebar from "../../components/admin_site/Sidebar";
import ManagePatientRecordsContent from "../../components/admin_site/ManagePatientRecordsContent";
import { Routing } from "../routing/routing";

function ManagePatientRecords() {
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
                    <Sidebar />
                    <ManagePatientRecordsContent />
                </>
            ) : (
                <div>You do not have permission to view this page.</div>
            )}
        </>
    );

}

export default ManagePatientRecords;