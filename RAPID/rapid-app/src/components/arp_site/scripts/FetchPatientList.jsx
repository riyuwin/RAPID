import React, { useState, useEffect } from 'react';
import { firestore } from '../../../firebase/firebase';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useFetchCurrentUser } from './FetchCurrentUser';

function FetchPatientList() {
    const { accountId, currentUserloading } = useFetchCurrentUser();
    const [data, setData] = useState([]); // For multiple documents
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!accountId) {
            setError("No account ID provided.");
            setLoading(false);
            return;
        }

        const collectionRef = collection(firestore, "PatientCareReport");
        const q = query(collectionRef, where("ambulancePersonelId", "==", accountId));

        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                const documents = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setData(documents);
                setError(null); // Clear any previous errors
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching documents in real-time:", error);
                setError("Failed to fetch documents in real-time.");
                setLoading(false);
            }
        );

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, [accountId]);

    return { data, loading, error }; // Return data, loading, and error

}

export default FetchPatientList;
