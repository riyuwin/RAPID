import '../../../css/style.css';
import '../../../css/style3.css';
import { useLocation } from 'react-router-dom';

function Sidebar({ isVisible }) {
    const location = useLocation(); // Get the current location (URL)

    // Helper function to check if the current location matches the given path
    const isActive = (path) => location.pathname === path;

    return (
        <>
            {isVisible && (
                <aside id="sidebar" className="sidebar">
                    <ul className="sidebar-nav" id="sidebar-nav">
                        <li className="nav-item">
                            <a
                                className={`nav-link ${isActive('/admin/dashboard') ? '' : 'collapsed'}`}
                                id="dashboard"
                                href="/admin/dashboard"
                            >
                                <i className="bi bi-grid"></i>
                                <span>Dashboard</span>
                            </a>
                        </li>

                        <hr />

                        <li className="nav-heading">MANAGE PATIENT CARE REPORT</li>

                        <li className="nav-item">
                            <a
                                className={`nav-link ${isActive('/admin/manage_patient_records') ? '' : 'collapsed'}`}
                                href="/admin/manage_patient_records"
                            >
                                <i className="bx bxs-briefcase"></i>
                                <span>Patient Care Records</span>
                            </a>

                            <a
                                className={`nav-link ${isActive('/admin/manage_tracking_report') ? '' : 'collapsed'}`}
                                href="/admin/manage_tracking_report"
                            >
                                <i className="bx bxs-map"></i>
                                <span>Tracking Report</span>
                            </a>
                        </li>



                        <li className="nav-heading">CONFIGURATION</li>

                        <li className="nav-item">

                            <a
                                className={`nav-link ${isActive('/admin/manage_ambulance') ? '' : 'collapsed'}`}
                                href="/admin/manage_ambulance"
                            >
                                <i className="bx bxs-ambulance"></i>
                                <span>Manage Ambulance</span>
                            </a>

                            <a
                                className={`nav-link ${isActive('admin/manage_user_accounts') ? '' : 'collapsed'}`}
                                href="/admin/manage_user_accounts"
                            >
                                <i className="bx bxs-user-detail"></i>
                                <span>Manage User Accounts</span>
                            </a>
                        </li>
                    </ul>
                </aside>
            )}
        </>
    );
}

export default Sidebar;
