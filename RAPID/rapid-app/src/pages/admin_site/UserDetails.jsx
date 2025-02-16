import NavBar from "../../components/admin_site/NavBar";
import Sidebar from "../../components/admin_site/Sidebar";
import UserDetailsContent from "../../components/admin_site/UserDetailsContent";
import React, { useEffect, useState } from "react";
import { Routing } from "../routing/routing";

function UserDetails() {
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
                <UserDetailsContent />
            </>

        </>

    );

}

export default UserDetails