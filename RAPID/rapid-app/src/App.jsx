import Dashboard from "./pages/admin_site/Dashboard";
import AmbulanceRequest from "./pages/admin_site/AmbulanceRequest";
import Map from "./pages/admin_site/Map";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ManageAccount from "./pages/admin_site/ManageAccount";
import UserDetails from "./pages/admin_site/UserDetails";
import AccountPending from "./pages/auth/AccountPending";
import ARP_Dashboard from "./pages/arp_site/Dashboard";
import ARP_PatientCareReport from "./pages/arp_site/ARP_PatientCareReport";
import ManageAmbulance from "./pages/admin_site/ManageAmbulance";

function App() {

  return (

    <BrowserRouter>
      <Routes>
        {/* Admin Pages */}
        <Route path="admin/dashboard" element={<Dashboard />} />
        <Route path="admin/map" element={<Map />} />
        <Route path="admin/ambulance_request" element={<AmbulanceRequest />} />
        <Route path="admin/manage_user_accounts" element={<ManageAccount />} />
        <Route path="admin/user_details/:accountId" element={<UserDetails />} />
        <Route path="admin/manage_ambulance" element={<ManageAmbulance />} />

        {/* Authentication Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/account_status" element={<AccountPending />} />


        {/* Authentication Pages */}
        <Route path="/arp/dashboard" element={<ARP_Dashboard />} />
        <Route path="/arp/patient_care_report" element={<ARP_PatientCareReport />} />


      </Routes>
    </BrowserRouter>
  );

}

export default App
