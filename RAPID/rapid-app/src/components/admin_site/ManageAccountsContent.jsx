import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase/firebase';
import { collection, getDocs } from "@firebase/firestore";
import '../../../css/style.css';
import '../../../css/table.css';
import { Link } from 'react-router-dom';

function ManageAccountsContent() {
    const [accounts, setAccounts] = useState([]);
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Fetching data from Firestore
    useEffect(() => {
        // Fetching data from Firestore (This part stays the same)
        const fetchData = async () => {
            try {
                const accountsCollection = collection(firestore, "AccountInformation");
                const querySnapshot = await getDocs(accountsCollection);
                const accountsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setAccounts(accountsList);
                setFilteredAccounts(accountsList);
            } catch (error) {
                console.error("Error fetching documents: ", error);
            }
        };

        fetchData();
    }, []);

    // Handle search and filter
    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase();

        // Filter accounts by account name (combining first, middle, and last name)
        const filtered = accounts.filter(account =>
            `${account.firstName} ${account.middleName} ${account.lastName}`
                .toLowerCase()
                .includes(searchTerm)
        );
        setFilteredAccounts(filtered);
    };

    // Handle status filter
    const handleStatusFilter = (event) => {
        const selectedStatus = event.target.value;

        // Filter accounts based on the selected status
        const filtered = accounts.filter(account =>
            selectedStatus ? account.status === selectedStatus : true
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

    return (
        <>
            <main id="main" className="main">
                <div className="content">
                    <h1>Manage User Account</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a>Admin</a>
                            </li>
                            <li className="breadcrumb-item active">Manage User Account</li>
                        </ol>
                    </nav>
                </div>
                <div className="h-screen flex-grow-1 overflow-y-lg-auto">
                    <header className="bg-surface-primary border-bottom pt-6">
                        <div className="container-fluid">
                            <div className="mb-npx">
                                <div className="row align-items-center">
                                    <div className="col-sm-6 col-12 mb-4 mb-sm-0">
                                        <h1 className="h2 mb-0 ls-tight"></h1>
                                    </div>
                                    <ul className="nav nav-tabs mt-4 overflow-x border-0"></ul>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="py-6 bg-surface-secondary">
                        <div className="container-fluid">
                            <section className="section dashboard">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="row">
                                            {/* List of User Accounts */}
                                            <div className="col-xxl-12 col-md-12">
                                                <div className="card info-card revenue-card">
                                                    <div className="card shadow border-0 mb-7">
                                                        <div className="card-header">
                                                            <h5 className="mb-0">List of User Accounts</h5>
                                                        </div>

                                                        <section className="section">
                                                            <div className="row">
                                                                <div className="col-lg-12">
                                                                    <div className="card">
                                                                        <div className="card-body">
                                                                            {/* Filter and Search Section */}
                                                                            <div className="row mb-3">
                                                                                <div className="col-sm-3">
                                                                                    <div className="input-group">
                                                                                        <select className="form-select" id="statusFilter" onChange={handleStatusFilter}>
                                                                                            <option value="">All</option>
                                                                                            <option value="Pending">Pending</option>
                                                                                            <option value="Verified">Verified</option>
                                                                                            <option value="Deactivated">Deactivated</option>
                                                                                        </select>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-sm-3">
                                                                                    <div className="input-group">
                                                                                        <input
                                                                                            type="text"
                                                                                            className="form-control"
                                                                                            id="searchInput"
                                                                                            placeholder="Search Account Name"
                                                                                            onChange={handleSearch}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Table Section */}
                                                                            <div className="table-responsive">
                                                                                <table className="table datatable table-custom">
                                                                                    <thead>
                                                                                        <tr>
                                                                                            <th>No.</th>
                                                                                            <th>Account Name</th>
                                                                                            <th>Membership</th>
                                                                                            <th>Status</th>
                                                                                            <th>Action</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {currentItems.length > 0 ? (
                                                                                            currentItems.map((account, index) => (
                                                                                                <tr key={account.id}>
                                                                                                    <td>{index + 1}</td>
                                                                                                    <td>{account.firstName} {account.middleName} {account.lastName}</td>

                                                                                                    <td>
                                                                                                        {account.membership === 'Admin' ? 'Admin' :
                                                                                                            account.membership === 'AmbulancePersonnel' ? 'Ambulance Personnel' :
                                                                                                                account.membership === 'EmergencyPersonnel' ? 'Emergency Personnel' :
                                                                                                                    'Unknown Membership'}
                                                                                                    </td>

                                                                                                    <td className={
                                                                                                        account.status === 'Pending' ? 'pending-status' :
                                                                                                            account.status === 'Verified' ? 'active-status' :
                                                                                                                account.status === 'Deactivated' ? 'inactive-status' : ''
                                                                                                    }>
                                                                                                        <p>{account.status}</p>
                                                                                                    </td>

                                                                                                    <td>
                                                                                                        <Link to={`/admin/user_details/${account.id}`} className="btn btn-primary"><i className="bx bx-edit-alt" ></i> Edit</Link>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            ))
                                                                                        ) : (
                                                                                            <tr>
                                                                                                <td colSpan="5" className="no-accounts">No accounts found</td>
                                                                                            </tr>
                                                                                        )}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </section>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </main>
        </>
    );
}

export default ManageAccountsContent;
