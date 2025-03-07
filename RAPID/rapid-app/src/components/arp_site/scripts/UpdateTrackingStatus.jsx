import React from 'react';
import { firestore } from '../../../firebase/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore"; // Import updateDoc and arrayUnion
import Swal from 'sweetalert2';

export const UpdateTrackingStatus = async (trackingId, tracking_status, accountId) => {
    try {

        // Reference to the specific tracking document using trackingId
        const docRef = doc(firestore, "TrackingInformation", trackingId);

        // Update the document by adding the new coordinate to the coordinates array
        await updateDoc(docRef, {
            tracking_status: tracking_status,
        });

        console.log("Tracking updated successfully with ID:", trackingId);

        const notif_docRef = await addDoc(collection(firestore, "NotificationInformation"), {
            NotificationStatus: "UpdateTrackingStatus",
            TrackingStatus: tracking_status,
            TransactionId: trackingId,
            savedAt: serverTimestamp(),
            AccountId: accountId,
        });

        await updateDoc(doc(firestore, "NotificationInformation", notif_docRef.id), {
            NotificationId: notif_docRef.id,
        });

        // Success feedback to the user
        Swal.fire({
            icon: 'success',
            title: 'Tracking status updated successfully!',
            text: `The tracking status in this record has been updated to ${tracking_status}.`,
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
