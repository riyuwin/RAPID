import React, { useState, useEffect } from 'react';
import { firestore } from '../../../firebase/firebase';
import { addDoc, collection, getDocs, query, where, doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export function useFetchCurrentUser() {
    const [accountId, setAccountId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const currentUid = user.uid;

                try {
                    const accountsRef = collection(firestore, "AccountInformation");
                    const q = query(accountsRef, where("accountId", "==", currentUid));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const accountData = querySnapshot.docs[0].data();
                        setAccountId(accountData.accountId); // Store the accountId
                    } else {
                        console.error("No account found with the matching accountId.");
                    }
                } catch (error) {
                    console.error("Error fetching account details:", error);
                }
            } else {
                setAccountId(null); // Reset accountId if user is logged out
            }
            setLoading(false); // Update loading state
        });

        return () => unsubscribe(); // Cleanup subscription on component unmount
    }, []);

    return { accountId, loading }; // Return accountId and loading status
}
