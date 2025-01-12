import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../../components/admin_site/NavBar";
import Sidebar from "../../components/admin_site/Sidebar";
import ManageTrackingReportContent from "../../components/admin_site/ManageTrackingReportContent";
import { Routing } from "../routing/routing";

function ManageTrackingReport() {
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
                    <ManageTrackingReportContent />
                </>
            ) : (
                <div>You do not have permission to view this page.</div>
            )}
        </>
    );

}

export default ManageTrackingReport