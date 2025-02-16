/* import '../../../css/style.css';
import '../../../css/style3.css'; */
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
                                className={`nav-link ${isActive('/arp/dashboard') ? '' : 'collapsed'}`}
                                id="dashboard"
                                href="/arp/dashboard"
                            >
                                <i className="bi bi-grid"></i>
                                <span>Dashboard</span>
                            </a>
                        </li>

                        <hr />

                        <li className="nav-heading">AMBULANCE PERSONNEL TOOL</li>

                        <li className="nav-item">
                            <a
                                className={`nav-link ${isActive('/arp/patient_care_report') ? '' : 'collapsed'}`}
                                href="/arp/patient_care_report"
                            >
                                <i className="bx bxs-ambulance"></i>
                                <span>Patient Care Report</span>
                            </a>
                        </li>

                        <li className="nav-item">
                            <a
                                className={`nav-link ${isActive('admin/map') ? '' : 'collapsed'}`}
                                href="/admin/map"
                            >
                                <i className="bx bxs-map"></i>
                                <span>Map</span>
                            </a>
                        </li>

                        <hr />


                    </ul>
                </aside>
            )}
        </>
    );
}

export default Sidebar;
