import '../../../css/style.css';
import '../../../css/style3.css';
import { useLocation } from 'react-router-dom';

function TopNav() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <div className="col-12">
                <div className="modal-body text-end">
                    <a
                        className={`btn btn-link ${isActive('/arp/dashboard') ? 'active' : ''}`}
                        style={{ marginRight: '10px' }}
                        href="/arp/dashboard"
                    >
                        Dashboard
                    </a>

                    <a
                        className={`btn btn-link ${isActive('/arp/patient_care_report') ? 'active' : ''}`}
                        style={{ marginRight: '10px' }}
                        href="/arp/patient_care_report"
                    >
                        Patient Care Report
                    </a>

                    <a
                        className={`btn btn-link ${isActive('/arp/location_tracking_record') ? 'active' : ''}`}
                        href="/arp/location_tracking_record"
                    >
                        Location Tracking Record
                    </a>
                </div>
            </div>
        </>
    );
}

export default TopNav;
