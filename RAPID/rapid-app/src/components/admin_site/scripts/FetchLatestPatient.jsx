import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase";

// Fetch reports based on ARP_ID with real-time updates
const FetchLatestPatient = (callback) => {
    const reportsRef = collection(firestore, "PatientCareReport");
    const q = query(reportsRef, where("notificationStatus", "==", "Unread"));

    // Set up a real-time listener
    const unsubscribe = onSnapshot(
        q,
        async (querySnapshot) => {
            if (!querySnapshot.empty) {
                // Fetch account information for each report
                const dataWithAccountInfo = await Promise.all(
                    querySnapshot.docs.map(async (doc) => {
                        const reportData = {
                            id: doc.id, // Include the document ID
                            ...doc.data(), // Include the document data
                        };

                        const ambulancePersonelId = reportData.ambulancePersonelId;
                        let accountData = {};

                        if (ambulancePersonelId) {
                            try {
                                // Fetch account information based on ambulancePersonelId
                                const accountsRef = collection(firestore, "AccountInformation");
                                const accountQuery = query(accountsRef, where("accountId", "==", ambulancePersonelId));
                                const accountSnapshot = await getDocs(accountQuery);

                                if (!accountSnapshot.empty) {
                                    accountSnapshot.forEach((accountDoc) => {
                                        accountData = accountDoc.data();
                                    });
                                } else {
                                    console.error("No matching account found for AccountId:", ambulancePersonelId);
                                }
                            } catch (error) {
                                console.error("Error fetching account data for AccountId:", ambulancePersonelId, error);
                            }
                        }

                        return {
                            ...reportData,
                            accountData, // Include the fetched account data
                        };
                    })
                );

                console.log("Fetched PatientCareReports with account info:", dataWithAccountInfo);
                callback(dataWithAccountInfo);
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

export default FetchLatestPatient;
