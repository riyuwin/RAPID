import Dashboard from "./pages/admin_site/Dashboard";
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
import LocationTracking from "./pages/arp_site/LocationTracking";
import ManagePatientRecords from "./pages/admin_site/ManagePatientRecords";
import ManageTrackingReport from "./pages/admin_site/ManageTrackingReport";
import RoutingContent from "./pages/routing/RoutingContent";
import Profile from "./pages/admin_site/Profile";
import Notification from "./pages/admin_site/Notification";
import ARP_Profile from "./pages/arp_site/ARP_Profile";
import Test from "./components/arp_site/Test";
import ARP_Notification from "./pages/arp_site/Notification";
import Messages from "./pages/admin_site/ManageMessages";


function App() {
  return (

    <BrowserRouter>
      <Routes>
        {/* Admin Pages */}
        <Route path="admin/dashboard" element={<Dashboard />} />
        <Route path="admin/map" element={<Map />} />
        <Route path="admin/manage_patient_records" element={<ManagePatientRecords />} />
        <Route path="admin/manage_user_accounts" element={<ManageAccount />} />
        <Route path="admin/manage_tracking_report" element={<ManageTrackingReport />} />
        <Route path="admin/user_details/:accountId" element={<UserDetails />} />
        <Route path="admin/manage_ambulance" element={<ManageAmbulance />} />
        <Route path="admin/profile" element={<Profile />} />
        <Route path="admin/notification" element={<Notification />} />
        <Route path="admin/manage_messages" element={<Messages />} />

        {/* Authentication Pages */}
        <Route path="" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/account_status" element={<AccountPending />} />


        {/* ARP Pages */}
        <Route path="/arp/dashboard" element={<ARP_Dashboard />} />
        <Route path="/arp/patient_care_report" element={<ARP_PatientCareReport />} />
        <Route path="/arp/location_tracking_record" element={<LocationTracking />} />
        <Route path="/arp/profile" element={<ARP_Profile />} />
        <Route path="/arp/notification" element={<ARP_Notification />} />

        {/* Routing */}
        <Route path="/forbidden" element={<RoutingContent />} />

        {/* Debugging */}
        <Route path="/test" element={<Test />} />

      </Routes>
    </BrowserRouter>
  );

}

export default App
