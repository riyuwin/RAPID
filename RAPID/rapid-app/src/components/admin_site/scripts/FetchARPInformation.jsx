import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase";

// Fetch reports based on ARP_ID with real-time updates
const FetchARPInformation = (arpId, callback) => {
    const accountsRef = collection(firestore, "AccountInformation");
    const q = query(accountsRef,
        where("accountId", "==", arpId)
    );

    // Set up a real-time listener
    const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
            if (!querySnapshot.empty) {
                // Map over the documents to retrieve full data
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id, // Include the document ID
                    ...doc.data() // Include the document data
                }));

                // Use the callback to pass the data
                callback(data);
            } else {
                console.error("No matching data found.");
                callback([]); // Pass an empty array if no document is found
            }
        },
        (error) => {
            console.error("Error fetching real-time updates:", error);
        }
    );

    // Return the unsubscribe function to stop listening when no longer needed
    return unsubscribe;
};

export default FetchARPInformation;
