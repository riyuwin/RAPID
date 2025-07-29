import React, { useState, useEffect, useRef } from 'react';
import { firestore } from '../../firebase/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, onSnapshot } from "@firebase/firestore";
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import PatientReportChart from './PatientReportChart';
import FetchAllPatientRecords from './scripts/FetchAllPatientRecords';
import CardiacChart from './CardiacChart';
import ObsgnyaeChart from './ObsgnyaeChart';
import NeurologicalChart from './NuerologicalChart';
import TraumaChart from './TraumaChart';
import TriageChart from './TriageTaggingChart';
import PopUpNotification from './PopUpNotification';


function ManageReportsContent() {
    const [allPatientRecords, setAllPatientRecords] = useState([]);
    const [monthChanger, setMonthChanger] = useState("February");

    const handleMonthChange = (event) => {
        setMonthChanger(event.target.value);
    };

    // Define a callback to handle real-time updates
    const handlePatientRealtimeUpdates = (data) => {
        if (data) {
            setAllPatientRecords(data);
        } else {
            console.log("No document found with the matching trackId.");
        }
    };

    const fetchAllPatientRecords = async () => {
        try {
            FetchAllPatientRecords(handlePatientRealtimeUpdates);
        } catch (error) {
            console.error("Error fetching patient data:", error);
        }
    };

    useEffect(() => {
        fetchAllPatientRecords();
    }, []);


    return (
        <>
            <main id="main" className="main">
                <div className="content">
                    <h1>Reports and Statistics</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a>Admin</a>
                            </li>
                            <li className="breadcrumb-item active">Reports and Statistics</li>
                        </ol>
                    </nav>
                </div>

                <hr />

                <main className="py-6  ">
                    <div className="container-fluid">
                        <section className="section dashboard">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="row">

                                        <div className="row">

                                            <div className="col-12">
                                                <div className="card info-card sales-card">
                                                    <div className="card-body">
                                                        {/* <br /> */}
                                                        {/* <h5 style={{ color: 'black', marginBottom: '10px' }} htmlFor="statusFilter">
                                                            Filter Chart:
                                                        </h5>
                                                        <br /> */}
                                                        <div className="input-group">
                                                            <h5 style={{ color: 'black', marginTop: '10px', marginBottom: '10px' }} htmlFor="statusFilter">
                                                                Select Month:
                                                            </h5>

                                                            <select className="form-select" id="statusFilter"
                                                                value={monthChanger}
                                                                onChange={handleMonthChange} >
                                                                <option value="January">January</option>
                                                                <option value="February">February</option>
                                                                <option value="March">March</option>
                                                                <option value="April">April</option>
                                                                <option value="May">May</option>
                                                                <option value="June">June</option>
                                                                <option value="July">July</option>
                                                                <option value="August">August</option>
                                                                <option value="September">September</option>
                                                                <option value="October">October</option>
                                                                <option value="November">November</option>
                                                                <option value="December">December</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        <div className="col-xxl-12 col-md-12">
                                            <div className="card info-card sales-card">
                                                <div className="card-body">
                                                    <TriageChart chart_data={allPatientRecords} selectedMonth={monthChanger} />
                                                    <br />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-xxl-6 col-md-6">
                                            <div className="card info-card sales-card">
                                                <div className="card-body">
                                                    <CardiacChart chart_data={allPatientRecords} selectedMonth={monthChanger} />
                                                    <br />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-xxl-6 col-md-6">
                                            <div className="card info-card sales-card">
                                                <div className="card-body">
                                                    <ObsgnyaeChart chart_data={allPatientRecords} selectedMonth={monthChanger} />
                                                    <br />
                                                </div>
                                            </div>
                                        </div>


                                        <div className="col-xxl-6 col-md-6">
                                            <div className="card info-card sales-card">
                                                <div className="card-body">
                                                    <NeurologicalChart chart_data={allPatientRecords} selectedMonth={monthChanger} />
                                                    <br />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-xxl-6 col-md-6">
                                            <div className="card info-card sales-card">
                                                <div className="card-body">
                                                    <TraumaChart chart_data={allPatientRecords} selectedMonth={monthChanger} />
                                                    <br />
                                                </div>
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </main>

            <PopUpNotification />
        </>
    );
}

export default ManageReportsContent;