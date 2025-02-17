/* import '../../../css/style.css';
import '../../../css/style3.css'; */
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

function TopNav() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;


    const handleNavigation = ({ url_path }) => {
        navigate(url_path);
        window.location.reload();
    };

    return (
        <>
            <div className="col-12">
                <div className="modal-body text-end">
                    <Link
                        className={`btn btn-link ${isActive('/arp/dashboard') ? 'active' : ''}`}
                        style={{ marginRight: '10px' }}
                        to="/arp/dashboard"
                        onClick={() => { handleNavigation("/arp/dashboard") }}
                    >
                        Dashboard
                    </Link>

                    <Link
                        className={`btn btn-link ${isActive('/arp/patient_care_report') ? 'active' : ''}`}
                        style={{ marginRight: '10px' }}
                        to="/arp/patient_care_report"
                        onClick={() => { handleNavigation("/arp/patient_care_report") }}
                    >
                        Patient Care Report
                    </Link>

                    <Link
                        className={`btn btn-link ${isActive('/arp/location_tracking_record') ? 'active' : ''}`}
                        to="/arp/location_tracking_record"
                        onClick={() => { handleNavigation("/arp/location_tracking_record") }}
                    >
                        Location Tracking Record
                    </Link>
                </div>
            </div>
        </>
    );
}

export default TopNav;

