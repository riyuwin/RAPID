import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase";

// Fetch reports based on accountId
const FetchActiveARP = async (accountId) => {
    const accountsRef = collection(firestore, "AccountInformation");
    const q = query(accountsRef, where("accountId", "==", accountId));

    try {
        // Fetch the documents asynchronously
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Get the first document's ID
            const documentId = querySnapshot.docs[0].id;

            // Return the document ID
            return documentId;
        } else {
            console.error("No account found with the matching accountId.");
            return null; // Return null if no document is found
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // Throw the error to handle it where the function is called
    }
};

export default FetchActiveARP;
