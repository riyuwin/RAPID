import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase";

// Fetch reports based on patientId
const PatientCareReportFetcher = (patientId, callback) => {
    const collectionRef = collection(firestore, "PatientCareReport");
    const q = query(collectionRef, where("patientId", "==", patientId));

    const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
            const reportsArray = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(reportsArray); // Return the data to the callback
        },
        (error) => {
            console.error("Error fetching reports:", error);
            callback(null, error); // Pass error to callback if needed
        }
    );

    return unsubscribe; // Return unsubscribe to stop listening later
};

export default PatientCareReportFetcher;
