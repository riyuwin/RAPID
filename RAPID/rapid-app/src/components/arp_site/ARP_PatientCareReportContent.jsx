import React, { useRef } from "react";
import { firestore } from '../../firebase/firebase';
import { addDoc, collection } from "@firebase/firestore"
import '../../../css/style.css';
import '../../../css/style3.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function ARP_PatientCareReportContent() {




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


                                                        <div className="d-flex justify-content-center align-items-center" style={{ outline: '1px solid red', padding: '20px' }}>
                                                            <div className="w-100 text-center">
                                                                <button className="btn btn-primary">Start Tracking</button>
                                                            </div>
                                                        </div>





                                                        <h5 className="card-title text-center mb-3">
                                                            Patient Care Report Form
                                                            <hr />
                                                        </h5>

                                                        <div className="row">
                                                            <div className="col-md-3 d-flex justify-content-start align-items-start">
                                                                <div className="ps-0 w-100">
                                                                    <span className="text-muted small pt-2 ps-1">Call Received:</span>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control inputfield w-100"
                                                                        ref={patientNameRef}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-3 d-flex justify-content-center align-items-center">
                                                                <div className="ps-0 w-100">
                                                                    <span className="text-muted small pt-2 ps-1">To Scene:</span>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control inputfield w-100"
                                                                        ref={patientNameRef}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-3 d-flex justify-content-center align-items-center">
                                                                <div className="ps-0 w-100">
                                                                    <span className="text-muted small pt-2 ps-1">At Scene:</span>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control inputfield w-100"
                                                                        ref={patientNameRef}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-3 d-flex justify-content-center align-items-center">
                                                                <div className="ps-0 w-100">
                                                                    <span className="text-muted small pt-2 ps-1">To Hospital:</span>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control inputfield w-100"
                                                                        ref={patientNameRef}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="col-md-3 d-flex justify-content-center align-items-center">
                                                                <div className="ps-0 w-100">
                                                                    <br></br>
                                                                    <span className="text-muted small pt-2 ps-1">To Hospital:</span>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control inputfield w-100"
                                                                        ref={patientNameRef}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="col-md-3 d-flex justify-content-center align-items-center">
                                                                <div className="ps-0 w-100">
                                                                    <br></br>
                                                                    <span className="text-muted small pt-2 ps-1">At Hospital:</span>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control inputfield inputfield w-100"
                                                                        ref={patientNameRef}
                                                                    />
                                                                </div>
                                                            </div>


                                                            <div className="col-md-3 d-flex justify-content-center align-items-center">
                                                                <div className="ps-0 w-100">
                                                                    <br></br>
                                                                    <span className="text-muted  small pt-2 ps-1">Base:</span>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control inputfield inputfield w-100"
                                                                        ref={patientNameRef}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="col-md-12 d-flex justify-content-center align-items-center">
                                                                <div className="ps-0 w-100">
                                                                    <br></br>
                                                                    <hr></hr>
                                                                </div>
                                                            </div>


                                                            <div className="col-md-3 d-flex justify-content-center align-items-center">
                                                                <div className="ps-0 w-100">
                                                                    <br></br>
                                                                    <span className="text-muted small pt-2 ps-1">Surname:</span>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control inputfield w-100"
                                                                        ref={patientNameRef}
                                                                    />
                                                                </div>
                                                            </div>


                                                            <div className="col-md-3 d-flex justify-content-center align-items-center">
                                                                <div className="ps-0 w-100">
                                                                    <br></br>
                                                                    <span className="text-muted small pt-2 ps-1">First Name:</span>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control inputfield w-100"
                                                                        ref={patientNameRef}
                                                                    />
                                                                </div>
                                                            </div>


                                                            <div className="col-md-3 d-flex justify-content-center align-items-center">
                                                                <div className="ps-0 w-100">
                                                                    <br></br>
                                                                    <span className="text-muted small pt-2 ps-1">Middle Name:</span>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control inputfield w-100"
                                                                        ref={patientNameRef}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="col-md-3 d-flex justify-content-center align-items-center">
                                                                <div className="ps-0 w-100">
                                                                    <br></br>
                                                                    <span className="text-muted small pt-2 ps-1">Suffix:</span>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control inputfield w-100"
                                                                        ref={patientNameRef}
                                                                    />
                                                                </div>
                                                            </div>


                                                            <div className="col-md-3 d-flex justify-content-center align-items-center">
                                                                <div className="ps-0 w-100">
                                                                    <br></br><label htmlFor="gender" className="label">Gender</label>
                                                                    <select
                                                                        id="gender"
                                                                        className="form-control inputfield w-100 input"
                                                                        required
                                                                    >
                                                                        <option value="">Select Gender</option>
                                                                        <option value="Male">Male</option>
                                                                        <option value="Female">Female</option>
                                                                    </select>
                                                                </div>
                                                            </div>


                                                            <div className="col-md-3 d-flex justify-content-center align-items-center">
                                                                <div className="ps-0 w-100">
                                                                    <br></br>
                                                                    <span className="text-muted small pt-2 ps-1">Age:</span>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control inputfield w-100"
                                                                        ref={patientNameRef}
                                                                    />
                                                                </div>
                                                            </div>


                                                            <div className="col-md-3 d-flex justify-content-center align-items-center">
                                                                <div className="ps-0 w-100">
                                                                    <br></br><label htmlFor="gender" className="label">Naionality: </label>
                                                                    <select
                                                                        id="gender"
                                                                        className="form-control inputfield w-100 input"
                                                                        required
                                                                    >
                                                                        <option value="Filipino">Filipino</option>
                                                                        <option value="other">Other</option>
                                                                    </select>
                                                                </div>
                                                            </div>


                                                            <div className="col-md-12 d-flex justify-content-center align-items-center">
                                                                <div className="ps-0 w-100">
                                                                    <br></br>
                                                                    <hr></hr>
                                                                    <h5 className="card-title text-center mb-3">
                                                                        Nature of Illness
                                                                    </h5>
                                                                </div>
                                                            </div>

                                                            <div className="col-md-3 d-flex justify-content-center align-items-start">
                                                                <div className="ps-0 w-100">
                                                                    <br />
                                                                    <label htmlFor="cardiac" className="form-check-label"><b>CARDIAC</b></label>
                                                                    <br />
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Cardiac Arrest</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Cardiac Arrhythmia</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Cardiac Chest Pain</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Heart Failure</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Other Cardiac</label><br />

                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-md-3 d-flex justify-content-center align-items-start">
                                                                <div className="ps-0 w-100">
                                                                    <br />
                                                                    <label htmlFor="cardiac" className="form-check-label"><b>OBS/GYNAE</b></label>
                                                                    <br />
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Haemorrhage &lt; 24 Wks</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Haemorrhage &lt; 24 Wks</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Labour</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">PPH</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Pre-Hospital Delivery</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Other Obs/Gynae</label><br />

                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-md-3 d-flex justify-content-center align-items-start">
                                                                <div className="ps-0 w-100">
                                                                    <br />
                                                                    <label htmlFor="cardiac" className="form-check-label"><b>NEUROLOGICAL</b></label>
                                                                    <br />
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Altered LOC</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Seizures</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Stroke</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Other Neurological</label><br />

                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-md-3 d-flex justify-content-center align-items-start">
                                                                <div className="ps-0 w-100">
                                                                    <br />
                                                                    <label htmlFor="cardiac" className="form-check-label"><b>TRAUMA</b></label>
                                                                    <br />
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Burns</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Dislocation / Sprain</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Fracture</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Haemorrhage</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Head Injury</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Maxillo-Facial Injury</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Multiple Trauma</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Open Wound</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Shock</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Soft Tissue Injury</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Spinal Injury</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Other Trauma</label><br />


                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-md-3 d-flex justify-content-center align-items-start">
                                                                <div className="ps-0 w-100">
                                                                    <br />
                                                                    <label htmlFor="cardiac" className="form-check-label"><b>MECHANISM OF INJURY</b></label>
                                                                    <br />
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Assault / Brawling</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Attack / Bite by Animal</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Chemical Poisining</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Drowning</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Electrocution</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Excessive Cold</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Excessive Heat</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Fall</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Firearm Injury</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Injury to Child</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Machinery Accident</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Road Traffic Accident</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Smoke, Fire, Fllames</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Sports Injury</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Stabbing</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Stumble / Trip</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Water Transport Acc</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Other</label><br />
                                                                    </div>
                                                                </div>
                                                            </div>


                                                            <div className="col-md-3 d-flex justify-content-center align-items-start">
                                                                <div className="ps-0 w-100">
                                                                    <br />
                                                                    <label htmlFor="cardiac" className="form-check-label"><b>MEDICAL</b></label>
                                                                    <br />
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Back Pain</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Diabetes Melitus Pain</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Fever</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Headache</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Hypothermia</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Other Medical</label><br />
                                                                    </div>
                                                                </div>
                                                            </div>


                                                            <div className="col-md-3 d-flex justify-content-center align-items-start">
                                                                <div className="ps-0 w-100">
                                                                    <br />
                                                                    <label htmlFor="cardiac" className="form-check-label"><b>RESPIRATORY</b></label>
                                                                    <br />
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Asthma</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">COPD</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">FBAO</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Respiratory Arrest</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Smoke Inhalation</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Other Respiratory</label><br />
                                                                    </div>
                                                                </div>
                                                            </div>


                                                            <div className="col-md-3 d-flex justify-content-center align-items-start">
                                                                <div className="ps-0 w-100">
                                                                    <br />
                                                                    <label htmlFor="cardiac" className="form-check-label"><b>GENERAL</b></label>
                                                                    <br />
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Abdominal Pain</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Allergic Reaction</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Behavioral Disorder</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Illness Unkown</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Nausea / Vomiting</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Poisining</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Syncope / Collapse</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Other General</label><br />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-md-3 d-flex justify-content-center align-items-start">
                                                                <div className="ps-0 w-100">
                                                                    <br />
                                                                    <label htmlFor="cardiac" className="form-check-label"><b>CIRCUMSTANCES</b></label>
                                                                    <br />
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Accident</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Event of Undeterminded Intent</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Intentional Self Harm</label><br />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-md-3 d-flex justify-content-center align-items-start">
                                                                <div className="ps-0 w-100">
                                                                    <br />
                                                                    <label htmlFor="cardiac" className="form-check-label"><b>CLINICAL STATUS</b></label>
                                                                    <br />
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Life Threatening</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Serious Not Life Threat</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">Non Serious/Non Life Threat</label><br />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-md-3 d-flex justify-content-center align-items-start">
                                                                <div className="ps-0 w-100">
                                                                    <br />
                                                                    <label htmlFor="cardiac" className="form-check-label"><b>MOTOR</b></label>
                                                                    <br />
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">1. NONE</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">2. EXTENSION</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">3. FLEXION</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">4. WITHDRAW</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">5. LOCALIZE</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">6. OBEY</label><br />

                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-md-3 d-flex justify-content-center align-items-start">
                                                                <div className="ps-0 w-100">
                                                                    <br />
                                                                    <label htmlFor="cardiac" className="form-check-label"><b>VERBAL</b></label>
                                                                    <br />
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">1. NONE</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">2. INCOMPREHENSIBLE</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">3. INAPPROPRIATE</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">4. CONFUSED</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">5. ORIENTED</label><br />

                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-md-3 d-flex justify-content-center align-items-start">
                                                                <div className="ps-0 w-100">
                                                                    <br />
                                                                    <label htmlFor="cardiac" className="form-check-label"><b>EYE OPENING</b></label>
                                                                    <br />
                                                                    <hr />
                                                                    <div className="form-check">
                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">1. NONE</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">2. TO PAIN</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">3. TO VOICE</label><br />

                                                                        <input type="checkbox" id="cardiac" name="cardiac" className="form-check-input" />
                                                                        <label htmlFor="cardiac" className="form-check-label">4. SPONTANEOUS</label><br />

                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>




                                                        <div className="col-md-12 d-flex justify-content-center align-items-center">
                                                            <div className="ps-0 w-100">
                                                                <br></br>
                                                                <hr></hr>
                                                            </div>
                                                        </div>




                                                    </div>

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

export default ARP_PatientCareReportContent;