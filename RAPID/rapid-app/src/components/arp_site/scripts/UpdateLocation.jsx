import React from 'react';
import { firestore } from '../../../firebase/firebase';
import { doc, updateDoc, arrayUnion, addDoc, collection, serverTimestamp } from "firebase/firestore";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Initialize Swal with React support
const MySwal = withReactContent(Swal);

export const handleUpdateLocation = async (trackingId, longitude, latitude, accountId, ambulanceId) => {
    try {
        const timestamp = new Date().toISOString();
        const coordinate = { longitude, latitude, timestamp };

        const docRef = doc(firestore, "TrackingInformation", trackingId);

        await updateDoc(docRef, {
            coordinates: arrayUnion(coordinate),
        });

        const notif_docRef = await addDoc(collection(firestore, "NotificationInformation"), {
            NotificationStatus: "TrackingLocation",
            TrackingStatus: "Updated Location Tracking",
            TransactionId: trackingId,
            savedAt: serverTimestamp(),
            AccountId: accountId,
            AmbulanceId: ambulanceId,
        });

        await updateDoc(doc(firestore, "NotificationInformation", notif_docRef.id), {
            NotificationId: notif_docRef.id,
        });

        console.log("Tracking updated successfully with ID:", trackingId);

        // **Toast Notification Instead of Modal**
        MySwal.fire({
            toast: true,
            icon: 'success',
            title: 'Your current location tracked successfully!',
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000, // Auto close after 3 seconds
            timerProgressBar: true,
        });

    } catch (error) {
        console.error("Error saving tracking information:", error);

        MySwal.fire({
            toast: true,
            icon: 'error',
            title: 'Failed to save tracking!',
            text: error.message,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    }
};
