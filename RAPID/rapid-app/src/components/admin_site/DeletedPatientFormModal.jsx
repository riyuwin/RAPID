import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../../firebase/firebase"; // Assuming firestore is initialized properly 
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Modal } from "bootstrap";
import PatientCareReportFetcher from "../arp_site/scripts/PatientCareReportFetcher";
import { UpdatePatientStatus } from "./scripts/UpdatePatientStatus";
import { ResetForms } from "../arp_site/scripts/ResetForms";
import { PopulatePatientCareReport } from "../arp_site/scripts/PopulatePatientCareReport";

function DeletedPatientFormModal() {

    const handleHidePatientCareFormModal = () => {
        const modalElement = document.getElementById("viewPatientCareReport");
        if (modalElement) {
            const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
            modal.hide();

            setTimeout(() => {
                // 🔥 Force remove any existing backdrops
                document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());

                // 🔥 Reset body styles
                document.body.classList.remove("modal-open");
                document.body.style.overflow = "auto";
                document.body.style.paddingRight = "0px"; // Fix Bootstrap scrollbar issue
            }, 300);
        } else {
            console.error("Modal element not found!");
        }
    };



    return (
        <>
            {/* Modal for selecting ambulance */}

            <div className="modal fade" id="deletedPatientCareReport" tabindex="-1" aria-labelledby="addPatientCareReport" aria-hidden="true">
                <div className="modal-dialog modal-xl"> {/* Apply modal-lg for a larger width */}
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="modalTitle">{modalTitle}</h5>
                            {/* <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick = {() => {handleHidePatientCareFormModal()}} ></button> */}
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={handleHidePatientCareFormModal} // No need for extra arrow function
                            ></button>
                        </div>
                        <form  >
                            <div className="modal-body ">

                                <div className="modal_container">


                                    <div className="row">


                                        <div className="label_container">

                                            <div className="col-md-12">

                                                <div className="row">

                                                    <div className="col-md-12">

                                                        <div className="row mb-3 justify-content-start">
                                                            <div className="col-sm-3">
                                                                <div className="input-group justify-content-center">
                                                                    <label >Deleted </label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>

                                                <hr /><br />

                                            </div>


                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal"
                                    onClick={handleHidePatientCareFormModal}>Close</button>
                                {/* <button type="submit" className="btn btn-primary" id='saveChangesBtn' >Save changes</button> */}
                                {/* {showSubmit && (
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        id="saveChangesBtn"
                                    >
                                        Save changes
                                    </button>
                                )} */}
                            </div>
                        </form>
                    </div>
                </div >
            </div >

        </>
    );
}

export default DeletedPatientFormModal;
