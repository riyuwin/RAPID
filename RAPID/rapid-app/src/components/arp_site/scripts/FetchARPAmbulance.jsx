import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase";

export function useFetchARPAmbulance(currentUid) {
    const [ambulanceId, setAmbulanceId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUid) {
            setError("Current UID is not provided");
            setLoading(false);
            return;
        }

        let isMounted = true; // To handle component unmounting

        const fetchAmbulanceId = async () => {
            try {
                const accountsRef = collection(firestore, "AccountInformation");
                const q = query(accountsRef, where("accountId", "==", currentUid));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty && isMounted) {
                    const accountData = querySnapshot.docs[0].data();
                    setAmbulanceId(accountData.ambulanceId);
                } else if (isMounted) {
                    setError("No account found with the matching accountId.");
                }
            } catch (error) {
                if (isMounted) {
                    setError(`Error fetching account details: ${error.message}`);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchAmbulanceId();

        return () => {
            isMounted = false; // Cleanup on unmount
        };
    }, [currentUid]);

    return { ambulanceId, loading, error };
}
