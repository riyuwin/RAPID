import { collection, query, where, onSnapshot, getDocs, doc } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase";

// Fetch reports based on ARP_ID with real-time updates
const FetchMessages = (callback) => {
    const accountsRef = collection(firestore, "NotificationInformation");
    const q = query(accountsRef,
        where("NotificationStatus", "==", "TrackingMessage"),
    );

    // Set up a real-time listener
    const unsubscribe = onSnapshot(
        q,
        async (querySnapshot) => {
            if (!querySnapshot.empty) {
                const notificationsWithAccountInfo = [];

                for (const docSnapshot of querySnapshot.docs) {
                    const notificationData = docSnapshot.data();
                    const accountId = notificationData.AccountId;

                    try {
                        // Create a query to fetch the account information based on AccountId
                        const accountsRef = collection(firestore, "AccountInformation");
                        const accountQuery = query(accountsRef, where("accountId", "==", accountId));

                        const querySnapshot = await getDocs(accountQuery);
                        let accountData = {};

                        if (!querySnapshot.empty) {
                            querySnapshot.forEach((accountDoc) => {
                                accountData = accountDoc.data();
                            });
                        } else {
                            console.error("No matching account found for AccountId:", accountId);
                        }

                        // Combine notification data with account data
                        notificationsWithAccountInfo.push({
                            id: docSnapshot.id, // Include the document ID
                            ...notificationData,
                            accountData, // Include the account data
                        });

                    } catch (error) {
                        console.error("Error fetching account data for AccountId:", accountId, error);
                    }
                }

                // Use the callback to pass the combined data
                callback(notificationsWithAccountInfo);
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

export default FetchMessages;
