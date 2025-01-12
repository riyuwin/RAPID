import React from 'react';
import { firestore } from '../../../firebase/firebase';
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import Swal from 'sweetalert2';

export const handleSaveTracking = async (arp_id, ambulanceId, longitude, latitude) => {
    try {
        // Generate current date and time as a string
        const timestamp = new Date().toISOString(); // ISO format (e.g., "2025-01-07T12:34:56.789Z")

        // Add a new document to Firestore
        const docRef = await addDoc(collection(firestore, "TrackingInformation"), {
            tracking_status: "Active",
            ambulanceId: ambulanceId,
            ARP_ID: arp_id,
            coordinates: [
                { longitude, latitude, timestamp }
            ],
            SavedAt: timestamp, // Save timestamp as a string
        });

        console.log("Document written with ID:", docRef.id);

        // Update the document with the trackingId field
        await updateDoc(doc(firestore, "TrackingInformation", docRef.id), {
            trackingId: docRef.id,
        });

        // Success feedback to the user
        Swal.fire({
            icon: 'success',
            title: 'Tracking saved successfully!',
            text: `Tracking ID: ${docRef.id}`,
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
