import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "@firebase/firestore";
import { firestore } from '../../firebase/firebase';
import '../../../css/authentication.css';

function AccountPendingContent() {

    return (

        <>
            <div className="account_pending">
                <div className="container">
                    <div className="form-wrapper">

                        <h2 className="title">Registration Successful!</h2>
                        <p className="subtitle">Your account has been successfully created.</p>
                        <hr />

                        <div className="row">
                            <div className="col-md-12 d-flex justify-content-center">
                                <div className="p-3 text-center">
                                    <p className="subtitle" style={{ color: "black" }}>
                                        Your account is now pending for approval. An administrator will review and verify your registration shortly. Please wait for approval to gain full access to your account. Thank you for your patience!
                                    </p>
                                </div>
                            </div>
                        </div>

                        <hr />

                        {/* You can add more instructions here */}
                        <a href='/login'>
                            <button onClick={() => navigate('/login')} className="button">
                                Go to Login
                            </button>
                        </a>
                    </div>
                </div>
            </div>

        </>

    );

}

export default AccountPendingContent;
