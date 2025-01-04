import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase";

export const PopulatePatientCareReport = async (patientCareDetails) => {
    if (!patientCareDetails || !patientCareDetails[0]) {
        console.error("Invalid patient care details");
        return;
    }

    const callDets = {};
    const callDetsFields = ['callReceived', 'toScene', 'atSceneInput', 'toHospitalInput', 'atHospitalInput', 'baseInput'];

    // Loop through input field IDs and check their value directly
    callDetsFields.forEach(id => {
        const value = document.getElementById(id)?.value;
        if (value) {
            callDets[id] = value;
        }
    });

    // Check if `patientCareDetails[0]` has `callDets` and set the input fields dynamically
    if (patientCareDetails[0].callDets) {
        // Loop through each property of `callDets` and populate the input fields
        Object.keys(callDets).forEach(key => {
            const value = patientCareDetails[0].callDets[key];
            if (value) {
                const inputElement = document.getElementById(key);
                if (inputElement) {
                    inputElement.value = value;
                }
            }
        });
    }
};
