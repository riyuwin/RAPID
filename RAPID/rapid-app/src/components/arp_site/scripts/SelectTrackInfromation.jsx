import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase";

// Fetch reports based on trackId in real-time
const SelectTrackInformation = (trackId, callback) => {
    const trackRef = doc(firestore, "TrackingInformation", trackId);

    try {
        // Listen to real-time updates on the document
        const unsubscribe = onSnapshot(trackRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                // Get the document data
                const documentData = docSnapshot.data();

                // Call the callback function with the document data
                callback(documentData);
            } else {
                console.error("No document found with the matching trackId.");
                callback(null); // Call the callback with null if no document is found
            }
        });

        // Return the unsubscribe function so the caller can stop listening when needed
        return unsubscribe;
    } catch (error) {
        console.error("Error fetching data in real-time:", error);
        throw error; // Throw the error to handle it where the function is called
    }
};

export default SelectTrackInformation;
