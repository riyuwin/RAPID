import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase";

export async function FetchAmbulanceDetails(currentUid) {
    if (!currentUid) {
        throw new Error("Current UID is not provided");
    }

    try {
        const q = query(collection(firestore, "AmbulanceInformation"), where("ambulanceId", "==", currentUid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return []; // Return empty array if no results found
        }
        // Convert all documents to an array of objects
        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        throw new Error(`Error fetching account details: ${error.message}`);
    }
}
