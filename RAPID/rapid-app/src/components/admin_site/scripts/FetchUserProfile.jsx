import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase";

// Fetch user profile based on accountId with real-time updates
const FetchUserProfile = (accountId, callback) => {
    if (!accountId) {
        console.error("Invalid accountId provided");
        return () => { }; // Return a no-op function to avoid errors
    }

    const accountDocRef = doc(firestore, "AccountInformation", accountId);

    // Set up a real-time listener for the specific document
    const unsubscribe = onSnapshot(
        accountDocRef,
        (docSnapshot) => {
            if (docSnapshot.exists()) {
                // Use the callback to pass the data
                callback({ id: docSnapshot.id, ...docSnapshot.data() });
            } else {
                console.error("No matching document found.");
                callback(null); // Pass null if no document is found
            }
        },
        (error) => {
            console.error("Error fetching real-time updates:", error);
        }
    );

    // Return the unsubscribe function to stop listening when no longer needed
    return unsubscribe;
};

export default FetchUserProfile;
