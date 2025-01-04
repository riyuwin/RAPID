import React from 'react';
import '../../../css/style.css';
/* import '../../css/style3.css'; */

function DashboardContent() {
    return (
        <>
            <main id="main" className="main">
                <div className="content">
                    <h1>Dashboard</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a >Admin</a>
                            </li>
                            <li className="breadcrumb-item active">Dashboard</li>
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
                                            <div className="col-xxl-4 col-md-4">
                                                <div className="card info-card sales-card">
                                                    <div className="filter">
                                                        <a
                                                            className="icon"
                                                            href="#"
                                                            data-bs-toggle="dropdown"
                                                        >
                                                            <i className="bi bi-three-dots"></i>
                                                        </a>
                                                        <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                                                            <li className="dropdown-header text-start">
                                                                <h6>Filter</h6>
                                                            </li>
                                                            <li>
                                                                <a className="dropdown-item" href="#">
                                                                    Today
                                                                </a>
                                                            </li>
                                                            <li>
                                                                <a className="dropdown-item" href="#">
                                                                    This Month
                                                                </a>
                                                            </li>
                                                            <li>
                                                                <a className="dropdown-item" href="#">
                                                                    This Year
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </div>

                                                    <div className="card-body">
                                                        <h5 className="card-title">
                                                            Total Ambulance Request{' '}
                                                            <span>| Today</span>
                                                        </h5>
                                                        <div className="d-flex align-items-center">
                                                            <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                                                                <img src="../../assets/img/med_logo.png" alt="1" />
                                                            </div>
                                                            <div className="ps-3">
                                                                <h6 id="totalNumberEmployee"></h6>
                                                                <div className="ps-3">
                                                                    <h6 id="ambulanceRequest">2</h6>
                                                                    <span className="text-muted small pt-2 ps-1"> total number of ambulance request</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="col-xxl-4 col-md-4">
                                                <div class="card info-card revenue-card">
                                                    <div class="filter">
                                                        <a class="icon" href="#" data-bs-toggle="dropdown"><i class="bi bi-three-dots"></i></a>
                                                        <ul class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                                                            <li class="dropdown-header text-start">
                                                                <h6>Filter</h6>
                                                            </li>

                                                            <li><a class="dropdown-item" href="#">Today</a></li>
                                                            <li><a class="dropdown-item" href="#">This Month</a></li>
                                                            <li><a class="dropdown-item" href="#">This Year</a></li>
                                                        </ul>
                                                    </div>

                                                    <div class="card-body">
                                                        <h5 class="card-title">Total Ambulance Service &nbsp; <span>| Today</span></h5>

                                                        <div class="d-flex align-items-center">
                                                            <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                                                                <img src="../../assets/img/ambulance_logo.png" alt="1" />
                                                            </div>
                                                            <div class="ps-3">
                                                                <h6 id="pendingRequest">2</h6>
                                                                <span class="text-muted small pt-2 ps-1">total active ambulance service</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="col-xxl-4 col-md-4">
                                                <div class="card info-card revenue-card">
                                                    <div class="filter">
                                                        <a class="icon" href="#" data-bs-toggle="dropdown"><i class="bi bi-three-dots"></i></a>
                                                        <ul class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                                                            <li class="dropdown-header text-start">
                                                                <h6>Filter</h6>
                                                            </li>

                                                            <li><a class="dropdown-item" href="#">Today</a></li>
                                                            <li><a class="dropdown-item" href="#">This Month</a></li>
                                                            <li><a class="dropdown-item" href="#">This Year</a></li>
                                                        </ul>
                                                    </div>

                                                    <div class="card-body">
                                                        <h5 class="card-title">Active Emergency Personnel &nbsp; <span>| Today</span></h5>

                                                        <div class="d-flex align-items-center">
                                                            <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                                                                <img src="../../assets/img/dashboard/dash1.png" alt="1" />
                                                            </div>
                                                            <div class="ps-3">
                                                                <h6 id="pendingRequest">2</h6>
                                                                <span class="text-muted small pt-2 ps-1">total active emergency personnel</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>


                                            {/* Add the remaining cards and sections here */}
                                        </div>
                                    </div>
                                    {/* Add other sections */}
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </main>
        </>
    );
}

export default DashboardContent;
