import React from 'react';
import { firestore } from '../../../firebase/firebase';
import { doc, updateDoc, arrayUnion, addDoc, collection, serverTimestamp } from "firebase/firestore"; // Import updateDoc and arrayUnion
import Swal from 'sweetalert2';

export const handleUpdateMessage = async (trackingId, user_membership, messages, accountId, ambulanceId) => {
    try {
        // Generate current date and time as a string
        const timestamp = new Date().toISOString(); // ISO format (e.g., "2025-01-07T12:34:56.789Z")

        // Create the coordinate object
        const message = { messages, user_membership, timestamp };

        // Reference to the specific tracking document using trackingId
        const docRef = doc(firestore, "TrackingInformation", trackingId);

        // Update the document by adding the new coordinate to the coordinates array
        await updateDoc(docRef, {
            messages: arrayUnion(message), // arrayUnion ensures that we add to the array without overwriting existing data
        });

        const notif_docRef = await addDoc(collection(firestore, "NotificationInformation"), {
            NotificationStatus: "TrackingMessage",
            TransactionId: trackingId,
            savedAt: serverTimestamp(),
            AccountId: accountId,
            AmbulanceId: ambulanceId,
            Message: messages,
        });

        await updateDoc(doc(firestore, "NotificationInformation", notif_docRef.id), {
            NotificationId: notif_docRef.id,
        });

        console.log("Tracking updated successfully with ID:", trackingId);

        // Success feedback to the user
        Swal.fire({
            icon: 'success',
            title: 'Message Sent!',
            text: `Your message sent successfully.`,
        });

    } catch (error) {
        console.error("Error saving tracking information:", error);

        // Error feedback to the user
        Swal.fire({
            icon: 'error',
            title: 'Failed to send message',
            text: error.message,
        });
    }
};
