import React, { useEffect, useState } from "react";
import NavBar from "../../components/admin_site/NavBar";
import Sidebar from "../../components/admin_site/Sidebar";
import { Routing } from "../routing/routing";
import ManageMessages from "../../components/admin_site/ManageMessages";

function Messages() {
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
                <ManageMessages />
            </>

        </>
    );
}

export default Messages;
