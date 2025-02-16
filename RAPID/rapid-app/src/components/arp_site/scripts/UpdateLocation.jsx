import React from 'react';
import { firestore } from '../../../firebase/firebase';
import { doc, updateDoc, arrayUnion, addDoc, collection, serverTimestamp } from "firebase/firestore"; // Import updateDoc and arrayUnion
import Swal from 'sweetalert2';

export const handleUpdateLocation = async (trackingId, longitude, latitude, accountId, ambulanceId) => {
    try {
        // Generate current date and time as a string
        const timestamp = new Date().toISOString(); // ISO format (e.g., "2025-01-07T12:34:56.789Z")

        // Create the coordinate object
        const coordinate = { longitude, latitude, timestamp };

        // Reference to the specific tracking document using trackingId
        const docRef = doc(firestore, "TrackingInformation", trackingId);

        // Update the document by adding the new coordinate to the coordinates array
        await updateDoc(docRef, {
            coordinates: arrayUnion(coordinate), // arrayUnion ensures that we add to the array without overwriting existing data
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

        // Success feedback to the user
        Swal.fire({
            icon: 'success',
            title: 'Tracking saved successfully!',
            text: `Tracking ID: ${trackingId}`,
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
