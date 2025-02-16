import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase";

export function FetchPatientNationality(currentUid) {
    const [nationalityDetail, setNationality] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUid) {
            setError("Current UID is not provided");
            setLoading(false);
            return;
        }

        const accountsRef = collection(firestore, "PatientCareReport", currentUid);
        const q = query(accountsRef);

        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                if (!querySnapshot.empty) {
                    const accountData = querySnapshot.docs[0].data();
                    setNationality(accountData.basicInformation.nationality);
                    console.log(accountData.basicInformation.nationality, 'asgasg')
                } else {
                    setError("No account found with the matching patientId.");
                }
                setLoading(false);
            },
            (error) => {
                setError(`Error fetching account details: ${error.message}`);
                setLoading(false);
            }
        );

        return () => unsubscribe(); // Cleanup the listener on unmount
    }, [currentUid]);

    return { nationalityDetail };
}
