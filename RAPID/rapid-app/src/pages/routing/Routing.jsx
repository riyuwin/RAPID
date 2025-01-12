import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import { useFetchCurrentUser } from "../../components/arp_site/scripts/FetchCurrentUser";
import { useEffect, useState } from "react";

export const Routing = ({ pageAuth, setAuthorization }) => {
    const { accountId, currentUserloading } = useFetchCurrentUser();
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (accountId) {
            const accountsRef = collection(firestore, "AccountInformation");
            const q = query(accountsRef, where("accountId", "==", accountId));

            // Set up the real-time listener for the query
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    setMembership(doc.data().membership); // Update state with the membership value
                    setLoading(false); // Stop loading once data is fetched

                    if (doc.data().membership !== pageAuth) {
                        console.log("Bawal ka dito", pageAuth);
                        setAuthorization(false); // Set authorization to false
                        window.location.href = '/forbidden'; // Redirect to forbidden page
                    } else {
                        console.log("Pwede ka dito");
                        setAuthorization(true); // Set authorization to true
                    }
                } else {
                    console.error("No account found with the matching accountId.");
                    setLoading(false); // Stop loading if no document is found
                    setMembership(null);
                }
            }, (error) => {
                console.error("Error fetching data:", error);
                setLoading(false);
            });

            // Clean up the listener when the component is unmounted
            return () => unsubscribe();
        } else {
            setLoading(false); // Stop loading if accountId is not available
        }
    }, [accountId, pageAuth, setAuthorization]);

    if (loading) {
        return <div>Loading...</div>; // Show loading indicator while fetching user data
    }

    return null; // No UI needed in this component, it handles the permission check
};
