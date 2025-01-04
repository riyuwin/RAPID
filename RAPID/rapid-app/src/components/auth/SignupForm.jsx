import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "@firebase/firestore";
import { firestore } from '../../firebase/firebase';
import '../../../css/authentication.css';

function SignupForm() {
    const [step, setStep] = useState(1);
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState('');
    const [birthday, setBirthday] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');

    const [membership, setMembership] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    /* const [image, setImage] = useState(null);  // Image file state
    const [imagePreview, setImagePreview] = useState('../');  // Image preview state */

    const navigate = useNavigate();

    // Handle Signup with image upload
    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        const auth = getAuth();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save the user information to Firestore
            const userRef = collection(firestore, "AccountInformation"); // "AccountInformation" is the collection name

            await addDoc(userRef, {
                accountId: user.uid, // User UID from Firebase Auth
                firstName,
                middleName,
                lastName,
                gender,
                birthday,
                phoneNumber,
                address,
                membership,
                email,
                status: "Pending",
            });

            setSuccess("Account created successfully!");
            setError('');
            console.log('User created:', user);

            // Navigate to Step 4 (Viewing/Instruction page) after successful signup
            /* setStep(4); */  // This will show the Step 4 page with instructions

            // Navigate to login page after a short delay
            setTimeout(() => navigate('/account_status'), 2000);
        } catch (err) {
            setError(err.message);
            setSuccess('');
        }
    };

    const handleBack = () => {
        setStep(prevStep => prevStep - 1);
    };

    return (
        <div className="signup_page">
            <div className="container">
                <div className="signup-form-wrapper">
                    <h2 className="title">Sign up</h2>
                    <p className="subtitle">Join our community!</p>
                    <hr />

                    {/* Basic Information Form */}
                    {step === 1 && (
                        <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="form">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="p-3">
                                        <div className="input-group">
                                            <label htmlFor="fName" className="label"><b>Step 1. Basic Information</b></label>
                                        </div>
                                    </div>
                                </div>

                                {/* First Name, Middle Name, Last Name */}
                                <div className="col-md-4">
                                    <div className="p-3">
                                        <div className="input-group">
                                            <label htmlFor="fName" className="label">First Name</label>
                                            <input
                                                type="text"
                                                id="fName"
                                                className="input"
                                                placeholder="First Name"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="p-3">
                                        <div className="input-group">
                                            <label htmlFor="middleName" className="label">Middle Name</label>
                                            <input
                                                type="text"
                                                id="middleName"
                                                className="input"
                                                placeholder="Middle Name"
                                                value={middleName}
                                                onChange={(e) => setMiddleName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="p-3">
                                        <div className="input-group">
                                            <label htmlFor="lastName" className="label">Last Name</label>
                                            <input
                                                type="text"
                                                id="lastName"
                                                className="input"
                                                placeholder="Last Name"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Gender */}
                                <div className="col-md-4">
                                    <div className="p-3">
                                        <div className="input-group">
                                            <label htmlFor="gender" className="label">Gender</label>
                                            <select
                                                id="gender"
                                                className="input"
                                                value={gender}
                                                onChange={(e) => setGender(e.target.value)}
                                                required
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Birthday */}
                                <div className="col-md-4">
                                    <div className="p-3">
                                        <div className="input-group">
                                            <label htmlFor="birthday" className="label">Birthdate</label>
                                            <input
                                                type="date"
                                                id="birthday"
                                                className="input"
                                                value={birthday}
                                                onChange={(e) => setBirthday(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="p-3">
                                        <div className="input-group">
                                            <label htmlFor="phoneNumber" className="label">Phone Number</label>
                                            <input
                                                type="tel"
                                                id="phoneNumber"
                                                className="input"
                                                placeholder="Phone Number"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="col-md-12">
                                    <div className="p-3">
                                        <div className="input-group">
                                            <label htmlFor="address" className="label">Address</label>
                                            <textarea
                                                id="address"
                                                className="input"
                                                placeholder="Enter your address"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="button">Next</button>
                        </form>
                    )}

                    {/* Membership Information Form */}
                    {step === 2 && (
                        <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="form">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="p-3">
                                        <div className="input-group">
                                            <label htmlFor="membership" className="label"><b>Step 2. Membership Information</b></label>
                                        </div>
                                    </div>
                                </div>

                                {/* Membership */}
                                <div className="col-md-12">
                                    <div className="p-3">
                                        <div className="input-group">
                                            <label htmlFor="membership" className="label">Membership Type</label>
                                            <select
                                                id="membership"
                                                className="input"
                                                value={membership}
                                                onChange={(e) => setMembership(e.target.value)}
                                                required
                                            >
                                                <option value="">Select Membership Type</option>
                                                <option value="AmbulancePersonnel">Ambulance Personnel</option>
                                                <option value="EmergencyPersonnel">Emergency Personnel</option>
                                                <option value="Admin">Hospital & MDDRM Admin Personnel</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="button-group">

                                <div className="row">

                                    <div className="col-md-12">
                                        <div className="p-3">
                                            <div className="input-group">
                                                <hr></hr>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="col-md-6">
                                        <div className="p-3">
                                            <div className="input-group">
                                                <button type="button" onClick={handleBack} className="button" style={{ width: '100%' }}>Back</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3">
                                            <div className="input-group">
                                                <button type="submit" className="button" style={{ width: '100%' }}>Next</button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </form>
                    )}

                    {/* Account Information Form */}
                    {step === 3 && (
                        <form onSubmit={handleSignup} className="form">
                            {error && <p className="error">{error}</p>}
                            {success && <p className="success">{success}</p>}

                            <div className="row">
                                <div className="col-md-12">
                                    <div className="p-3">
                                        <div className="input-group">
                                            <label htmlFor="fName" className="label"><b>Step 3. Account Information</b></label>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Image Upload */}
                                {/* <div className="col-md-12">
                                    <div className="p-3">
                                        {imagePreview && (
                                            <div className="image-preview">
                                                <img src={imagePreview} alt="Preview" width="150px" height="150px" />
                                            </div>
                                        )}
                                        <div className="input-group">
                                            <label htmlFor="image" className="label">Profile Image</label>
                                            <input
                                                type="file"
                                                id="image"
                                                className="input"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                    </div>
                                </div> */}


                                <div className="col-md-12">
                                    <div className="p-3">
                                        <div className="input-group">
                                            <label htmlFor="email" className="label">Email</label>
                                            <input
                                                type="email"
                                                id="email"
                                                className="input"
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="p-3">
                                        <div className="input-group">
                                            <label htmlFor="password" className="label">Password</label>
                                            <input
                                                type="password"
                                                id="password"
                                                className="input"
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="p-3">
                                        <div className="input-group">
                                            <label htmlFor="confirm_password" className="label">Confirm Password</label>
                                            <input
                                                type="password"
                                                id="confirm_password"
                                                className="input"
                                                placeholder="Confirm your password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">

                                    <div className="col-md-12">
                                        <div className="p-3">
                                            <div className="input-group">
                                            </div>
                                        </div>
                                    </div>


                                    <div className="col-md-6">
                                        <div className="p-3">
                                            <div className="input-group">
                                                <button type="button" onClick={handleBack} className="button" style={{ width: '100%' }}>Back</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3">
                                            <div className="input-group">
                                                <button type="submit" className="button" style={{ width: '100%' }}>Sign up</button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* <button type="submit" className="button">Sign up</button> */}
                        </form>
                    )}


                    <p className="footer">
                        Already have an account? <a href="/login" className="link">Login</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignupForm;
