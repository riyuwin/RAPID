import React from 'react';
import { firestore } from '../../../firebase/firebase';
import { addDoc, collection, doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore"; // Import updateDoc and arrayUnion
import Swal from 'sweetalert2';

export const UpdatePatientStatus = async (trackingId, accountId, patient_status) => {
    try {

        // Reference to the specific tracking document using trackingId
        const docRef = doc(firestore, "PatientCareReport", trackingId);

        // Update the document by adding the new coordinate to the coordinates array
        await updateDoc(docRef, {
            patient_status: patient_status,
        });

        const notif_docRef = await addDoc(collection(firestore, "NotificationInformation"), {
            NotificationStatus: "UpdatePatientStatus",
            PatientStatus: patient_status,
            TransactionId: trackingId,
            savedAt: serverTimestamp(),
            AccountId: accountId,
        });

        await updateDoc(doc(firestore, "NotificationInformation", notif_docRef.id), {
            NotificationId: notif_docRef.id,
        });

        console.log("Tracking updated successfully with ID:", trackingId);

        // Success feedback to the user
        Swal.fire({
            icon: 'success',
            title: 'Patient status updated successfully!',
            text: `The patient status in this record has been updated to ${patient_status}.`,
        });

    } catch (error) {
        console.error("Error saving tracking information:", error);

        // Error feedback to the user
        Swal.fire({
            icon: 'error',
            title: 'Failed to save tracking',
            text: error.message,
        });
    }
};
