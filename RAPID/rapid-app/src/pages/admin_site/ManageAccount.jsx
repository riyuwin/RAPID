import React, { useEffect, useState } from "react";
import ManageAccountsContent from "../../components/admin_site/ManageAccountsContent";
import NavBar from "../../components/admin_site/NavBar";
import Sidebar from "../../components/admin_site/Sidebar";
import { Routing } from "../routing/routing";


function ManageAccount() {
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
                    <ManageAccountsContent />
                </>
            ) : (
                <div>You do not have permission to view this page.</div>
            )}
        </>
    );

}

export default ManageAccount;