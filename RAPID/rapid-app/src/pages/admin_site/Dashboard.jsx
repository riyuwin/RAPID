import React from "react";
import { Link } from "react-router-dom";
import NavBar from "../../components/admin_site/NavBar";
import Sidebar from "../../components/admin_site/Sidebar";
import DashboardContent from "../../components/admin_site/DashboardContent";

function Dashboard() {

    return (
        <>
            <NavBar />
            <Sidebar />
            <DashboardContent />
        </>
    );

}

export default Dashboard