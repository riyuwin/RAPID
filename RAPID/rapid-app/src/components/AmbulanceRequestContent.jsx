import React, { useRef } from "react";
import { firestore } from "../firebase/firebase"
import { addDoc, collection } from "@firebase/firestore"
import '../../css/style.css';
import '../../css/style3.css';


function AmbulanceRequestContent() {
    const patientNameRef = useRef();
    const ref = collection(firestore, "Patient");

    const handleSave = async (e) => {
        e.preventDefault();
        console.log(patientNameRef.current.value); // Logs the value of the Patient Name input

        let data = {
            PatientName: patientNameRef.current.value,
        };

        try {
            addDoc(ref, data);
        } catch (e) {
            console.log(e);
        }

    };

    return (
        <>
            <main id="main" className="main">
                <div className="content">
                    <h1>Dashboard</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a >Admin</a>
                            </li>
                            <li className="breadcrumb-item active">Dashboard</li>
                        </ol>
                    </nav>
                </div>
                <div className="h-screen flex-grow-1 overflow-y-lg-auto">
                    <header className="bg-surface-primary border-bottom pt-6">
                        <div className="container-fluid">
                            <div className="mb-npx">
                                <div className="row align-items-center">
                                    <div className="col-sm-6 col-12 mb-4 mb-sm-0">
                                        <h1 className="h2 mb-0 ls-tight"></h1>
                                    </div>
                                    <ul className="nav nav-tabs mt-4 overflow-x border-0"></ul>
                                </div>
                            </div>
                        </div>
                    </header>
                    <main className="py-6 bg-surface-secondary">
                        <div className="container-fluid">
                            <section className="section dashboard">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="row">
                                            <div className="col-xxl-12 col-md-12">
                                                <div className="card info-card sales-card">
                                                    <div className="card-body">
                                                        <h5 className="card-title">Simple Form</h5>
                                                        <form onSubmit={handleSave}>
                                                            <div className="d-flex align-items-center">
                                                                <div className="ps-3">
                                                                    <div className="ps-3">
                                                                        <span className="text-muted small pt-2 ps-1">Patient Name:</span>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            placeholder="Enter patient name"
                                                                            ref={patientNameRef}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex justify-content-end mt-4">
                                                                <button type="submit" className="btn btn-primary">
                                                                    Submit
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Add the remaining cards and sections here */}
                                        </div>
                                    </div>
                                    {/* Add other sections */}
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </main>
        </>
    );
}

export default AmbulanceRequestContent;
