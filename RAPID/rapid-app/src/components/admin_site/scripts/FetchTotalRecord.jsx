import { collection, query, onSnapshot } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase";

// Fetch total records based on the collection
const FetchTotalRecord = (documentName, callback) => {
    const accountsRef = collection(firestore, documentName);
    const q = query(accountsRef);

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

                // Calculate the total number of documents
                const totalCount = data.length;

                // Use the callback to pass the total count and data
                callback({ totalCount, data });
            } else {
                console.error("No matching data found.");
                callback({ totalCount: 0, data: [] }); // Pass zero and an empty array if no documents are found
            }
        },
        (error) => {
            console.error("Error fetching real-time updates:", error);
        }
    );

    // Return the unsubscribe function to stop listening when no longer needed
    return unsubscribe;
};

export default FetchTotalRecord;
