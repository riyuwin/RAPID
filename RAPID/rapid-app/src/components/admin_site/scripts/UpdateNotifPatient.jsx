import React from 'react';
import { firestore } from '../../../firebase/firebase';
import { doc, updateDoc } from "firebase/firestore";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

export const UpdateNotifPatient = async (patientId, notifStatus) => {
    try {
        const docRef = doc(firestore, "PatientCareReport", patientId);

        await updateDoc(docRef, {
            notificationStatus: notifStatus,
        });

        // Show success toast notification
        toast.success("Notification updated successfully!", {
            position: "top-right",
            autoClose: 3000, // Closes after 3 seconds
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
        });

    } catch (error) {
        console.error("Error updating notification:", error);

        // Show error toast notification
        toast.error(`Failed to update: ${error.message}`, {
            position: "top-right",
            autoClose: 5000, // Stays longer for errors
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
        });
    }
};
