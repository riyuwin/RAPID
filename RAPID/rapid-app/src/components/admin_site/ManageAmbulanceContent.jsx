import React, { useState, useEffect, useRef } from 'react';
import { firestore } from '../../firebase/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, onSnapshot } from "@firebase/firestore";
/* import '../../../css/style.css';
import '../../../css/table.css'; */
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function ManageAmbulanceContent() {
    const [accounts, setAccounts] = useState([]);
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedAmbulance, setSelectedAmbulance] = useState(null);  // Store the selected ambulance for editing

    const ambulanceRef = useRef();
    const ref = collection(firestore, "AmbulanceInformation");

    // Fetching data from Firestore in real-time
    useEffect(() => {
        const unsubscribe = onSnapshot(ref, (querySnapshot) => {
            const ambulanceList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setAccounts(ambulanceList);
            setFilteredAccounts(ambulanceList); // Update the filtered accounts
        });

        // Cleanup the listener when the component is unmounted
        return () => unsubscribe();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();

        const ambulanceName = ambulanceRef.current.value;
        if (!ambulanceName) {
            Swal.fire('Error', 'Ambulance name is required', 'error');
            return;
        }

        // Check if ambulance name already exists
        const existingAmbulance = accounts.find(account =>
            account.AmbulanceName.toLowerCase() === ambulanceName.toLowerCase() &&
            account.id !== selectedAmbulance?.id // Exclude the currently selected ambulance from the check
        );

        if (existingAmbulance) {
            Swal.fire('Error', 'An ambulance with this name already exists!', 'error');
            return;
        }

        let data = {
            AmbulanceName: ambulanceName,
            DateRegistered: new Date().toISOString(), // Store the current date and time in ISO format
            DateOfUploaded: new Date().toISOString(), // Add the uploaded date
        };

        try {
            if (selectedAmbulance) {
                // Editing an existing ambulance
                const docRef = doc(firestore, "AmbulanceInformation", selectedAmbulance.id);
                await updateDoc(docRef, data);
                Swal.fire('Success', 'Ambulance updated successfully!', 'success');
            } else {
                // Adding a new ambulance
                const docRef = await addDoc(ref, data);

                // Include the document ID in the data
                const newData = {
                    ...data,
                    ambulanceId: docRef.id,  // Save the Firestore document ID as ambulanceId
                };

                // Now update the ambulance with the ambulanceId field in Firestore
                await updateDoc(doc(firestore, "AmbulanceInformation", docRef.id), newData);

                // Update the filtered accounts with the new data
                setFilteredAccounts([...filteredAccounts, newData]);

                Swal.fire('Success', 'Ambulance added successfully!', 'success');
            }

            // Reset after save
            setSelectedAmbulance(null);  // Reset selected ambulance after saving
            ambulanceRef.current.value = ''; // Reset the form

            // Close modal
            const closeButton = document.querySelector('.btn-close');
            if (closeButton) closeButton.click();
        } catch (error) {
            console.error('Error adding or updating ambulance: ', error);
            Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
        }
    };



    // Handle search and filter
    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filtered = accounts.filter(account =>
            `${account.AmbulanceName}`.toLowerCase().includes(searchTerm)
        );
        setFilteredAccounts(filtered);
    };

    // Get current accounts for the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);

    // Handle page change
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calculate total pages
    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

    // Handle Edit action
    const handleEdit = (ambulance) => {
        setSelectedAmbulance(ambulance);
        ambulanceRef.current.value = ambulance.AmbulanceName;  // Pre-fill the form with existing data
    };

    // Handle Delete action
    const handleDelete = async (id) => {
        const confirmDelete = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (confirmDelete.isConfirmed) {
            try {
                await deleteDoc(doc(firestore, "AmbulanceInformation", id));
                setFilteredAccounts(filteredAccounts.filter(ambulance => ambulance.id !== id));  // Remove from the list
                Swal.fire('Deleted!', 'The ambulance has been deleted.', 'success');
            } catch (error) {
                console.error('Error deleting ambulance: ', error);
                Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
            }
        }
    };

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        };
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };



    return (
        <>
            <main id="main" className="main">
                <div className="content">
                    <h1>Manage Ambulance</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a>Admin</a>
                            </li>
                            <li className="breadcrumb-item active">Manage Ambulance</li>
                        </ol>
                    </nav>
                </div>

                <hr />

                <main className="py-6  ">
                    <div className="container-fluid">
                        <section className="section dashboard">
                            <div className="row">

                                <div className="col-lg-12">
                                    <div className="row">
                                        <div className="col-xxl-12 col-md-12">
                                            <div className="card info-card sales-card">
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <h5 className="card-title">List of Ambulance</h5>
                                                    </div>

                                                    {/* Filter and Search Section */}
                                                    <div className="row mb-3">
                                                        <div className="col-sm-3">
                                                            <div className="input-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="searchInput"
                                                                    placeholder="Search Ambulance Name"
                                                                    onChange={handleSearch}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-6"></div>
                                                        <div className="col-sm-3">
                                                            <div className="input-group d-flex justify-content-end">
                                                                <button
                                                                    className="btn btn-primary btn-sm"
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#addAmbulanceModal"
                                                                    onClick={() => setSelectedAmbulance(null)} // Reset the form for adding a new ambulance
                                                                >
                                                                    + Add Ambulance
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="table-responsive">
                                                        <table className="table datatable table-custom">
                                                            <thead>
                                                                <tr>
                                                                    <th>No.</th>
                                                                    <th>Ambulance Name</th>
                                                                    <th>Date Registered</th>
                                                                    <th>Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {currentItems.length > 0 ? (
                                                                    currentItems.map((ambulance, index) => (
                                                                        <tr key={ambulance.id}>
                                                                            <td>{index + 1}</td>
                                                                            <td>{ambulance.AmbulanceName}</td>
                                                                            <td>{formatDate(ambulance.DateRegistered)}</td>
                                                                            <td>
                                                                                <button
                                                                                    onClick={() => handleEdit(ambulance)}
                                                                                    className="btn btn-primary"
                                                                                    data-bs-toggle="modal"
                                                                                    data-bs-target="#addAmbulanceModal"
                                                                                >
                                                                                    <i className="bx bx-edit-alt"></i> Edit
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDelete(ambulance.id)}
                                                                                    className="btn btn-danger"
                                                                                >
                                                                                    <i className="bx bx-trash-alt"></i> Delete
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="4" className="no-accounts">
                                                                            No ambulances found
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>




                            </div>
                        </section>
                    </div>
                </main>
            </main>

            {/* Modal */}
            <div className="modal fade" id="addAmbulanceModal" tabIndex="-1" aria-labelledby="addAmbulanceModal" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addAmbulanceModalLabel">
                                {selectedAmbulance ? 'Update Ambulance' : 'Add Ambulance'}
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSave}>
                                <div className="mb-3">
                                    <label htmlFor="ambulanceName" className="form-label">Ambulance Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="ambulanceName"
                                        ref={ambulanceRef}
                                        required
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                        Close
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {selectedAmbulance ? 'Update' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ManageAmbulanceContent;
