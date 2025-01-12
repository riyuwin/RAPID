import React, { useState, useEffect } from 'react';
import '../../../css/style.css';
import { firestore } from '../../firebase/firebase';
import { addDoc, collection, getDocs, query, where, doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import Swal from 'sweetalert2';
import { useFetchCurrentUser } from './scripts/FetchCurrentUser';


function EditAmbulanceModal() {
    const [account, setAccount] = useState(null);
    const [ambulances, setAmbulances] = useState([]);
    const [selectedAmbulanceId, setSelectedAmbulanceId] = useState(null);
    const [accountDocId, setAccountDocId] = useState(null);
    const { accountId, currentUserloading } = useFetchCurrentUser();
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (!accountId) {
            console.warn("Account ID is not available yet.");
            return;
        }

        const fetchAccountDetails = async () => {
            try {
                console.log("Fetching account details for accountId:", accountId);
                setLoading(true);

                const accountsRef = collection(firestore, "AccountInformation");
                const q = query(accountsRef, where("accountId", "==", accountId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const accountData = querySnapshot.docs[0].data();
                    const docId = querySnapshot.docs[0].id;
                    setAccount(accountData);
                    setAccountDocId(docId);
                } else {
                    console.error("No account found with the matching accountId.");
                }
            } catch (error) {
                console.error("Error fetching account details:", error);
            } finally {
                setLoading(false);
            }
        };

        // Call the async function
        fetchAccountDetails();
    }, [accountId]);

    // Real-time listener for Ambulance information (only once account is set)
    useEffect(() => {
        if (account && account.ambulanceId) {
            const docRef = doc(firestore, "AmbulanceInformation", account.ambulanceId);
            const unsubscribeAmbulance = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const ambulanceData = docSnap.data(); // Document data
                    setAmbulance(ambulanceData);
                } else {
                    console.log("No document found with the given ID.");
                }
            });

            // Cleanup listener when component unmounts or account changes
            return () => unsubscribeAmbulance();
        }
    }, [account]); // Only re-run the effect when account changes

    // Fetch all Ambulances for the select dropdown
    useEffect(() => {
        const fetchAmbulances = async () => {
            try {
                const ambulanceRef = collection(firestore, "AmbulanceInformation");
                const querySnapshot = await getDocs(ambulanceRef);
                const ambulanceData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAmbulances(ambulanceData);
            } catch (error) {
                console.error("Error fetching ambulances:", error);
            }
        };

        fetchAmbulances();
    }, []);

    // Pre-select the ambulanceId when the account is set
    useEffect(() => {
        if (account && account.ambulanceId) {
            setSelectedAmbulanceId(account.ambulanceId);
        }
    }, [account]);

    const handleSaveChanges = async () => {
        try {
            if (selectedAmbulanceId) {
                const accountRef = doc(firestore, "AccountInformation", accountDocId);
                await updateDoc(accountRef, {
                    ambulanceId: selectedAmbulanceId
                });
                Swal.fire('Changes Saved!', '', 'success').then(() => {
                    // Reload the page after SweetAlert
                    window.location.reload();
                });
            } else {
                Swal.fire('Please select an ambulance!', '', 'warning');
            }
        } catch (error) {
            console.error("Error saving changes:", error);
            Swal.fire('Error saving changes!', '', 'error');
        }
    };

    return (
        <>
            {/* Modal for selecting ambulance */}
            <div className="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Edit Ambulance</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceSelect">Select Ambulance:</label>

                            <select
                                id="ambulanceSelect"
                                className="form-select"
                                value={selectedAmbulanceId}
                                onChange={(e) => setSelectedAmbulanceId(e.target.value)}
                            >
                                <option value="">Select Ambulance</option>
                                {ambulances.map((amb) => (
                                    <option key={amb.id} value={amb.id}>
                                        {amb.AmbulanceName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={handleSaveChanges}>Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EditAmbulanceModal;
