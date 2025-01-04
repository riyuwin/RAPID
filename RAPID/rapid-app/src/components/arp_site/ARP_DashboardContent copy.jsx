import React, { useState, useEffect } from 'react';
import '../../../css/style.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { firestore } from '../../firebase/firebase';
import { addDoc, collection, getDocs, query, where, doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Swal from 'sweetalert2';
import { handleSavePatientCareReport } from './scripts/SavePatientCareReport';

function ARP_DashboardContent() {
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [account, setAccount] = useState(null);
    const [ambulance, setAmbulance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ambulances, setAmbulances] = useState([]);
    const [selectedAmbulanceId, setSelectedAmbulanceId] = useState(null);
    const [accountDocId, setAccountDocId] = useState(null);

    // form data
    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });


    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setIsUserLoggedIn(true);
                const currentUid = user.uid;

                try {
                    setLoading(true);
                    const accountsRef = collection(firestore, "AccountInformation");
                    const q = query(accountsRef, where("accountId", "==", currentUid));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const accountData = querySnapshot.docs[0].data();
                        const docId = querySnapshot.docs[0].id; // Get the Firestore document ID
                        setAccount(accountData);
                        setAccountDocId(docId); // Store the document ID
                    } else {
                        console.error("No account found with the matching accountId.");
                    }
                } catch (error) {
                    console.error("Error fetching account details:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setIsUserLoggedIn(false);
                setAccount(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

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

    useEffect(() => {
        const map = L.map('map', {
            center: [14.0996, 122.9550],
            zoom: 13,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const marker = L.marker([14.0996, 122.9550]).addTo(map)
            .bindPopup('Default Location')
            .openPopup();

        return () => {
            map.remove();
        };
    }, []);

    /* Nationality Selector */
    const [selectedNationality, setSelectedNationality] = useState("");
    const [otherNationality, setOtherNationality] = useState("");

    const handleNationalityChange = (e) => {
        setSelectedNationality(e.target.value);
    };

    const handleOtherNationalityChange = (e) => {
        setOtherNationality(e.target.value);
    };
    /* Nationality Selector */

    /* const handleSavePatientCareReport = async () => {
        try {
            // Helper function to check if the value is not null or empty
            const getValueInputIfNotEmpty = (id) => {
                const value = document.getElementById(id).value;
                return value ? value : null;
            };

            // Helper function to check if the value is not null or empty
            const getValueSelectIfNotEmpty = (id) => {
                const value = document.getElementById(id).checked;
                return value ? value : null;
            };

            // Helper function to get checkbox value only if checked
            const getCheckboxValueIfChecked = (id) => {
                const element = document.getElementById(id);
                return element?.checked ? true : null;
            };

            const callDets = {};
            if (getValueInputIfNotEmpty('callReceived')) callDets['callReceived'] = getValueInputIfNotEmpty('callReceived');
            if (getValueInputIfNotEmpty('toScene')) callDets['toScene'] = getValueInputIfNotEmpty('toScene');
            if (getValueInputIfNotEmpty('atSceneInput')) callDets['atScene'] = getValueInputIfNotEmpty('atSceneInput');
            if (getValueInputIfNotEmpty('toHospitalInput')) callDets['toHospital'] = getValueInputIfNotEmpty('toHospitalInput');
            if (getValueInputIfNotEmpty('atHospitalInput')) callDets['atHospital'] = getValueInputIfNotEmpty('atHospitalInput');
            if (getValueInputIfNotEmpty('baseInput')) callDets['base'] = getValueInputIfNotEmpty('baseInput');

            const basicInformation = {};

            if (getValueInputIfNotEmpty('surnameInput')) basicInformation['surname'] = getValueInputIfNotEmpty('surnameInput');
            if (getValueInputIfNotEmpty('nameInput')) basicInformation['firstName'] = getValueInputIfNotEmpty('nameInput');
            if (getValueInputIfNotEmpty('middleNameInput')) basicInformation['middleName'] = getValueInputIfNotEmpty('middleNameInput');
            if (getValueInputIfNotEmpty('suffixInput')) basicInformation['extName'] = getValueInputIfNotEmpty('suffixInput');

            if (getValueInputIfNotEmpty('ageInput')) basicInformation['age'] = getValueInputIfNotEmpty('ageInput');
            if (getValueSelectIfNotEmpty('genderSelect')) basicInformation['gender'] = getValueSelectIfNotEmpty('genderSelect');
            if (getValueInputIfNotEmpty('birthdateInput')) basicInformation['birthdate'] = getValueInputIfNotEmpty('birthdateInput');

            let nationality;

            const nationalitySelect = document.getElementById('nationalitySelect');
            const otherNationality = document.getElementById('otherNationality');

            if (nationalitySelect.value === "Other") {
                nationality = otherNationality.value;
            } else {
                nationality = nationalitySelect.value;
            }

            basicInformation['nationality'] = nationality;

            const triageTagging = {};
            if (getValueSelectIfNotEmpty('triageTaggingR')) triageTagging['triageTaggingR'] = getValueSelectIfNotEmpty('triageTaggingR');
            if (getValueSelectIfNotEmpty('triageTaggingY')) triageTagging['triageTaggingY'] = getValueSelectIfNotEmpty('triageTaggingY');
            if (getValueSelectIfNotEmpty('triageTaggingG')) triageTagging['triageTaggingG'] = getValueSelectIfNotEmpty('triageTaggingG');
            if (getValueSelectIfNotEmpty('triageTaggingB')) triageTagging['triageTaggingB'] = getValueSelectIfNotEmpty('triageTaggingB');

            const natureCall = {};
            if (getCheckboxValueIfChecked('natureCallEmergent')) natureCall['natureCallEmergent'] = true;
            if (getCheckboxValueIfChecked('natureCallUrgent')) natureCall['natureCallUrgent'] = true;
            if (getCheckboxValueIfChecked('natureCallNonEmergent')) natureCall['natureCallNonEmergent'] = true;

            const cardiac = {};
            if (getCheckboxValueIfChecked('cardiacArrest')) cardiac['cardiacArrest'] = true;
            if (getCheckboxValueIfChecked('cardiacArrhythmia')) cardiac['cardiacArrhythmia'] = true;
            if (getCheckboxValueIfChecked('cardiacChestPain')) cardiac['cardiacChestPain'] = true;
            if (getCheckboxValueIfChecked('heartFailure')) cardiac['heartFailure'] = true;

            // Handle "Other Cardiac" logic
            const otherCardiacChecked = getCheckboxValueIfChecked('otherCardiac');
            const otherCardiacInputValue = getValueInputIfNotEmpty('otherCardiacInput');

            if (otherCardiacChecked && otherCardiacInputValue) {
                cardiac['otherCardiacInput'] = otherCardiacInputValue;
            }

            const obs_gnyae = {};
            if (getCheckboxValueIfChecked('obsGynHaemorrhage')) obs_gnyae['obsGynHaemorrhage'] = true;
            if (getCheckboxValueIfChecked('obsGynLabour')) obs_gnyae['obsGynLabour'] = true;
            if (getCheckboxValueIfChecked('obsGynPPH')) obs_gnyae['obsGynPPH'] = true;
            if (getCheckboxValueIfChecked('obsGynPreDelivery')) obs_gnyae['obsGynPreDelivery'] = true;

            // Handle "Other Obstetrics/Gynaecology" logic
            const otherObsGynChecked = getCheckboxValueIfChecked('otherObsGyn');
            const otherObsGynInputValue = getValueInputIfNotEmpty('otherObsGynInput');
            if (otherObsGynChecked && otherObsGynInputValue) {
                obs_gnyae['otherObsGynInput'] = otherObsGynInputValue;
            }

            const neurological = {};
            if (getCheckboxValueIfChecked('neurologicalAlteredLOC')) neurological['neurologicalAlteredLOC'] = true;
            if (getCheckboxValueIfChecked('neurologicalSeizures')) neurological['neurologicalSeizures'] = true;
            if (getCheckboxValueIfChecked('neurologicalStroke')) neurological['neurologicalStroke'] = true;

            // Handle "Other Neurological" logic
            const otherNeurologicalChecked = getCheckboxValueIfChecked('otherNeurological');
            const otherNeurologicalInputValue = getValueInputIfNotEmpty('otherNeurologicalInput');
            if (otherNeurologicalChecked && otherNeurologicalInputValue) {
                neurological['otherNeurologicalInput'] = otherNeurologicalInputValue;
            }

            const trauma = {};
            if (getCheckboxValueIfChecked('traumaBurns')) trauma['traumaBurns'] = true;
            if (getCheckboxValueIfChecked('traumaDislocation')) trauma['traumaDislocation'] = true;
            if (getCheckboxValueIfChecked('neurologicalStroke')) trauma['neurologicalStroke'] = true; // Check if this is correctly categorized
            if (getCheckboxValueIfChecked('traumaFracture')) trauma['traumaFracture'] = true;
            if (getCheckboxValueIfChecked('traumaHaemorrhage')) trauma['traumaHaemorrhage'] = true;
            if (getCheckboxValueIfChecked('traumaHeadInjury')) trauma['traumaHeadInjury'] = true;
            if (getCheckboxValueIfChecked('traumaMaxilloFacial')) trauma['traumaMaxilloFacial'] = true;
            if (getCheckboxValueIfChecked('traumaMultiple')) trauma['traumaMultiple'] = true;
            if (getCheckboxValueIfChecked('traumaOpenWound')) trauma['traumaOpenWound'] = true;
            if (getCheckboxValueIfChecked('traumaShock')) trauma['traumaShock'] = true;
            if (getCheckboxValueIfChecked('traumaSoftTissue')) trauma['traumaSoftTissue'] = true;
            if (getCheckboxValueIfChecked('traumaSpinal')) trauma['traumaSpinal'] = true;

            // Handle "Other Trauma" logic
            const otherTraumaChecked = getCheckboxValueIfChecked('otherTrauma');
            const otherTraumaInputValue = getValueInputIfNotEmpty('otherTraumaInput');
            if (otherTraumaChecked && otherTraumaInputValue) {
                trauma['otherTraumaInput'] = otherTraumaInputValue;
            }


            const mechanismInjury = {};
            if (getCheckboxValueIfChecked('mechanismInjuryAssault')) mechanismInjury['mechanismInjuryAssault'] = true;
            if (getCheckboxValueIfChecked('mechanismInjuryAnimalAttack')) mechanismInjury['mechanismInjuryAnimalAttack'] = true;
            if (getCheckboxValueIfChecked('mechanismInjuryChemical')) mechanismInjury['mechanismInjuryChemical'] = true;
            if (getCheckboxValueIfChecked('mechanismInjuryDrowning')) mechanismInjury['mechanismInjuryDrowning'] = true;
            if (getCheckboxValueIfChecked('mechanismInjuryElectrocution')) mechanismInjury['mechanismInjuryElectrocution'] = true;
            if (getCheckboxValueIfChecked('mechanismInjuryCold')) mechanismInjury['mechanismInjuryCold'] = true;
            if (getCheckboxValueIfChecked('mechanismInjuryHeat')) mechanismInjury['mechanismInjuryHeat'] = true;
            if (getCheckboxValueIfChecked('mechanismInjuryFall')) mechanismInjury['mechanismInjuryFall'] = true;
            if (getCheckboxValueIfChecked('mechanismInjuryFirearm')) mechanismInjury['mechanismInjuryFirearm'] = true;
            if (getCheckboxValueIfChecked('mechanismInjuryChild')) mechanismInjury['mechanismInjuryChild'] = true;
            if (getCheckboxValueIfChecked('mechanismInjuryMachinery')) mechanismInjury['mechanismInjuryMachinery'] = true;
            if (getCheckboxValueIfChecked('mechanismInjuryRTA')) mechanismInjury['mechanismInjuryRTA'] = true;
            if (getCheckboxValueIfChecked('mechanismInjurySmoke')) mechanismInjury['mechanismInjurySmoke'] = true;
            if (getCheckboxValueIfChecked('mechanismInjurySports')) mechanismInjury['mechanismInjurySports'] = true;
            if (getCheckboxValueIfChecked('mechanismInjuryStabbing')) mechanismInjury['mechanismInjuryStabbing'] = true;
            if (getCheckboxValueIfChecked('mechanismInjuryStumble')) mechanismInjury['mechanismInjuryStumble'] = true;
            if (getCheckboxValueIfChecked('mechanismInjuryWater')) mechanismInjury['mechanismInjuryWater'] = true;

            const mechanismInjuryOtherChecked = getCheckboxValueIfChecked('mechanismInjuryOther');
            const mechanismInjuryOtherInputValue = getValueInputIfNotEmpty('mechanismInjuryOtherInput');
            if (mechanismInjuryOtherChecked && mechanismInjuryOtherInputValue) {
                mechanismInjury['mechanismInjuryOtherInput'] = mechanismInjuryOtherInputValue;
            }

            const medical = {};
            if (getCheckboxValueIfChecked('medicalBackPain')) medical['medicalBackPain'] = true;
            if (getCheckboxValueIfChecked('medicalDiabetes')) medical['medicalDiabetes'] = true;
            if (getCheckboxValueIfChecked('medicalFever')) medical['medicalFever'] = true;
            if (getCheckboxValueIfChecked('medicalHeadache')) medical['medicalHeadache'] = true;
            if (getCheckboxValueIfChecked('medicalHypothermia')) medical['medicalHypothermia'] = true;

            const medicalOtherChecked = getCheckboxValueIfChecked('medicalOther');
            const medicalOtherInputValue = getValueInputIfNotEmpty('medicalOtherInput');
            if (medicalOtherChecked && medicalOtherInputValue) {
                medical['medicalOtherInput'] = medicalOtherInputValue;
            }

            const respiratory = {};
            if (getCheckboxValueIfChecked('respiratoryAsthma')) respiratory['respiratoryAsthma'] = true;
            if (getCheckboxValueIfChecked('respiratoryCOPD')) respiratory['respiratoryCOPD'] = true;
            if (getCheckboxValueIfChecked('respiratoryFBAO')) respiratory['respiratoryFBAO'] = true;
            if (getCheckboxValueIfChecked('respiratoryArrest')) respiratory['respiratoryArrest'] = true;
            if (getCheckboxValueIfChecked('respiratorySmoke')) respiratory['respiratorySmoke'] = true;

            const respiratoryOtherChecked = getCheckboxValueIfChecked('respiratoryOther');
            const respiratoryOtherInputValue = getValueInputIfNotEmpty('respiratoryOtherInput');
            if (respiratoryOtherChecked && respiratoryOtherInputValue) {
                respiratory['respiratoryOtherInput'] = respiratoryOtherInputValue;
            }

            const general = {};
            if (getCheckboxValueIfChecked('generalAbdominalPain')) general['generalAbdominalPain'] = true;
            if (getCheckboxValueIfChecked('generalAllergicReaction')) general['generalAllergicReaction'] = true;
            if (getCheckboxValueIfChecked('generalBehavioralDisorder')) general['generalBehavioralDisorder'] = true;
            if (getCheckboxValueIfChecked('generalIllnessUnknown')) general['generalIllnessUnknown'] = true;
            if (getCheckboxValueIfChecked('generalNausea')) general['generalNausea'] = true;
            if (getCheckboxValueIfChecked('generalPoisoning')) general['generalPoisoning'] = true;
            if (getCheckboxValueIfChecked('generalSyncope')) general['generalSyncope'] = true;

            const generalOtherChecked = getCheckboxValueIfChecked('generalOther');
            const generalOtherInputValue = getValueInputIfNotEmpty('generalOtherInput');
            if (generalOtherChecked && generalOtherInputValue) {
                general['generalOtherInput'] = generalOtherInputValue;
            }
            const circumstances = {};
            if (getCheckboxValueIfChecked('circumstancesAccident')) circumstances['circumstancesAccident'] = true;
            if (getCheckboxValueIfChecked('circumstancesEvent')) circumstances['circumstancesEvent'] = true;
            if (getCheckboxValueIfChecked('circumstancesSelfHarm')) circumstances['circumstancesSelfHarm'] = true;

            const clinicalStatus = {};
            if (getCheckboxValueIfChecked('clinicalLifeThreatening')) clinicalStatus['clinicalLifeThreatening'] = true;
            if (getCheckboxValueIfChecked('clinicalSerious')) clinicalStatus['clinicalSerious'] = true;
            if (getCheckboxValueIfChecked('clinicalNonSerious')) clinicalStatus['clinicalNonSerious'] = true;

            const motor = {};
            if (getCheckboxValueIfChecked('motorNone')) motor['motorNone'] = true;
            if (getCheckboxValueIfChecked('motorExtension')) motor['motorExtension'] = true;
            if (getCheckboxValueIfChecked('motorFlexion')) motor['motorFlexion'] = true;
            if (getCheckboxValueIfChecked('motorWithdraw')) motor['motorWithdraw'] = true;
            if (getCheckboxValueIfChecked('motorLocalize')) motor['motorLocalize'] = true;
            if (getCheckboxValueIfChecked('motorObey')) motor['motorObey'] = true;

            // Verbal
            const verbal = {};
            if (getCheckboxValueIfChecked('verbalNone')) verbal['verbalNone'] = true;
            if (getCheckboxValueIfChecked('verbalIncomprehensible')) verbal['verbalIncomprehensible'] = true;
            if (getCheckboxValueIfChecked('verbalInappropriate')) verbal['verbalInappropriate'] = true;
            if (getCheckboxValueIfChecked('verbalConfused')) verbal['verbalConfused'] = true;
            if (getCheckboxValueIfChecked('verbalOriented')) verbal['verbalOriented'] = true;

            // Eye Opening
            const eye_opening = {};
            if (getCheckboxValueIfChecked('eyeNone')) eye_opening['eyeNone'] = true;
            if (getCheckboxValueIfChecked('eyeToPain')) eye_opening['eyeToPain'] = true;
            if (getCheckboxValueIfChecked('eyeToVoice')) eye_opening['eyeToVoice'] = true;
            if (getCheckboxValueIfChecked('eyeSpontaneous')) eye_opening['eyeSpontaneous'] = true;
            // GCS Total
            const gcsTotal = getValueInputIfNotEmpty('gcsTotal');
            if (gcsTotal) eye_opening['gcsTotal'] = gcsTotal;

            const pulse = {};
            if (getCheckboxValueIfChecked('pulsePositive')) pulse['pulsePositive'] = true;
            if (getCheckboxValueIfChecked('pulseRapid')) pulse['pulseRapid'] = true;
            if (getCheckboxValueIfChecked('pulseSlow')) pulse['pulseSlow'] = true;
            if (getCheckboxValueIfChecked('pulseNegative')) pulse['pulseNegative'] = true;

            // Airway
            const airway = {};
            if (getCheckboxValueIfChecked('airwayClear')) airway['airwayClear'] = true;
            if (getCheckboxValueIfChecked('airwayPartial')) airway['airwayPartial'] = true;
            if (getCheckboxValueIfChecked('airwayObstructed')) airway['airwayObstructed'] = true;

            // Breathing
            const breathing = {};
            if (getCheckboxValueIfChecked('breathingNormal')) breathing['breathingNormal'] = true;
            if (getCheckboxValueIfChecked('breathingRapid')) breathing['breathingRapid'] = true;
            if (getCheckboxValueIfChecked('breathingSlow')) breathing['breathingSlow'] = true;
            if (getCheckboxValueIfChecked('breathingShallow')) breathing['breathingShallow'] = true;
            if (getCheckboxValueIfChecked('breathingHyperventilate')) breathing['breathingHyperventilate'] = true;
            if (getCheckboxValueIfChecked('breathingNone')) breathing['breathingNone'] = true;

            // Gag Reflex
            const gagReflex = {};
            if (getCheckboxValueIfChecked('gagReflexPresent')) gagReflex['gagReflexPresent'] = true;
            if (getCheckboxValueIfChecked('gagReflexAbsent')) gagReflex['gagReflexAbsent'] = true;

            // Complaint Details
            const complaintDets = {};
            if (getValueInputIfNotEmpty('chiefComplaintInput')) complaintDets['chiefComplaintInput'] = getValueInputIfNotEmpty('chiefComplaintInput');
            if (getValueInputIfNotEmpty('historyInput')) complaintDets['historyInput'] = getValueInputIfNotEmpty('historyInput');
            if (getValueInputIfNotEmpty('signsSymptomsInput')) complaintDets['signsSymptomsInput'] = getValueInputIfNotEmpty('signsSymptomsInput');
            if (getValueInputIfNotEmpty('allergiesInput')) complaintDets['allergiesInput'] = getValueInputIfNotEmpty('allergiesInput');
            if (getValueInputIfNotEmpty('medicationsInput')) complaintDets['medicationsInput'] = getValueInputIfNotEmpty('medicationsInput');
            if (getValueInputIfNotEmpty('pastMedicalHistoryInput')) complaintDets['pastMedicalHistoryInput'] = getValueInputIfNotEmpty('pastMedicalHistoryInput');
            if (getValueInputIfNotEmpty('lastMealIntakeInput')) complaintDets['lastMealIntakeInput'] = getValueInputIfNotEmpty('lastMealIntakeInput');
            if (getValueInputIfNotEmpty('timeInput')) complaintDets['timeInput'] = getValueInputIfNotEmpty('timeInput');
            if (getValueInputIfNotEmpty('eventPriorInput')) complaintDets['eventPriorInput'] = getValueInputIfNotEmpty('eventPriorInput');

            const vitalSigns = {};
            // row 1
            if (getCheckboxValueIfChecked('row1LOCA')) vitalSigns['row1LOCA'] = getCheckboxValueIfChecked('row1LOCA');
            if (getCheckboxValueIfChecked('row1LOCV')) vitalSigns['row1LOCV'] = getCheckboxValueIfChecked('row1LOCV');
            if (getCheckboxValueIfChecked('row1LOCP')) vitalSigns['row1LOCP'] = getCheckboxValueIfChecked('row1LOCP');
            if (getCheckboxValueIfChecked('row1LOCU')) vitalSigns['row1LOCU'] = getCheckboxValueIfChecked('row1LOCU');

            if (getValueInputIfNotEmpty('row1BP')) vitalSigns['row1BP'] = getValueInputIfNotEmpty('row1BP');
            if (getValueInputIfNotEmpty('row1PR')) vitalSigns['row1PR'] = getValueInputIfNotEmpty('row1PR');
            if (getValueInputIfNotEmpty('row1RR')) vitalSigns['row1RR'] = getValueInputIfNotEmpty('row1RR');
            if (getValueInputIfNotEmpty('row1SPO2')) vitalSigns['row1SPO2'] = getValueInputIfNotEmpty('row1SPO2');
            if (getValueInputIfNotEmpty('row1TEMP')) vitalSigns['row1TEMP'] = getValueInputIfNotEmpty('row1TEMP');
            if (getValueInputIfNotEmpty('row1Time')) vitalSigns['row1Time'] = getValueInputIfNotEmpty('row1Time');

            // row 2
            if (getCheckboxValueIfChecked('row2LOCA')) vitalSigns['row2LOCA'] = getCheckboxValueIfChecked('row2LOCA');
            if (getCheckboxValueIfChecked('row2LOCV')) vitalSigns['row2LOCV'] = getCheckboxValueIfChecked('row2LOCV');
            if (getCheckboxValueIfChecked('row2LOCP')) vitalSigns['row2LOCP'] = getCheckboxValueIfChecked('row2LOCP');
            if (getCheckboxValueIfChecked('row2LOCU')) vitalSigns['row2LOCU'] = getCheckboxValueIfChecked('row2LOCU');

            if (getValueInputIfNotEmpty('row2BP')) vitalSigns['row2BP'] = getValueInputIfNotEmpty('row2BP');
            if (getValueInputIfNotEmpty('row2PR')) vitalSigns['row2PR'] = getValueInputIfNotEmpty('row2PR');
            if (getValueInputIfNotEmpty('row2RR')) vitalSigns['row2RR'] = getValueInputIfNotEmpty('row2RR');
            if (getValueInputIfNotEmpty('row2SPO2')) vitalSigns['row2SPO2'] = getValueInputIfNotEmpty('row2SPO2');
            if (getValueInputIfNotEmpty('row2TEMP')) vitalSigns['row2TEMP'] = getValueInputIfNotEmpty('row2TEMP');
            if (getValueInputIfNotEmpty('row2Time')) vitalSigns['row2Time'] = getValueInputIfNotEmpty('row2Time');

            // row 3
            if (getCheckboxValueIfChecked('row3LOCA')) vitalSigns['row3LOCA'] = getCheckboxValueIfChecked('row3LOCA');
            if (getCheckboxValueIfChecked('row3LOCV')) vitalSigns['row3LOCV'] = getCheckboxValueIfChecked('row3LOCV');
            if (getCheckboxValueIfChecked('row3LOCP')) vitalSigns['row3LOCP'] = getCheckboxValueIfChecked('row3LOCP');
            if (getCheckboxValueIfChecked('row3LOCU')) vitalSigns['row3LOCU'] = getCheckboxValueIfChecked('row3LOCU');

            if (getValueInputIfNotEmpty('row3BP')) vitalSigns['row3BP'] = getValueInputIfNotEmpty('row3BP');
            if (getValueInputIfNotEmpty('row3PR')) vitalSigns['row3PR'] = getValueInputIfNotEmpty('row3PR');
            if (getValueInputIfNotEmpty('row3RR')) vitalSigns['row3RR'] = getValueInputIfNotEmpty('row3RR');
            if (getValueInputIfNotEmpty('row3SPO2')) vitalSigns['row3SPO2'] = getValueInputIfNotEmpty('row3SPO2');
            if (getValueInputIfNotEmpty('row3TEMP')) vitalSigns['row3TEMP'] = getValueInputIfNotEmpty('row3TEMP');
            if (getValueInputIfNotEmpty('row3Time')) vitalSigns['row3Time'] = getValueInputIfNotEmpty('row3Time');

            // row 4
            if (getCheckboxValueIfChecked('row4LOCA')) vitalSigns['row4LOCA'] = getCheckboxValueIfChecked('row4LOCA');
            if (getCheckboxValueIfChecked('row4LOCV')) vitalSigns['row4LOCV'] = getCheckboxValueIfChecked('row4LOCV');
            if (getCheckboxValueIfChecked('row4LOCP')) vitalSigns['row4LOCP'] = getCheckboxValueIfChecked('row4LOCP');
            if (getCheckboxValueIfChecked('row4LOCU')) vitalSigns['row4LOCU'] = getCheckboxValueIfChecked('row4LOCU');

            if (getValueInputIfNotEmpty('row4BP')) vitalSigns['row4BP'] = getValueInputIfNotEmpty('row4BP');
            if (getValueInputIfNotEmpty('row4PR')) vitalSigns['row4PR'] = getValueInputIfNotEmpty('row4PR');
            if (getValueInputIfNotEmpty('row4RR')) vitalSigns['row4RR'] = getValueInputIfNotEmpty('row4RR');
            if (getValueInputIfNotEmpty('row4SPO2')) vitalSigns['row4SPO2'] = getValueInputIfNotEmpty('row4SPO2');
            if (getValueInputIfNotEmpty('row4TEMP')) vitalSigns['row4TEMP'] = getValueInputIfNotEmpty('row4TEMP');
            if (getValueInputIfNotEmpty('row4Time')) vitalSigns['row4Time'] = getValueInputIfNotEmpty('row4Time');

            const pupilDets = {};

            // row 1
            if (getCheckboxValueIfChecked('Pearrl-L')) pupilDets['Pearrl-L'] = getCheckboxValueIfChecked('Pearrl-L');
            if (getCheckboxValueIfChecked('Pearrl-R')) pupilDets['Pearrl-R'] = getCheckboxValueIfChecked('Pearrl-R');
            if (getCheckboxValueIfChecked('Clear-L')) pupilDets['Clear-L'] = getCheckboxValueIfChecked('Clear-L');
            if (getCheckboxValueIfChecked('Clear-R')) pupilDets['Clear-R'] = getCheckboxValueIfChecked('Clear-R');
            if (getCheckboxValueIfChecked('limbYes')) pupilDets['limbYes'] = getCheckboxValueIfChecked('limbYes');
            if (getCheckboxValueIfChecked('limbNo')) pupilDets['limbNo'] = getCheckboxValueIfChecked('limbNo');
            if (getValueInputIfNotEmpty('row1lm')) pupilDets['row1lm'] = getValueInputIfNotEmpty('row1lm');

            // row 2
            if (getCheckboxValueIfChecked('Pinpoint-L')) pupilDets['Pinpoint-L'] = getCheckboxValueIfChecked('Pinpoint-L');
            if (getCheckboxValueIfChecked('Pinpoint-R')) pupilDets['Pinpoint-R'] = getCheckboxValueIfChecked('Pinpoint-R');
            if (getCheckboxValueIfChecked('AbsentL')) pupilDets['AbsentL'] = getCheckboxValueIfChecked('AbsentL');
            if (getCheckboxValueIfChecked('AbsentR')) pupilDets['AbsentR'] = getCheckboxValueIfChecked('AbsentR');
            if (getCheckboxValueIfChecked('armsYes')) pupilDets['armsYes'] = getCheckboxValueIfChecked('armsYes');
            if (getCheckboxValueIfChecked('armsNo')) pupilDets['armsNo'] = getCheckboxValueIfChecked('armsNo');
            if (getValueInputIfNotEmpty('row2LM')) pupilDets['row2LM'] = getValueInputIfNotEmpty('row2LM');

            // row 3
            if (getCheckboxValueIfChecked('dLatedL')) pupilDets['dLatedL'] = getCheckboxValueIfChecked('dLatedL');
            if (getCheckboxValueIfChecked('dLatedR')) pupilDets['dLatedR'] = getCheckboxValueIfChecked('dLatedR');
            if (getCheckboxValueIfChecked('decreaseL')) pupilDets['decreaseL'] = getCheckboxValueIfChecked('decreaseL');
            if (getCheckboxValueIfChecked('decreaseR')) pupilDets['decreaseR'] = getCheckboxValueIfChecked('decreaseR');
            if (getCheckboxValueIfChecked('arms2Yes')) pupilDets['arms2Yes'] = getCheckboxValueIfChecked('arms2Yes');
            if (getCheckboxValueIfChecked('arms2No')) pupilDets['arms2No'] = getCheckboxValueIfChecked('arms2No');
            if (getValueInputIfNotEmpty('row3LM')) pupilDets['row3LM'] = getValueInputIfNotEmpty('row3LM');


            // row 4
            if (getCheckboxValueIfChecked('sluggishL')) pupilDets['sluggishL'] = getCheckboxValueIfChecked('sluggishL');
            if (getCheckboxValueIfChecked('sluggishR')) pupilDets['sluggishR'] = getCheckboxValueIfChecked('sluggishR');
            if (getCheckboxValueIfChecked('cracklesL')) pupilDets['cracklesL'] = getCheckboxValueIfChecked('cracklesL');
            if (getCheckboxValueIfChecked('cracklesR')) pupilDets['cracklesR'] = getCheckboxValueIfChecked('cracklesR');
            if (getCheckboxValueIfChecked('legs1Yes')) pupilDets['legs1Yes'] = getCheckboxValueIfChecked('legs1Yes');
            if (getCheckboxValueIfChecked('legs1No')) pupilDets['legs1No'] = getCheckboxValueIfChecked('legs1No');
            if (getValueInputIfNotEmpty('row4LM')) pupilDets['row4LM'] = getValueInputIfNotEmpty('row4LM');

            // row 5
            if (getCheckboxValueIfChecked('fixedL')) pupilDets['fixedL'] = getCheckboxValueIfChecked('fixedL');
            if (getCheckboxValueIfChecked('fixedR')) pupilDets['fixedR'] = getCheckboxValueIfChecked('fixedR');
            if (getCheckboxValueIfChecked('ronchiL')) pupilDets['ronchiL'] = getCheckboxValueIfChecked('ronchiL');
            if (getCheckboxValueIfChecked('ronchiR')) pupilDets['ronchiR'] = getCheckboxValueIfChecked('cracklesR');
            if (getCheckboxValueIfChecked('legs2Yes')) pupilDets['legs2Yes'] = getCheckboxValueIfChecked('legs2Yes');
            if (getCheckboxValueIfChecked('legs1No')) pupilDets['legs2No'] = getCheckboxValueIfChecked('legs2No');
            if (getValueInputIfNotEmpty('row5LM')) pupilDets['row5LM'] = getValueInputIfNotEmpty('row5LM');

            // row 6
            if (getCheckboxValueIfChecked('cataractL')) pupilDets['cataractL'] = getCheckboxValueIfChecked('cataractL');
            if (getCheckboxValueIfChecked('cataractR')) pupilDets['cataractR'] = getCheckboxValueIfChecked('cataractR');
            if (getCheckboxValueIfChecked('wheezeL')) pupilDets['wheezeL'] = getCheckboxValueIfChecked('wheezeL');
            if (getCheckboxValueIfChecked('wheezeR')) pupilDets['wheezeR'] = getCheckboxValueIfChecked('wheezeR');
            if (getCheckboxValueIfChecked('legs3Yes')) pupilDets['legs3Yes'] = getCheckboxValueIfChecked('legs3Yes');
            if (getCheckboxValueIfChecked('legs3No')) pupilDets['legs3No'] = getCheckboxValueIfChecked('legs3No');
            if (getValueInputIfNotEmpty('row6LM')) pupilDets['row6LM'] = getValueInputIfNotEmpty('row6LM');


            const wound = {};
            if (getCheckboxValueIfChecked('bleedingControl')) wound['bleedingControl'] = getCheckboxValueIfChecked('bleedingControl');
            if (getCheckboxValueIfChecked('appliedAntiseptic')) wound['appliedAntiseptic'] = getCheckboxValueIfChecked('appliedAntiseptic');

            const immobilisation = {};
            if (getCheckboxValueIfChecked('c-collar')) immobilisation['c-collar'] = getCheckboxValueIfChecked('c-collar');
            if (getCheckboxValueIfChecked('spineboard')) immobilisation['spineboard'] = getCheckboxValueIfChecked('spineboard');
            if (getCheckboxValueIfChecked('KED')) immobilisation['KED'] = getCheckboxValueIfChecked('KED');
            if (getCheckboxValueIfChecked('splints')) immobilisation['splints'] = getCheckboxValueIfChecked('splints');
            if (getCheckboxValueIfChecked('scoopStretcher')) immobilisation['scoopStretcher'] = getCheckboxValueIfChecked('scoopStretcher');
            if (getValueInputIfNotEmpty('immobilisationOthers')) immobilisation['immobilisationOthers'] = getValueInputIfNotEmpty('immobilisationOthers');

            const condition = {};
            if (getCheckboxValueIfChecked('deformity')) condition['deformity'] = getCheckboxValueIfChecked('deformity');
            if (getCheckboxValueIfChecked('confusion')) condition['confusion'] = getCheckboxValueIfChecked('confusion');
            if (getCheckboxValueIfChecked('abrasion')) condition['abrasion'] = getCheckboxValueIfChecked('abrasion');
            if (getCheckboxValueIfChecked('puncture')) condition['puncture'] = getCheckboxValueIfChecked('puncture');
            if (getCheckboxValueIfChecked('burn')) condition['burn'] = getCheckboxValueIfChecked('burn');
            if (getCheckboxValueIfChecked('tenderness')) condition['tenderness'] = getCheckboxValueIfChecked('tenderness');
            if (getCheckboxValueIfChecked('laceration')) condition['laceration'] = getCheckboxValueIfChecked('laceration');
            if (getCheckboxValueIfChecked('swelling')) condition['swelling'] = getCheckboxValueIfChecked('swelling');
            if (getCheckboxValueIfChecked('fracture')) condition['fracture'] = getCheckboxValueIfChecked('fracture');
            if (getCheckboxValueIfChecked('avulsion')) condition['avulsion'] = getCheckboxValueIfChecked('avulsion');
            if (getCheckboxValueIfChecked('dislocation')) condition['dislocation'] = getCheckboxValueIfChecked('dislocation');
            if (getCheckboxValueIfChecked('pain')) condition['pain'] = getCheckboxValueIfChecked('pain');
            if (getCheckboxValueIfChecked('rashes')) condition['rashes'] = getCheckboxValueIfChecked('rashes');
            if (getCheckboxValueIfChecked('numbness')) condition['numbness'] = getCheckboxValueIfChecked('numbness');

            const endorsedTeam = {};
            if (getValueInputIfNotEmpty('endorsedByTeam')) endorsedTeam['endorsedByTeam'] = getValueInputIfNotEmpty('endorsedByTeam');
            if (getValueInputIfNotEmpty('tlInput')) endorsedTeam['tlInput'] = getValueInputIfNotEmpty('tlInput');
            if (getValueInputIfNotEmpty('r1Input')) endorsedTeam['r1Input'] = getValueInputIfNotEmpty('r1Input');
            if (getValueInputIfNotEmpty('r2Input')) endorsedTeam['r2Input'] = getValueInputIfNotEmpty('r2Input');
            if (getValueInputIfNotEmpty('r3Input')) endorsedTeam['r3Input'] = getValueInputIfNotEmpty('r3Input');
            if (getValueInputIfNotEmpty('r4Input')) endorsedTeam['r4Input'] = getValueInputIfNotEmpty('r4Input');
            if (getValueInputIfNotEmpty('r5Input')) endorsedTeam['r5Input'] = getValueInputIfNotEmpty('r5Input');

            const incidentType = {};
            if (getCheckboxValueIfChecked('vehicularAccident')) incidentType['vehicularAccident'] = getCheckboxValueIfChecked('vehicularAccident');
            if (getCheckboxValueIfChecked('medicalAttention')) incidentType['medicalAttention'] = getCheckboxValueIfChecked('medicalAttention');
            if (getCheckboxValueIfChecked('patientTransport')) incidentType['patientTransport'] = getCheckboxValueIfChecked('patientTransport');
            if (getCheckboxValueIfChecked('openWaterIncident')) incidentType['openWaterIncident'] = getCheckboxValueIfChecked('openWaterIncident');
            if (getCheckboxValueIfChecked('drowningIncident')) incidentType['drowningIncident'] = getCheckboxValueIfChecked('drowningIncident');
            if (getCheckboxValueIfChecked('maritimeIncident')) incidentType['r4Input'] = getCheckboxValueIfChecked('maritimeIncident');
            if (getCheckboxValueIfChecked('fireIncident')) incidentType['fireIncident'] = getCheckboxValueIfChecked('fireIncident');
            if (getCheckboxValueIfChecked('specialCases')) incidentType['specialCases'] = getCheckboxValueIfChecked('specialCases');

            if (getValueInputIfNotEmpty('incidentSummary')) incidentType['incidentSummary'] = getValueInputIfNotEmpty('incidentSummary');
            if (getCheckboxValueIfChecked('noPatientFound')) incidentType['noPatientFound'] = getCheckboxValueIfChecked('noPatientFound');

            const incidentLocation = {};
            if (getCheckboxValueIfChecked('incident_sameAsResidence')) incidentLocation['incident_sameAsResidence'] = getCheckboxValueIfChecked('incident_sameAsResidence');
            if (getValueInputIfNotEmpty('incident_landmarkPlace')) incidentLocation['incident_landmarkPlace'] = getValueInputIfNotEmpty('incident_landmarkPlace');
            if (getValueInputIfNotEmpty('incident_roadStreetName')) incidentLocation['incident_roadStreetName'] = getValueInputIfNotEmpty('incident_roadStreetName');
            if (getValueInputIfNotEmpty('incident_purok')) incidentLocation['incident_purok'] = getValueInputIfNotEmpty('incident_purok');
            if (getValueInputIfNotEmpty('incident_barangay')) incidentLocation['incident_barangay'] = getValueInputIfNotEmpty('incident_barangay');
            if (getValueInputIfNotEmpty('incident_municipalityCity')) incidentLocation['incident_municipalityCity'] = getValueInputIfNotEmpty('incident_municipalityCity');
            if (getValueInputIfNotEmpty('incident_province')) incidentLocation['incident_province'] = getValueInputIfNotEmpty('incident_province');

            const transportLocation = {};
            if (getCheckboxValueIfChecked('transport_sameAsResidence')) transportLocation['transport_sameAsResidence'] = getCheckboxValueIfChecked('transport_sameAsResidence');
            if (getCheckboxValueIfChecked('transport_refusedTransport')) transportLocation['transport_refusedTransport'] = getCheckboxValueIfChecked('transport_refusedTransport');
            if (getValueInputIfNotEmpty('transport_landmarkPlace')) transportLocation['transport_landmarkPlace'] = getValueInputIfNotEmpty('transport_landmarkPlace');
            if (getValueInputIfNotEmpty('transport_roadStreetName')) transportLocation['transport_roadStreetName'] = getValueInputIfNotEmpty('transport_roadStreetName');
            if (getValueInputIfNotEmpty('transport_purok')) transportLocation['transport_purok'] = getValueInputIfNotEmpty('transport_purok');
            if (getValueInputIfNotEmpty('transport_barangay')) transportLocation['transport_barangay'] = getValueInputIfNotEmpty('transport_barangay');
            if (getValueInputIfNotEmpty('transport_municipalityCity')) transportLocation['transport_municipalityCity'] = getValueInputIfNotEmpty('transport_municipalityCity');
            if (getValueInputIfNotEmpty('transport_province')) transportLocation['transport_province'] = getValueInputIfNotEmpty('transport_province');

            const part1 = {};
            if (getCheckboxValueIfChecked('selfAccident')) part1['selfAccident'] = getCheckboxValueIfChecked('selfAccident');
            if (getCheckboxValueIfChecked('motorVehicleCollision')) part1['motorVehicleCollision'] = getCheckboxValueIfChecked('motorVehicleCollision');
            if (getValueInputIfNotEmpty('incidentSummary')) part1['incidentSummary'] = getValueInputIfNotEmpty('incidentSummary');

            const severity = {};
            if (getCheckboxValueIfChecked('fatal')) severity['fatal'] = getCheckboxValueIfChecked('fatal');
            if (getCheckboxValueIfChecked('injury')) severity['injury'] = getCheckboxValueIfChecked('injury');
            if (getCheckboxValueIfChecked('propertyDamage')) severity['propertyDamage'] = getCheckboxValueIfChecked('propertyDamage');

            const incidentMainCause = {};
            if (getCheckboxValueIfChecked('humanError')) incidentMainCause['humanError'] = getCheckboxValueIfChecked('humanError');
            if (getCheckboxValueIfChecked('vehicleDefect')) incidentMainCause['vehicleDefect'] = getCheckboxValueIfChecked('vehicleDefect');
            if (getCheckboxValueIfChecked('roadDefect')) incidentMainCause['roadDefect'] = getCheckboxValueIfChecked('roadDefect');

            const collisionType = {};
            if (getCheckboxValueIfChecked('rearEnd')) collisionType['rearEnd'] = getCheckboxValueIfChecked('rearEnd');
            if (getCheckboxValueIfChecked('sideSwipe')) collisionType['sideSwipe'] = getCheckboxValueIfChecked('sideSwipe');
            if (getCheckboxValueIfChecked('headOn')) collisionType['headOn'] = getCheckboxValueIfChecked('headOn');
            if (getCheckboxValueIfChecked('hitObject')) collisionType['hitObject'] = getCheckboxValueIfChecked('hitObject');
            if (getCheckboxValueIfChecked('hitPedestrian')) collisionType['hitPedestrian'] = getCheckboxValueIfChecked('hitPedestrian');
            if (getCheckboxValueIfChecked('sideImpact')) collisionType['sideImpact'] = getCheckboxValueIfChecked('sideImpact');
            if (getCheckboxValueIfChecked('rollover')) collisionType['rollover'] = getCheckboxValueIfChecked('rollover');
            if (getCheckboxValueIfChecked('multipleVehicle')) collisionType['multipleVehicle'] = getCheckboxValueIfChecked('multipleVehicle');
            if (getCheckboxValueIfChecked('hitParkedVehicle')) collisionType['hitParkedVehicle'] = getCheckboxValueIfChecked('hitParkedVehicle');
            if (getCheckboxValueIfChecked('hitAnimal')) collisionType['hitAnimal'] = getCheckboxValueIfChecked('hitAnimal');

            if (getValueInputIfNotEmpty('incidentDescription')) collisionType['incidentDescription'] = getValueInputIfNotEmpty('incidentDescription');

            const part2 = {};
            if (getValueInputIfNotEmpty('vehicularAccidentDetails')) part2['vehicularAccidentDetails'] = getValueInputIfNotEmpty('vehicularAccidentDetails');

            const classification = {};
            if (getValueInputIfNotEmpty('classificationPrivate')) classification['classificationPrivate'] = getValueInputIfNotEmpty('classificationPrivate');
            if (getValueInputIfNotEmpty('vehicularAccidentDetails')) classification['classificationPublic'] = getValueInputIfNotEmpty('vehicularAccidentDetails');
            if (getValueInputIfNotEmpty('classificationGovernment')) classification['classificationGovernment'] = getValueInputIfNotEmpty('classificationGovernment');
            if (getValueInputIfNotEmpty('classificationDiplomat')) classification['classificationDiplomat'] = getValueInputIfNotEmpty('classificationDiplomat');

            const typeVehicle = {};
            if (getCheckboxValueIfChecked('motorcycle')) typeVehicle['motorcycle'] = getCheckboxValueIfChecked('motorcycle');
            if (getCheckboxValueIfChecked('bike')) typeVehicle['bike'] = getCheckboxValueIfChecked('bike');
            if (getCheckboxValueIfChecked('jeepney')) typeVehicle['jeepney'] = getCheckboxValueIfChecked('jeepney');
            if (getCheckboxValueIfChecked('ambulance')) typeVehicle['ambulance'] = getCheckboxValueIfChecked('ambulance');
            if (getCheckboxValueIfChecked('heavyEquipment')) typeVehicle['heavyEquipment'] = getCheckboxValueIfChecked('heavyEquipment');
            if (getCheckboxValueIfChecked('tricycle')) typeVehicle['tricycle'] = getCheckboxValueIfChecked('tricycle');
            if (getCheckboxValueIfChecked('eBike')) typeVehicle['eBike'] = getCheckboxValueIfChecked('eBike');
            if (getCheckboxValueIfChecked('horseDriven')) typeVehicle['horseDriven'] = getCheckboxValueIfChecked('horseDriven');
            if (getCheckboxValueIfChecked('pushCart')) typeVehicle['pushCart'] = getCheckboxValueIfChecked('pushCart');
            if (getCheckboxValueIfChecked('car')) typeVehicle['car'] = getCheckboxValueIfChecked('car');
            if (getCheckboxValueIfChecked('eTricycle')) typeVehicle['eTricycle'] = getCheckboxValueIfChecked('eTricycle');
            if (getCheckboxValueIfChecked('pedicab')) typeVehicle['pedicab'] = getCheckboxValueIfChecked('pedicab');
            if (getCheckboxValueIfChecked('fourWheelsAtv')) typeVehicle['fourWheelsAtv'] = getCheckboxValueIfChecked('fourWheelsAtv');
            if (getCheckboxValueIfChecked('waterVessel')) typeVehicle['waterVessel'] = getCheckboxValueIfChecked('waterVessel');
            if (getCheckboxValueIfChecked('truck')) typeVehicle['truck'] = getCheckboxValueIfChecked('truck');
            if (getCheckboxValueIfChecked('hauler')) typeVehicle['hauler'] = getCheckboxValueIfChecked('hauler');
            if (getCheckboxValueIfChecked('bus')) typeVehicle['bus'] = getCheckboxValueIfChecked('bus');
            if (getCheckboxValueIfChecked('armoredCar')) typeVehicle['armoredCar'] = getCheckboxValueIfChecked('armoredCar');
            if (getCheckboxValueIfChecked('animal')) typeVehicle['animal'] = getCheckboxValueIfChecked('animal');
            if (getValueInputIfNotEmpty('vehicleOthers')) typeVehicle['vehicleOthers'] = getValueInputIfNotEmpty('vehicleOthers');

            if (getValueInputIfNotEmpty('vehicleMake')) typeVehicle['vehicleMake'] = getValueInputIfNotEmpty('vehicleMake');
            if (getValueInputIfNotEmpty('vehicleModel')) typeVehicle['vehicleModel'] = getValueInputIfNotEmpty('vehicleModel');
            if (getValueInputIfNotEmpty('vehicleOthers')) typeVehicle['plateNumber'] = getValueInputIfNotEmpty('vehicleOthers');
            if (getValueInputIfNotEmpty('tcBodyNumber')) typeVehicle['tcBodyNumber'] = getValueInputIfNotEmpty('tcBodyNumber');

            const maneuver = {};
            if (getCheckboxValueIfChecked('leftTurn')) maneuver['leftTurn'] = getCheckboxValueIfChecked('leftTurn');
            if (getCheckboxValueIfChecked('rightTurn')) maneuver['rightTurn'] = getCheckboxValueIfChecked('rightTurn');
            if (getCheckboxValueIfChecked('uTurn')) maneuver['uTurn'] = getCheckboxValueIfChecked('uTurn');
            if (getCheckboxValueIfChecked('crossTraffic')) maneuver['crossTraffic'] = getCheckboxValueIfChecked('crossTraffic');
            if (getCheckboxValueIfChecked('merging')) maneuver['merging'] = getCheckboxValueIfChecked('merging');
            if (getCheckboxValueIfChecked('diverging')) maneuver['diverging'] = getCheckboxValueIfChecked('diverging');
            if (getCheckboxValueIfChecked('overtaking')) maneuver['overtaking'] = getCheckboxValueIfChecked('overtaking');
            if (getCheckboxValueIfChecked('goingAhead')) maneuver['goingAhead'] = getCheckboxValueIfChecked('goingAhead');
            if (getCheckboxValueIfChecked('reversing')) maneuver['reversing'] = getCheckboxValueIfChecked('reversing');
            if (getCheckboxValueIfChecked('suddenStop')) maneuver['suddenStop'] = getCheckboxValueIfChecked('suddenStop');
            if (getCheckboxValueIfChecked('suddenStart')) maneuver['suddenStart'] = getCheckboxValueIfChecked('suddenStart');
            if (getCheckboxValueIfChecked('parkedOffRoad')) maneuver['parkedOffRoad'] = getCheckboxValueIfChecked('parkedOffRoad');
            if (getCheckboxValueIfChecked('parkedOnRoad')) maneuver['parkedOnRoad'] = getCheckboxValueIfChecked('parkedOnRoad');

            if (getValueInputIfNotEmpty('otherManeuver')) maneuver['otherManeuver'] = getValueInputIfNotEmpty('otherManeuver');

            const damage = {};
            if (getCheckboxValueIfChecked('damageRear')) damage['damageRear'] = getCheckboxValueIfChecked('damageRear');
            if (getCheckboxValueIfChecked('damageRoof')) damage['damageRoof'] = getCheckboxValueIfChecked('damageRoof');
            if (getCheckboxValueIfChecked('damageNone')) damage['damageNone'] = getCheckboxValueIfChecked('damageNone');
            if (getCheckboxValueIfChecked('damageRight')) damage['damageRight'] = getCheckboxValueIfChecked('damageRight');
            if (getCheckboxValueIfChecked('damageMultiple')) damage['damageMultiple'] = getCheckboxValueIfChecked('damageMultiple');
            if (getCheckboxValueIfChecked('damageFront')) damage['damageFront'] = getCheckboxValueIfChecked('damageFront');
            if (getCheckboxValueIfChecked('damageLeft')) damage['damageLeft'] = getCheckboxValueIfChecked('damageLeft');
            if (getValueInputIfNotEmpty('damageOthers')) damage['damageOthers'] = getValueInputIfNotEmpty('damageOthers');

            const defect = {};
            if (getCheckboxValueIfChecked('defectBrakes')) defect['defectBrakes'] = getCheckboxValueIfChecked('defectBrakes');
            if (getCheckboxValueIfChecked('defectMultiple')) defect['defectMultiple'] = getCheckboxValueIfChecked('defectMultiple');
            if (getCheckboxValueIfChecked('defectNone')) defect['defectNone'] = getCheckboxValueIfChecked('defectNone');
            if (getCheckboxValueIfChecked('defectSteering')) defect['defectSteering'] = getCheckboxValueIfChecked('defectSteering');
            if (getCheckboxValueIfChecked('defectEngine')) defect['defectEngine'] = getCheckboxValueIfChecked('defectEngine');
            if (getCheckboxValueIfChecked('defectLights')) defect['defectLights'] = getCheckboxValueIfChecked('defectLights');
            if (getCheckboxValueIfChecked('defectTires')) defect['defectTires'] = getCheckboxValueIfChecked('defectTires');
            if (getValueInputIfNotEmpty('defectOthers')) defect['defectOthers'] = getValueInputIfNotEmpty('defectOthers');

            const loading = {};
            if (getCheckboxValueIfChecked('loadingLegal')) loading['loadingLegal'] = getCheckboxValueIfChecked('loadingLegal');
            if (getCheckboxValueIfChecked('loadingOverloaded')) loading['loadingOverloaded'] = getCheckboxValueIfChecked('loadingOverloaded');
            if (getCheckboxValueIfChecked('loadingUnsafe')) loading['loadingUnsafe'] = getCheckboxValueIfChecked('loadingUnsafe');

            const part3 = {};
            if (getValueInputIfNotEmpty('part3')) part3['part3'] = getValueInputIfNotEmpty('part3');

            const involvement = {};
            if (getCheckboxValueIfChecked('involvement_driver')) involvement['involvement_driver'] = getCheckboxValueIfChecked('involvement_driver');
            if (getCheckboxValueIfChecked('involvement_passenger')) involvement['involvement_passenger'] = getCheckboxValueIfChecked('involvement_passenger');
            if (getCheckboxValueIfChecked('involvement_pedestrian')) involvement['involvement_pedestrian'] = getCheckboxValueIfChecked('involvement_pedestrian');

            if (getValueInputIfNotEmpty('licenseNumber')) involvement['licenseNumber'] = getValueInputIfNotEmpty('licenseNumber');
            if (getCheckboxValueIfChecked('NolicenseNumber')) involvement['NolicenseNumber'] = getCheckboxValueIfChecked('NolicenseNumber');

            const driverError = {};
            if (getCheckboxValueIfChecked('driverErrorFatigued')) driverError['driverErrorFatigued'] = getCheckboxValueIfChecked('driverErrorFatigued');
            if (getCheckboxValueIfChecked('driverErrorNoSignal')) driverError['driverErrorNoSignal'] = getCheckboxValueIfChecked('driverErrorNoSignal');
            if (getCheckboxValueIfChecked('driverErrorBadOvertaking')) driverError['driverErrorBadOvertaking'] = getCheckboxValueIfChecked('driverErrorBadOvertaking');
            if (getCheckboxValueIfChecked('driverErrorInattentive')) driverError['driverErrorInattentive'] = getCheckboxValueIfChecked('driverErrorInattentive');
            if (getCheckboxValueIfChecked('driverErrorBadTurning')) driverError['driverErrorBadTurning'] = getCheckboxValueIfChecked('driverErrorBadTurning');
            if (getCheckboxValueIfChecked('driverErrorTooFast')) driverError['driverErrorTooFast'] = getCheckboxValueIfChecked('driverErrorTooFast');
            if (getCheckboxValueIfChecked('driverErrorUsingCellphone')) driverError['driverErrorUsingCellphone'] = getCheckboxValueIfChecked('driverErrorUsingCellphone');
            if (getCheckboxValueIfChecked('driverErrorTooClose')) driverError['driverErrorTooClose'] = getCheckboxValueIfChecked('driverErrorTooClose');

            const injury = {};
            if (getCheckboxValueIfChecked('injuryFatal')) injury['injuryFatal'] = getCheckboxValueIfChecked('injuryFatal');
            if (getCheckboxValueIfChecked('injurySerious')) injury['injurySerious'] = getCheckboxValueIfChecked('injurySerious');
            if (getCheckboxValueIfChecked('injuryMinor')) injury['injuryMinor'] = getCheckboxValueIfChecked('injuryMinor');
            if (getCheckboxValueIfChecked('injuryNotInjured')) injury['injuryNotInjured'] = getCheckboxValueIfChecked('injuryNotInjured');

            const alcoholDrugs = {};
            if (getCheckboxValueIfChecked('alcoholSuspected')) alcoholDrugs['alcoholSuspected'] = getCheckboxValueIfChecked('alcoholSuspected');
            if (getCheckboxValueIfChecked('drugsSuspected')) alcoholDrugs['drugsSuspected'] = getCheckboxValueIfChecked('drugsSuspected');

            const seatbeltHelmet = {};
            if (getCheckboxValueIfChecked('seatbeltHelmetWorn')) seatbeltHelmet['seatbeltHelmetWorn'] = getCheckboxValueIfChecked('seatbeltHelmetWorn');
            if (getCheckboxValueIfChecked('seatbeltHelmetNotWorn')) seatbeltHelmet['seatbeltHelmetNotWorn'] = getCheckboxValueIfChecked('seatbeltHelmetNotWorn');
            if (getCheckboxValueIfChecked('seatbeltHelmetNotWornCorrectly')) seatbeltHelmet['seatbeltHelmetNotWornCorrectly'] = getCheckboxValueIfChecked('seatbeltHelmetNotWornCorrectly');
            if (getCheckboxValueIfChecked('seatbeltHelmetNoSeatbelt')) seatbeltHelmet['seatbeltHelmetNoSeatbelt'] = getCheckboxValueIfChecked('seatbeltHelmetNoSeatbelt');

            console.log("12", injury)
            console.log("Hey", alcoholDrugs)
            console.log("Hey", seatbeltHelmet)

            try {
                // Save the document to Firestore
                const docRef = await addDoc(collection(firestore, "PatientCareReport"), {
                    callDets: callDets,
                    basicInformation: basicInformation,
                    triageTagging: triageTagging,
                    natureCall: natureCall,
                    cardiac: cardiac,
                    obs_gnyae: obs_gnyae,
                    neurological: neurological,
                    trauma: trauma,
                    mechanismInjury: mechanismInjury,
                    medical: medical,
                    respiratory: respiratory,
                    general: general,
                    circumstances: circumstances,
                    clinicalStatus: clinicalStatus,
                    motor: motor,
                    verbal: verbal,
                    eye_opening: eye_opening,
                    pulse: pulse,
                    airway: airway,
                    breathing: breathing,
                    gagReflex: gagReflex,
                    complaintDets: complaintDets,
                    vitalSigns: vitalSigns,
                    pupilDets: pupilDets,
                    wound: wound,
                    immobilisation: immobilisation,
                    condition: condition,
                    endorsedTeam: endorsedTeam,
                    incidentType: incidentType,
                    incidentLocation: incidentLocation,
                    transportLocation: transportLocation,
                    part1: part1,
                    severity: severity,
                    incidentMainCause: incidentMainCause,
                    collisionType: collisionType,
                    part2: part2,
                    classification: classification,
                    typeVehicle: typeVehicle,
                    maneuver: maneuver,
                    damage: damage,
                    defect: defect,
                    loading: loading,
                    part3: part3,
                    involvement: involvement,
                    driverError: driverError,
                    injury: injury,
                    alcoholDrugs: alcoholDrugs,
                    seatbeltHelmet: seatbeltHelmet,
                    savedAt: serverTimestamp(), // Add server timestamp
                });

                console.log("Document written with ID: ", docRef.id);

                // Step 2: Save docRef.id as patientId in the same document
                await updateDoc(doc(firestore, "PatientCareReport", docRef.id), {
                    patientId: docRef.id,
                });

                // SweetAlert success notification
                Swal.fire({
                    icon: 'success',
                    title: 'Patient Care Report Saved!',
                    text: `Patient Care Record saved successfully.`,
                    confirmButtonText: 'OK',
                }).then(() => {
                    // Reload the page after successful submission
                    location.reload(); // Reload the page
                });
            } catch (error) {
                console.error("Error adding document: ", error);

                // SweetAlert error notification
                Swal.fire({
                    icon: 'error',
                    title: 'Error saving changes!',
                    text: error.message,
                    confirmButtonText: 'Try Again',
                });
            }


        } catch (error) {
            console.error("Error saving changes:", error);
            Swal.fire('Error saving changes!', '', 'error');
        }
    }; */



    return (
        <>
            <div className="main_arp">
                <div className="container-arp">
                    <h1>asgsag</h1>
                </div>

                <div className="content">
                    <h1>Dashboard</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a>Ambulance Personnel</a>
                            </li>
                            <li className="breadcrumb-item active">Dashboard</li>
                        </ol>
                    </nav>
                </div>
                <br></br>

                <br></br>

                <section className="section dashboard">
                    <div className="row">
                        <div className="col-lg-3">
                            <div className="row">
                                <div className="col-xxl-12 col-md-12">
                                    <div className="card info-card sales-card text-center">
                                        <div className="card-body">
                                            <h5 className="card-title">Ambulance Details</h5>
                                            <div className="d-flex align-items-center justify-content-center">
                                                <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                                                    <img src="../../assets/img/ambulance_logo.png" alt="1" />
                                                </div>
                                            </div>
                                            <hr />

                                            <div className="container-fluid">
                                                <p className="text-start ambulance_text">
                                                    Ambulance Name: <b>{ambulance?.AmbulanceName}</b>
                                                </p>
                                                <p className="text-start ambulance_text">
                                                    Updated at: <b>
                                                        {account?.updatedAt
                                                            ? account.updatedAt.toDate
                                                                ? account.updatedAt.toDate().toLocaleDateString() // Only date, no time
                                                                : account.updatedAt // If it's already a string, use as is
                                                            : ""}
                                                    </b>
                                                </p>
                                            </div>

                                            <hr />

                                            <button className="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                                <i className="bx bx-edit-alt"></i> Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Add the remaining cards and sections here */}

                        <div className="col-lg-6">
                            <div className="row">
                                <div className="col-xxl-12 col-md-12">
                                    <div className="card info-card sales-card">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="card-title">Recent Patient Care Report</h5>
                                                <button className="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#addPatientCareReport">+ Add Patient Care Report</button>
                                            </div>

                                            {/* Table Section */}
                                            <div className="table-responsive">
                                                <table className="table datatable table-custom">
                                                    <thead>
                                                        <tr>
                                                            <th>No.</th>
                                                            <th>Patient Name</th>
                                                            <th>Date Reported</th>
                                                            <th>Status</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {/* Data here */}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3">
                            <div className="row">
                                <div className="col-xxl-12 col-md-12">
                                    <div className="card info-card sales-card">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="card-title">Map</h5>
                                                <button className="btn btn-sm btn-success">
                                                    <i class="bx bx-map"></i> Start Tracking
                                                </button>
                                            </div>

                                            <div id="map" style={{ height: '300px', width: '100%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

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


                        {/* Modal for selecting ambulance */}
                        <div className="modal fade" id="addPatientCareReport" tabindex="-1" aria-labelledby="addPatientCareReport" aria-hidden="true">
                            <div className="modal-dialog modal-xl"> {/* Apply modal-lg for a larger width */}
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="exampleModalLabel">+ Add Patient Care Report</h5>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <form /* onSubmit={handleSavePatientCareReport} */>
                                        <div className="modal-body">

                                            <div className="row">
                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput">Call Received: <span className='required-form'>*</span></label>
                                                    <input
                                                        id='callReceived'
                                                        type="text"
                                                        className="form-control"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">To Scene: <span className='required-form'>*</span></label>
                                                    <input
                                                        id='toScene'
                                                        type="text"
                                                        className="form-control"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">At Scene: <span className='required-form'>*</span></label>
                                                    <input
                                                        id='atSceneInput'
                                                        type="text"
                                                        className="form-control"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">To Hospital: <span className='required-form'>*</span></label>
                                                    <input
                                                        id='toHospitalInput'
                                                        type="text"
                                                        className="form-control"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">At Hospital: <span className='required-form'>*</span></label>
                                                    <input
                                                        id='atHospitalInput'
                                                        type="text"
                                                        className="form-control"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Base: <span className='required-form'>*</span></label>
                                                    <input
                                                        id='baseInput'
                                                        type="text"
                                                        className="form-control"
                                                    />
                                                </div>


                                                <div className="col-md-12">
                                                    <hr />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Surname: <span className='required-form'>*</span></label>
                                                    <input
                                                        id='surnameInput'
                                                        type="text"
                                                        className="form-control"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Name: <span className='required-form'>*</span></label>
                                                    <input
                                                        id='nameInput'
                                                        type="text"
                                                        className="form-control"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Middle Name:   </label>
                                                    <input
                                                        id='middleNameInput'
                                                        type="text"
                                                        className="form-control"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Suffix:</label>
                                                    <input
                                                        id='suffixInput'
                                                        type="text"
                                                        className="form-control"
                                                    />
                                                </div>

                                                <div className="col-md-12">
                                                    <hr />
                                                </div>


                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Age: <span className='required-form'>*</span></label>
                                                    <input
                                                        id='ageInput'
                                                        type="number"
                                                        className="form-control"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="genderSelect">Gender: <span className='required-form'>*</span></label>
                                                    <select
                                                        id="genderSelect"
                                                        className="form-select"
                                                        required
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                    </select>
                                                </div>


                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Date of Birth:</label>
                                                    <input
                                                        id='birthdateInput'
                                                        type="date"
                                                        className="form-control"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: "black", marginBottom: "10px", marginTop: '10px' }} htmlFor="nationalitySelect">
                                                        Nationality: <span className='required-form'>*</span>
                                                    </label>
                                                    <select
                                                        id="nationalitySelect"
                                                        className="form-select"
                                                        value={selectedNationality}
                                                        onChange={handleNationalityChange}
                                                        required
                                                    >
                                                        <option value="Filipino">Filipino</option>
                                                        <option value="Other">Other</option>
                                                    </select>

                                                    {selectedNationality === "Other" && (
                                                        <div style={{ marginTop: "10px" }}>
                                                            <label htmlFor="otherNationality" style={{ color: "black", marginBottom: "10px", marginTop: '10px' }}>
                                                                Specify Nationality:
                                                            </label>
                                                            <input
                                                                id="otherNationality"
                                                                type="text"
                                                                className="form-control"
                                                                value={otherNationality}
                                                                onChange={handleOtherNationalityChange}
                                                                placeholder="Enter your nationality"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-md-12">
                                                    <hr />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="triageTaggingR">Triage Tagging: <span className='required-form'>*</span></label>

                                                    <br />
                                                    <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="triageTaggingR" name="triageTagging" className="form-check-input" />
                                                        <label htmlFor="triageTaggingR" className="form-check-label">R</label><br />

                                                        <input type="checkbox" id="triageTaggingY" name="triageTagging" className="form-check-input" />
                                                        <label htmlFor="triageTaggingY" className="form-check-label">Y</label><br />

                                                        <input type="checkbox" id="triageTaggingG" name="triageTagging" className="form-check-input" />
                                                        <label htmlFor="triageTaggingG" className="form-check-label">G</label><br />

                                                        <input type="checkbox" id="triageTaggingB" name="triageTagging" className="form-check-input" />
                                                        <label htmlFor="triageTaggingB" className="form-check-label">B</label><br />

                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="natureCallEmergent">Nature of Call: <span className='required-form'>*</span></label>

                                                    <br />
                                                    <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="natureCallEmergent" name="natureOfCall" className="form-check-input" />
                                                        <label htmlFor="natureCallEmergent" className="form-check-label">Emergent</label><br />

                                                        <input type="checkbox" id="natureCallUrgent" name="natureOfCall" className="form-check-input" />
                                                        <label htmlFor="natureCallUrgent" className="form-check-label">Urgent</label><br />

                                                        <input type="checkbox" id="natureCallNonEmergent" name="natureOfCall" className="form-check-input" />
                                                        <label htmlFor="natureCallNonEmergent" className="form-check-label">Non-Emergent</label><br />

                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <hr />
                                                    <h5 className="card-title text-center mb-3" style={{ color: 'black' }}>
                                                        Nature of Illness
                                                    </h5>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="cardiacArrest">Cardiac: <span className='required-form'>*</span></label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="cardiacArrest" name="cardiac" className="form-check-input" />
                                                        <label htmlFor="cardiacArrest" className="form-check-label">Cardiac Arrest</label><br />

                                                        <input type="checkbox" id="cardiacArrhythmia" name="cardiac" className="form-check-input" />
                                                        <label htmlFor="cardiacArrhythmia" className="form-check-label">Cardiac Arrhythmia</label><br />

                                                        <input type="checkbox" id="cardiacChestPain" name="cardiac" className="form-check-input" />
                                                        <label htmlFor="cardiacChestPain" className="form-check-label">Cardiac Chest Pain</label><br />

                                                        <input type="checkbox" id="heartFailure" name="cardiac" className="form-check-input" />
                                                        <label htmlFor="heartFailure" className="form-check-label">Heart Failure</label><br />

                                                        <input type="checkbox" id="otherCardiac" name="cardiac" className="form-check-input" />
                                                        <label htmlFor="otherCardiac" className="form-check-label">Other Cardiac</label><br /><br />

                                                        <input
                                                            id='otherCardiacInput'
                                                            type="text"
                                                            className="form-control"
                                                            style={{ marginLeft: '-10px' }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="obsGynHaemorrhage">OBS/GYNAE:</label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="obsGynHaemorrhage" name="obsGyn" className="form-check-input" />
                                                        <label htmlFor="obsGynHaemorrhage" className="form-check-label">Haemorrhage &lt; 24 Wks</label><br />

                                                        <input type="checkbox" id="obsGynLabour" name="obsGyn" className="form-check-input" />
                                                        <label htmlFor="obsGynLabour" className="form-check-label">Labour</label><br />

                                                        <input type="checkbox" id="obsGynPPH" name="obsGyn" className="form-check-input" />
                                                        <label htmlFor="obsGynPPH" className="form-check-label">PPH</label><br />

                                                        <input type="checkbox" id="obsGynPreDelivery" name="obsGyn" className="form-check-input" />
                                                        <label htmlFor="obsGynPreDelivery" className="form-check-label">Pre-Hospital Delivery</label><br />

                                                        <input type="checkbox" id="otherObsGyn" name="obsGyn" className="form-check-input" />
                                                        <label htmlFor="otherObsGyn" className="form-check-label">Other Obs/Gynae</label><br />

                                                        <input
                                                            id='otherObsGynInput'
                                                            type="text"
                                                            className="form-control"
                                                            style={{ marginLeft: '-10px' }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="neurologicalAlteredLOC">Neurological:</label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="neurologicalAlteredLOC" name="neurological" className="form-check-input" />
                                                        <label htmlFor="neurologicalAlteredLOC" className="form-check-label">Altered LOC</label><br />

                                                        <input type="checkbox" id="neurologicalSeizures" name="neurological" className="form-check-input" />
                                                        <label htmlFor="neurologicalSeizures" className="form-check-label">Seizures</label><br />

                                                        <input type="checkbox" id="neurologicalStroke" name="neurological" className="form-check-input" />
                                                        <label htmlFor="neurologicalStroke" className="form-check-label">Stroke</label><br />

                                                        <input type="checkbox" id="otherNeurological" name="neurological" className="form-check-input" />
                                                        <label htmlFor="otherNeurological" className="form-check-label">Other Neurological</label><br />

                                                        <input
                                                            id='otherNeurologicalInput'
                                                            type="text"
                                                            className="form-control"
                                                            style={{ marginLeft: '-10px' }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="traumaBurns">Trauma:</label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="traumaBurns" name="trauma" className="form-check-input" />
                                                        <label htmlFor="traumaBurns" className="form-check-label">Burns</label><br />

                                                        <input type="checkbox" id="traumaDislocation" name="trauma" className="form-check-input" />
                                                        <label htmlFor="traumaDislocation" className="form-check-label">Dislocation / Sprain</label><br />

                                                        <input type="checkbox" id="traumaFracture" name="trauma" className="form-check-input" />
                                                        <label htmlFor="traumaFracture" className="form-check-label">Fracture</label><br />

                                                        <input type="checkbox" id="traumaHaemorrhage" name="trauma" className="form-check-input" />
                                                        <label htmlFor="traumaHaemorrhage" className="form-check-label">Haemorrhage</label><br />

                                                        <input type="checkbox" id="traumaHeadInjury" name="trauma" className="form-check-input" />
                                                        <label htmlFor="traumaHeadInjury" className="form-check-label">Head Injury</label><br />

                                                        <input type="checkbox" id="traumaMaxilloFacial" name="trauma" className="form-check-input" />
                                                        <label htmlFor="traumaMaxilloFacial" className="form-check-label">Maxillo-Facial Injury</label><br />

                                                        <input type="checkbox" id="traumaMultiple" name="trauma" className="form-check-input" />
                                                        <label htmlFor="traumaMultiple" className="form-check-label">Multiple Trauma</label><br />

                                                        <input type="checkbox" id="traumaOpenWound" name="trauma" className="form-check-input" />
                                                        <label htmlFor="traumaOpenWound" className="form-check-label">Open Wound</label><br />

                                                        <input type="checkbox" id="traumaShock" name="trauma" className="form-check-input" />
                                                        <label htmlFor="traumaShock" className="form-check-label">Shock</label><br />

                                                        <input type="checkbox" id="traumaSoftTissue" name="trauma" className="form-check-input" />
                                                        <label htmlFor="traumaSoftTissue" className="form-check-label">Soft Tissue Injury</label><br />

                                                        <input type="checkbox" id="traumaSpinal" name="trauma" className="form-check-input" />
                                                        <label htmlFor="traumaSpinal" className="form-check-label">Spinal Injury</label><br />

                                                        <input type="checkbox" id="otherTrauma" name="trauma" className="form-check-input" />
                                                        <label htmlFor="otherTrauma" className="form-check-label">Other Trauma</label><br />

                                                        <input
                                                            id='otherTraumaInput'
                                                            type="text"
                                                            className="form-control"
                                                            style={{ marginLeft: '-10px' }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <hr />
                                                </div>


                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="mechanismInjuryAssault">Mechanism of Injury: <span className='required-form'>*</span></label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="mechanismInjuryAssault" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjuryAssault" className="form-check-label">Assault / Brawling</label><br />

                                                        <input type="checkbox" id="mechanismInjuryAnimalAttack" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjuryAnimalAttack" className="form-check-label">Attack / Bite by Animal</label><br />

                                                        <input type="checkbox" id="mechanismInjuryChemical" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjuryChemical" className="form-check-label">Chemical Poisining</label><br />

                                                        <input type="checkbox" id="mechanismInjuryDrowning" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjuryDrowning" className="form-check-label">Drowning</label><br />

                                                        <input type="checkbox" id="mechanismInjuryElectrocution" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjuryElectrocution" className="form-check-label">Electrocution</label><br />

                                                        <input type="checkbox" id="mechanismInjuryCold" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjuryCold" className="form-check-label">Excessive Cold</label><br />

                                                        <input type="checkbox" id="mechanismInjuryHeat" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjuryHeat" className="form-check-label">Excessive Heat</label><br />

                                                        <input type="checkbox" id="mechanismInjuryFall" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjuryFall" className="form-check-label">Fall</label><br />

                                                        <input type="checkbox" id="mechanismInjuryFirearm" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjuryFirearm" className="form-check-label">Firearm Injury</label><br />

                                                        <input type="checkbox" id="mechanismInjuryChild" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjuryChild" className="form-check-label">Injury to Child</label><br />

                                                        <input type="checkbox" id="mechanismInjuryMachinery" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjuryMachinery" className="form-check-label">Machinery Accident</label><br />

                                                        <input type="checkbox" id="mechanismInjuryRTA" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjuryRTA" className="form-check-label">Road Traffic Accident</label><br />

                                                        <input type="checkbox" id="mechanismInjurySmoke" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjurySmoke" className="form-check-label">Smoke, Fire, Flames</label><br />

                                                        <input type="checkbox" id="mechanismInjurySports" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjurySports" className="form-check-label">Sports Injury</label><br />

                                                        <input type="checkbox" id="mechanismInjuryStabbing" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjuryStabbing" className="form-check-label">Stabbing</label><br />

                                                        <input type="checkbox" id="mechanismInjuryStumble" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjuryStumble" className="form-check-label">Stumble / Trip</label><br />

                                                        <input type="checkbox" id="mechanismInjuryWater" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjuryWater" className="form-check-label">Water Transport Acc</label><br />

                                                        <input type="checkbox" id="mechanismInjuryOther" name="mechanismOfInjury" className="form-check-input" />
                                                        <label htmlFor="mechanismInjuryOther" className="form-check-label">Other</label><br />

                                                        <input
                                                            id='mechanismInjuryOtherInput'
                                                            type="text"
                                                            className="form-control"
                                                            style={{ marginLeft: '-10px' }}
                                                        />
                                                    </div>

                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="medicalBackPain">Medical:</label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="medicalBackPain" name="medical" className="form-check-input" />
                                                        <label htmlFor="medicalBackPain" className="form-check-label">Back Pain</label><br />

                                                        <input type="checkbox" id="medicalDiabetes" name="medical" className="form-check-input" />
                                                        <label htmlFor="medicalDiabetes" className="form-check-label">Diabetes Mellitus Pain</label><br />

                                                        <input type="checkbox" id="medicalFever" name="medical" className="form-check-input" />
                                                        <label htmlFor="medicalFever" className="form-check-label">Fever</label><br />

                                                        <input type="checkbox" id="medicalHeadache" name="medical" className="form-check-input" />
                                                        <label htmlFor="medicalHeadache" className="form-check-label">Headache</label><br />

                                                        <input type="checkbox" id="medicalHypothermia" name="medical" className="form-check-input" />
                                                        <label htmlFor="medicalHypothermia" className="form-check-label">Hypothermia</label><br />

                                                        <input type="checkbox" id="medicalOther" name="medical" className="form-check-input" />
                                                        <label htmlFor="medicalOther" className="form-check-label">Other Medical</label><br />

                                                        <input
                                                            id='medicalOtherInput'
                                                            type="text"
                                                            className="form-control"
                                                            style={{ marginLeft: '-10px' }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="respiratoryAsthma">Respiratory:</label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="respiratoryAsthma" name="respiratory" className="form-check-input" />
                                                        <label htmlFor="respiratoryAsthma" className="form-check-label">Asthma</label><br />

                                                        <input type="checkbox" id="respiratoryCOPD" name="respiratory" className="form-check-input" />
                                                        <label htmlFor="respiratoryCOPD" className="form-check-label">COPD</label><br />

                                                        <input type="checkbox" id="respiratoryFBAO" name="respiratory" className="form-check-input" />
                                                        <label htmlFor="respiratoryFBAO" className="form-check-label">FBAO</label><br />

                                                        <input type="checkbox" id="respiratoryArrest" name="respiratory" className="form-check-input" />
                                                        <label htmlFor="respiratoryArrest" className="form-check-label">Respiratory Arrest</label><br />

                                                        <input type="checkbox" id="respiratorySmoke" name="respiratory" className="form-check-input" />
                                                        <label htmlFor="respiratorySmoke" className="form-check-label">Smoke Inhalation</label><br />

                                                        <input type="checkbox" id="respiratoryOther" name="respiratory" className="form-check-input" />
                                                        <label htmlFor="respiratoryOther" className="form-check-label">Other Respiratory</label><br />

                                                        <input
                                                            id='respiratoryOtherInput'
                                                            type="text"
                                                            className="form-control"
                                                            style={{ marginLeft: '-10px' }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="generalAbdominalPain">General:</label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="generalAbdominalPain" name="general" className="form-check-input" />
                                                        <label htmlFor="generalAbdominalPain" className="form-check-label">Abdominal Pain</label><br />

                                                        <input type="checkbox" id="generalAllergicReaction" name="general" className="form-check-input" />
                                                        <label htmlFor="generalAllergicReaction" className="form-check-label">Allergic Reaction</label><br />

                                                        <input type="checkbox" id="generalBehavioralDisorder" name="general" className="form-check-input" />
                                                        <label htmlFor="generalBehavioralDisorder" className="form-check-label">Behavioral Disorder</label><br />

                                                        <input type="checkbox" id="generalIllnessUnknown" name="general" className="form-check-input" />
                                                        <label htmlFor="generalIllnessUnknown" className="form-check-label">Illness Unknown</label><br />

                                                        <input type="checkbox" id="generalNausea" name="general" className="form-check-input" />
                                                        <label htmlFor="generalNausea" className="form-check-label">Nausea / Vomiting</label><br />

                                                        <input type="checkbox" id="generalPoisoning" name="general" className="form-check-input" />
                                                        <label htmlFor="generalPoisoning" className="form-check-label">Poisining</label><br />

                                                        <input type="checkbox" id="generalSyncope" name="general" className="form-check-input" />
                                                        <label htmlFor="generalSyncope" className="form-check-label">Syncope / Collapse</label><br />

                                                        <input type="checkbox" id="generalOther" name="general" className="form-check-input" />
                                                        <label htmlFor="generalOther" className="form-check-label">Other General</label><br />

                                                        <input
                                                            id='generalOtherInput'
                                                            type="text"
                                                            className="form-control"
                                                            style={{ marginLeft: '-10px' }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <hr />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="circumstancesAccident">Circumstances: <span className='required-form'>*</span></label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="circumstancesAccident" name="circumstances" className="form-check-input" />
                                                        <label htmlFor="circumstancesAccident" className="form-check-label">Accident</label><br />

                                                        <input type="checkbox" id="circumstancesEvent" name="circumstances" className="form-check-input" />
                                                        <label htmlFor="circumstancesEvent" className="form-check-label">Event of Undetermined Intent</label><br />

                                                        <input type="checkbox" id="circumstancesSelfHarm" name="circumstances" className="form-check-input" />
                                                        <label htmlFor="circumstancesSelfHarm" className="form-check-label">Intentional Self Harm</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="clinicalLifeThreatening">Clinical Status: <span className='required-form'>*</span></label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="clinicalLifeThreatening" name="clinicalStatus" className="form-check-input" />
                                                        <label htmlFor="clinicalLifeThreatening" className="form-check-label">Life Threatening</label><br />

                                                        <input type="checkbox" id="clinicalSerious" name="clinicalStatus" className="form-check-input" />
                                                        <label htmlFor="clinicalSerious" className="form-check-label">Serious Not Life Threat</label><br />

                                                        <input type="checkbox" id="clinicalNonSerious" name="clinicalStatus" className="form-check-input" />
                                                        <label htmlFor="clinicalNonSerious" className="form-check-label">Non Serious/Non Life Threat</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <hr />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="motorNone">Motor:</label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="motorNone" name="motor" className="form-check-input" />
                                                        <label htmlFor="motorNone" className="form-check-label">1. NONE</label><br />

                                                        <input type="checkbox" id="motorExtension" name="motor" className="form-check-input" />
                                                        <label htmlFor="motorExtension" className="form-check-label">2. EXTENSION</label><br />

                                                        <input type="checkbox" id="motorFlexion" name="motor" className="form-check-input" />
                                                        <label htmlFor="motorFlexion" className="form-check-label">3. FLEXION</label><br />

                                                        <input type="checkbox" id="motorWithdraw" name="motor" className="form-check-input" />
                                                        <label htmlFor="motorWithdraw" className="form-check-label">4. WITHDRAW</label><br />

                                                        <input type="checkbox" id="motorLocalize" name="motor" className="form-check-input" />
                                                        <label htmlFor="motorLocalize" className="form-check-label">5. LOCALIZE</label><br />

                                                        <input type="checkbox" id="motorObey" name="motor" className="form-check-input" />
                                                        <label htmlFor="motorObey" className="form-check-label">6. OBEY</label><br />
                                                    </div>
                                                </div>


                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="verbalNone">Verbal:</label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="verbalNone" name="verbal" className="form-check-input" />
                                                        <label htmlFor="verbalNone" className="form-check-label">1. NONE</label><br />

                                                        <input type="checkbox" id="verbalIncomprehensible" name="verbal" className="form-check-input" />
                                                        <label htmlFor="verbalIncomprehensible" className="form-check-label">2. INCOMPREHENSIBLE</label><br />

                                                        <input type="checkbox" id="verbalInappropriate" name="verbal" className="form-check-input" />
                                                        <label htmlFor="verbalInappropriate" className="form-check-label">3. INAPPROPRIATE</label><br />

                                                        <input type="checkbox" id="verbalConfused" name="verbal" className="form-check-input" />
                                                        <label htmlFor="verbalConfused" className="form-check-label">4. CONFUSED</label><br />

                                                        <input type="checkbox" id="verbalOriented" name="verbal" className="form-check-input" />
                                                        <label htmlFor="verbalOriented" className="form-check-label">5. ORIENTED</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="eyeNone">Eye Opening:</label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="eyeNone" name="eye" className="form-check-input" />
                                                        <label htmlFor="eyeNone" className="form-check-label">1. NONE</label><br />

                                                        <input type="checkbox" id="eyeToPain" name="eye" className="form-check-input" />
                                                        <label htmlFor="eyeToPain" className="form-check-label">2. TO PAIN</label><br />

                                                        <input type="checkbox" id="eyeToVoice" name="eye" className="form-check-input" />
                                                        <label htmlFor="eyeToVoice" className="form-check-label">3. TO VOICE</label><br />

                                                        <input type="checkbox" id="eyeSpontaneous" name="eye" className="form-check-input" />
                                                        <label htmlFor="eyeSpontaneous" className="form-check-label">4. SPONTANEOUS</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="gcsTotal">GCS Total:</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        id="gcsTotal"
                                                        name="gcsTotal"
                                                    />
                                                </div>

                                                <div className="col-md-12">
                                                    <hr />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="pulsePositive">Pulse:</label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="pulsePositive" name="pulse" className="form-check-input" />
                                                        <label htmlFor="pulsePositive" className="form-check-label">Positive</label><br />

                                                        <input type="checkbox" id="pulseRapid" name="pulse" className="form-check-input" />
                                                        <label htmlFor="pulseRapid" className="form-check-label">Rapid</label><br />

                                                        <input type="checkbox" id="pulseSlow" name="pulse" className="form-check-input" />
                                                        <label htmlFor="pulseSlow" className="form-check-label">Slow</label><br />

                                                        <input type="checkbox" id="pulseNegative" name="pulse" className="form-check-input" />
                                                        <label htmlFor="pulseNegative" className="form-check-label">Negative</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="airwayClear">Airway:</label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="airwayClear" name="airway" className="form-check-input" />
                                                        <label htmlFor="airwayClear" className="form-check-label">Clear</label><br />

                                                        <input type="checkbox" id="airwayPartial" name="airway" className="form-check-input" />
                                                        <label htmlFor="airwayPartial" className="form-check-label">Partially Obstructed</label><br />

                                                        <input type="checkbox" id="airwayObstructed" name="airway" className="form-check-input" />
                                                        <label htmlFor="airwayObstructed" className="form-check-label">Obstructed</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="breathingNormal">Breathing:</label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="breathingNormal" name="breathing" className="form-check-input" />
                                                        <label htmlFor="breathingNormal" className="form-check-label">Normal</label><br />

                                                        <input type="checkbox" id="breathingRapid" name="breathing" className="form-check-input" />
                                                        <label htmlFor="breathingRapid" className="form-check-label">Rapid</label><br />

                                                        <input type="checkbox" id="breathingSlow" name="breathing" className="form-check-input" />
                                                        <label htmlFor="breathingSlow" className="form-check-label">Slow</label><br />

                                                        <input type="checkbox" id="breathingShallow" name="breathing" className="form-check-input" />
                                                        <label htmlFor="breathingShallow" className="form-check-label">Shallow</label><br />

                                                        <input type="checkbox" id="breathingHyperventilate" name="breathing" className="form-check-input" />
                                                        <label htmlFor="breathingHyperventilate" className="form-check-label">Hyperventilate</label><br />

                                                        <input type="checkbox" id="breathingNone" name="breathing" className="form-check-input" />
                                                        <label htmlFor="breathingNone" className="form-check-label">None</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="gagReflexPresent">GAG Reflex:</label>

                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="gagReflexPresent" name="gagReflex" className="form-check-input" />
                                                        <label htmlFor="gagReflexPresent" className="form-check-label">Present</label><br />

                                                        <input type="checkbox" id="gagReflexAbsent" name="gagReflex" className="form-check-input" />
                                                        <label htmlFor="gagReflexAbsent" className="form-check-label">Absent</label><br />
                                                    </div>
                                                </div>


                                                <div className="col-md-12">
                                                    <hr />
                                                </div>


                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="chiefComplaintInput">Chief Complaint:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="chiefComplaintInput"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="historyInput">History:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="historyInput"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="signsSymptomsInput">Signs & Symptoms:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="signsSymptomsInput"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="allergiesInput">Allergies:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="allergiesInput"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="medicationsInput">Medications:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="medicationsInput"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="pastMedicalHistoryInput">Past Medical History:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="pastMedicalHistoryInput"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="lastMealIntakeInput">Last Meal Intake:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="lastMealIntakeInput"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="timeInput">Time:</label>
                                                    <input
                                                        type="time"
                                                        className="form-control"
                                                        id="timeInput"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="eventPriorInput">Event Prior to Incident:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="eventPriorInput"
                                                    />
                                                </div>

                                                <div className="col-md-12">
                                                    <hr />
                                                </div>

                                                <div className="col-md-12">


                                                    <div className="table-responsive">
                                                        <table className="table table-bordered table-responsive">
                                                            <thead>
                                                                <tr>
                                                                    <th scope="col" className='text-center'></th>
                                                                    <th scope="col" colSpan="5" className='text-center'>Vital Signs <span className='required-form'>*</span></th>  {/* Merging 5 columns under "Vital Signs" */}
                                                                    <th scope="col" className='text-center'></th>
                                                                </tr>
                                                                <tr className='text-center'>
                                                                    <th scope="col" style={{ width: '14%' }}>Level of Consciousness <span className='required-form'>*</span></th>  {/* BP column */}
                                                                    <th scope="col" style={{ width: '14%' }}>BP <span className='required-form'>*</span></th>  {/* BP column */}
                                                                    <th scope="col" style={{ width: '14%' }}>PR <span className='required-form'>*</span></th>  {/* Respiratory Rate column */}
                                                                    <th scope="col" style={{ width: '14%' }}>RR <span className='required-form'>*</span></th>  {/* Temperature column */}
                                                                    <th scope="col" style={{ width: '14%' }}>SPO2 <span className='required-form'>*</span></th>  {/* Oxygen Saturation column */}
                                                                    <th scope="col" style={{ width: '14%' }}>TEMP <span className='required-form'>*</span></th>  {/* Empty cell for the last column */}
                                                                    <th scope="col" style={{ width: '14%' }}>Time </th>  {/* BP column */}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <th scope="row" >
                                                                        <div className="form-check form-check-inline">
                                                                            <input type="checkbox" id="row1LOCA" name="row1LOCA" className="form-check-input" />
                                                                            <label htmlFor="row1LOCA" className="form-check-label">A</label>
                                                                        </div>
                                                                        <div className="form-check form-check-inline">
                                                                            <input type="checkbox" id="row1LOCV" name="row1LOCV" className="form-check-input" />
                                                                            <label htmlFor="row1LOCV" className="form-check-label">V</label>
                                                                        </div>
                                                                        <div className="form-check form-check-inline">
                                                                            <input type="checkbox" id="row1LOCP" name="row1LOCP" className="form-check-input" />
                                                                            <label htmlFor="row1LOCP" className="form-check-label">P</label>
                                                                        </div>
                                                                        <div className="form-check form-check-inline">
                                                                            <input type="checkbox" id="row1LOCU" name="row1LOCU" className="form-check-input" />
                                                                            <label htmlFor="row1LOCU" className="form-check-label">U</label>
                                                                        </div>
                                                                    </th>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row1BP' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row1PR' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row1RR' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row1SPO2' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row1TEMP' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row1Time' />
                                                                        </div>
                                                                    </td>
                                                                </tr>

                                                                <tr>
                                                                    <th scope="row" >
                                                                        <div className="form-check form-check-inline">
                                                                            <input type="checkbox" id="row2LOCA" name="row2LOCA" className="form-check-input" />
                                                                            <label htmlFor="row2LOCA" className="form-check-label">A</label>
                                                                        </div>
                                                                        <div className="form-check form-check-inline">
                                                                            <input type="checkbox" id="row2LOCV" name="row2LOCV" className="form-check-input" />
                                                                            <label htmlFor="row2LOCV" className="form-check-label">V</label>
                                                                        </div>
                                                                        <div className="form-check form-check-inline">
                                                                            <input type="checkbox" id="row2LOCP" name="row2LOCP" className="form-check-input" />
                                                                            <label htmlFor="row2LOCP" className="form-check-label">P</label>
                                                                        </div>
                                                                        <div className="form-check form-check-inline">
                                                                            <input type="checkbox" id="row2LOCU" name="row2LOCU" className="form-check-input" />
                                                                            <label htmlFor="row2LOCU" className="form-check-label">U</label>
                                                                        </div>
                                                                    </th>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row2BP' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row2PR' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row2RR' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row2SPO2' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row2TEMP' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row2Time' />
                                                                        </div>
                                                                    </td>
                                                                </tr>

                                                                <tr>
                                                                    <th scope="row" >
                                                                        <div className="form-check form-check-inline">
                                                                            <input type="checkbox" id="row3LOCA" name="row3LOCA" className="form-check-input" />
                                                                            <label htmlFor="row3LOCA" className="form-check-label">A</label>
                                                                        </div>
                                                                        <div className="form-check form-check-inline">
                                                                            <input type="checkbox" id="row3LOCV" name="row3LOCV" className="form-check-input" />
                                                                            <label htmlFor="row3LOCV" className="form-check-label">V</label>
                                                                        </div>
                                                                        <div className="form-check form-check-inline">
                                                                            <input type="checkbox" id="row3LOCP" name="row3LOCP" className="form-check-input" />
                                                                            <label htmlFor="row3LOCP" className="form-check-label">P</label>
                                                                        </div>
                                                                        <div className="form-check form-check-inline">
                                                                            <input type="checkbox" id="row3LOCU" name="row3LOCU" className="form-check-input" />
                                                                            <label htmlFor="row3LOCU" className="form-check-label">U</label>
                                                                        </div>
                                                                    </th>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row3BP' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row3PR' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row3RR' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row3SPO2' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row3TEMP' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row3Time' />
                                                                        </div>
                                                                    </td>
                                                                </tr>

                                                                <tr>
                                                                    <th scope="row" >
                                                                        <div className="form-check form-check-inline">
                                                                            <input type="checkbox" id="row4LOCA" name="row4LOCA" className="form-check-input" />
                                                                            <label htmlFor="row4LOCA" className="form-check-label">A</label>
                                                                        </div>
                                                                        <div className="form-check form-check-inline">
                                                                            <input type="checkbox" id="row4LOCV" name="row4LOCV" className="form-check-input" />
                                                                            <label htmlFor="row4LOCV" className="form-check-label">V</label>
                                                                        </div>
                                                                        <div className="form-check form-check-inline">
                                                                            <input type="checkbox" id="row4LOCP" name="row4LOCP" className="form-check-input" />
                                                                            <label htmlFor="row4LOCP" className="form-check-label">P</label>
                                                                        </div>
                                                                        <div className="form-check form-check-inline">
                                                                            <input type="checkbox" id="row4LOCU" name="row4LOCU" className="form-check-input" />
                                                                            <label htmlFor="row4LOCU" className="form-check-label">U</label>
                                                                        </div>
                                                                    </th>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row4BP' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row4PR' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row4RR' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row4SPO2' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row4TEMP' />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row4Time' />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <hr />
                                                </div>

                                                <div className="col-md-12">

                                                    <div className="table-responsive">
                                                        <table className="table table-bordered">
                                                            <thead>
                                                                <tr>
                                                                    <th scope="col" className='text-center'>Pupil</th>
                                                                    <th scope="col" className='text-center'>L</th>
                                                                    <th scope="col" className='text-center'>R</th>
                                                                    <th scope="col" className='text-center'>Lungs</th>
                                                                    <th scope="col" className='text-center'>L</th>
                                                                    <th scope="col" className='text-center'>R</th>
                                                                    <th scope="col" colSpan="3" className='text-center'>Limp Mov't</th>
                                                                    <th scope="col" className='text-center'>02-L/m</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <th scope="row" >
                                                                        PEARRL
                                                                    </th>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="Pearrl-L" name="Pearrl-L" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="Pearrl-R" name="Pearrl-R" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        CLEAR
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="Clear-L" name="Clear-L" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="Clear-R" name="Clear-R" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        LIMB
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline">
                                                                            <label htmlFor="limbYes" className="form-check-label">Yes</label>
                                                                            <input type="checkbox" id="limbYes" name="limbYes" className="form-check-input" />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline">
                                                                            <label htmlFor="limbNo" className="form-check-label">No</label>
                                                                            <input type="checkbox" id="limbNo" name="limbNo" className="form-check-input" />
                                                                        </div>
                                                                    </td>

                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row1lm' />
                                                                        </div>
                                                                    </td>
                                                                </tr>

                                                                <tr>
                                                                    <th scope="row" >
                                                                        PINPOINT
                                                                    </th>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="Pinpoint-L" name="Pinpoint-L" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="Pinpoint-R" name="Pinpoint-R" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        ABSENT
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="AbsentL" name="AbsentL" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="AbsentR" name="AbsentR" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        ARMS
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline">
                                                                            <label htmlFor="armsYes" className="form-check-label">Yes</label>
                                                                            <input type="checkbox" id="armsYes" name="armsYes" className="form-check-input" />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline">
                                                                            <label htmlFor="armsNo" className="form-check-label">No</label>
                                                                            <input type="checkbox" id="armsNo" name="armsNo" className="form-check-input" />
                                                                        </div>
                                                                    </td>

                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row2LM' />
                                                                        </div>
                                                                    </td>
                                                                </tr>

                                                                <tr>
                                                                    <th scope="row" >
                                                                        D.LATED
                                                                    </th>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="dLatedL" name="dLatedL" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="dLatedR" name="dLatedR" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        DECREASE
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="decreaseL" name="decreaseL" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="decreaseR" name="decreaseR" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        ARMS
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline">
                                                                            <label htmlFor="armsYes" className="form-check-label">Yes</label>
                                                                            <input type="checkbox" id="arms2Yes" name="arms2Yes" className="form-check-input" />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline">
                                                                            <label htmlFor="armsNo" className="form-check-label">No</label>
                                                                            <input type="checkbox" id="arms2No" name="arms2No" className="form-check-input" />
                                                                        </div>
                                                                    </td>

                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row3LM' />
                                                                        </div>
                                                                    </td>
                                                                </tr>

                                                                <tr>
                                                                    <th scope="row" >
                                                                        SLUGGISH
                                                                    </th>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="sluggishL" name="sluggishL" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="sluggishR" name="sluggishR" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        CRACKLES
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="cracklesL" name="cracklesL" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="cracklesR" name="cracklesR" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        LEGS
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline">
                                                                            <label htmlFor="legs1Yes" className="form-check-label">Yes</label>
                                                                            <input type="checkbox" id="legs1Yes" name="legs1Yes" className="form-check-input" />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline">
                                                                            <label htmlFor="legs1No" className="form-check-label">No</label>
                                                                            <input type="checkbox" id="legs1No" name="legs1No" className="form-check-input" />
                                                                        </div>
                                                                    </td>

                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row4LM' />
                                                                        </div>
                                                                    </td>
                                                                </tr>

                                                                <tr>
                                                                    <th scope="row" >
                                                                        FIXED
                                                                    </th>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="fixedL" name="fixedL" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="fixedR" name="fixedR" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        RONCHI
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="ronchiL" name="ronchiL" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="ronchiR" name="ronchiR" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        LEGS
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline">
                                                                            <label htmlFor="legs2Yes" className="form-check-label">Yes</label>
                                                                            <input type="checkbox" id="legs2Yes" name="legs2Yes" className="form-check-input" />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline">
                                                                            <label htmlFor="legs1No" className="form-check-label">No</label>
                                                                            <input type="checkbox" id="legs2No" name="legs2No" className="form-check-input" />
                                                                        </div>
                                                                    </td>

                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row5LM' />
                                                                        </div>
                                                                    </td>
                                                                </tr>

                                                                <tr>
                                                                    <th scope="row" >
                                                                        CATARACT
                                                                    </th>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="cataractL" name="cataractL" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="cataractR" name="cataractR" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        WHEEZE
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="wheezeL" name="wheezeL" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline ">
                                                                            <input type="checkbox" id="wheezeR" name="wheezeR" className="form-check-input " />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        LEGS
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline">
                                                                            <label htmlFor="legs2Yes" className="form-check-label">Yes</label>
                                                                            <input type="checkbox" id="legs3Yes" name="legs3Yes" className="form-check-input" />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-check form-check-inline">
                                                                            <label htmlFor="legs1No" className="form-check-label">No</label>
                                                                            <input type="checkbox" id="legs3No" name="legs3No" className="form-check-input" />
                                                                        </div>
                                                                    </td>

                                                                    <td>
                                                                        <div className="col-md-12">
                                                                            <input type="text" className="form-control" id='row6LM' />
                                                                        </div>
                                                                    </td>
                                                                </tr>

                                                                <tr>
                                                                    <td colSpan="12" className="text-start">

                                                                        <div className="row">
                                                                            <div className="col-md-6">
                                                                                <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2"><b>Wound:</b></label>

                                                                                <br /> <hr />
                                                                                <div className="form-check">
                                                                                    <input type="checkbox" id="bleedingControl" name="bleedingControl" className="form-check-input" />
                                                                                    <label htmlFor="bleedingControl" className="form-check-label">Bleeding Control</label><br />

                                                                                    <input type="checkbox" id="appliedAntiseptic" name="appliedAntiseptic" className="form-check-input" />
                                                                                    <label htmlFor="appliedAntiseptic" className="form-check-label">Applied Antiseptic</label><br />
                                                                                </div>
                                                                            </div>

                                                                            <div className="col-md-6">
                                                                                <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2"><b>Care:</b></label>

                                                                                <br /> <hr />
                                                                                <div className="form-check">
                                                                                    <input type="checkbox" id="cleaning" name="cleaning" className="form-check-input" />
                                                                                    <label htmlFor="cardiac" className="form-check-label">Cleaning</label><br />

                                                                                    <input type="checkbox" id="dressingBandaging" name="dressingBandaging" className="form-check-input" />
                                                                                    <label htmlFor="cardiac" className="form-check-label">Dressing & Bandaging</label><br />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>

                                                                <tr>
                                                                    <td colSpan="12" className="text-start">

                                                                        <div className="row">
                                                                            <div className="col-md-12">
                                                                                <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2"><b>Immobilisation:</b></label>

                                                                                <br /> <hr />
                                                                                <div className="form-check">
                                                                                    <input type="checkbox" id="c-collar" name="c-collar" className="form-check-input" />
                                                                                    <label htmlFor="c-collar" className="form-check-label">C-Collar</label><br />

                                                                                    <input type="checkbox" id="spineboard" name="spineboard" className="form-check-input" />
                                                                                    <label htmlFor="spineboard" className="form-check-label">Spineboard</label><br />

                                                                                    <input type="checkbox" id="KED" name="KED" className="form-check-input" />
                                                                                    <label htmlFor="KED" className="form-check-label">KED</label><br />

                                                                                    <input type="checkbox" id="splints" name="splints" className="form-check-input" />
                                                                                    <label htmlFor="splints" className="form-check-label">Splints</label><br />

                                                                                    <input type="checkbox" id="scoopStretcher" name="scoopStretcher" className="form-check-input" />
                                                                                    <label htmlFor="scoopStretcher" className="form-check-label">Scoop Stretcher</label><br />


                                                                                </div>
                                                                            </div>

                                                                        </div>
                                                                    </td>
                                                                </tr>

                                                                <tr>
                                                                    <td colSpan="12" className="text-start">

                                                                        <div className="row">
                                                                            <div className="col-md-12">
                                                                                <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2"><b>Immobilisation:</b></label>

                                                                                <br /> <hr />
                                                                                <div className="form-check">

                                                                                    <div className="d-flex align-items-center">
                                                                                        <label style={{ color: 'black', marginRight: '10px', }} htmlFor="ambulanceInput2">Others:</label>
                                                                                        <input
                                                                                            id='immobilisationOthers'
                                                                                            type="text"
                                                                                            className="form-control"
                                                                                        />
                                                                                    </div>

                                                                                </div>
                                                                            </div>

                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <hr />
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="row">
                                                        <div className="col-md-6">

                                                        </div>

                                                        <div class="col-md-6">
                                                            <div class="form-check">
                                                                <div class="form-check">
                                                                    <input type="checkbox" id="deformity" name="condition" class="form-check-input" />
                                                                    <label for="deformity" class="form-check-label">D - Deformity</label><br />

                                                                    <input type="checkbox" id="confusion" name="condition" class="form-check-input" />
                                                                    <label for="confusion" class="form-check-label">C - Confusion</label><br />

                                                                    <input type="checkbox" id="abrasion" name="condition" class="form-check-input" />
                                                                    <label for="abrasion" class="form-check-label">A - Abrasion</label><br />

                                                                    <input type="checkbox" id="puncture" name="condition" class="form-check-input" />
                                                                    <label for="puncture" class="form-check-label">P - Puncture</label><br />

                                                                    <input type="checkbox" id="burn" name="condition" class="form-check-input" />
                                                                    <label for="burn" class="form-check-label">B - Burn</label><br />

                                                                    <input type="checkbox" id="tenderness" name="condition" class="form-check-input" />
                                                                    <label for="tenderness" class="form-check-label">T - Tenderness</label><br />

                                                                    <input type="checkbox" id="laceration" name="condition" class="form-check-input" />
                                                                    <label for="laceration" class="form-check-label">L - Laceration</label><br />

                                                                    <input type="checkbox" id="swelling" name="condition" class="form-check-input" />
                                                                    <label for="swelling" class="form-check-label">S - Swelling</label><br /><br />

                                                                    <input type="checkbox" id="fracture" name="condition" class="form-check-input" />
                                                                    <label for="fracture" class="form-check-label">F - Fracture</label><br />

                                                                    <input type="checkbox" id="avulsion" name="condition" class="form-check-input" />
                                                                    <label for="avulsion" class="form-check-label">AV - Avulsion</label><br />

                                                                    <input type="checkbox" id="dislocation" name="condition" class="form-check-input" />
                                                                    <label for="dislocation" class="form-check-label">DISL - Dislocation</label><br />

                                                                    <input type="checkbox" id="pain" name="condition" class="form-check-input" />
                                                                    <label for="pain" class="form-check-label">PN - Pain</label><br />

                                                                    <input type="checkbox" id="rashes" name="condition" class="form-check-input" />
                                                                    <label for="rashes" class="form-check-label">R - Rashes</label><br />

                                                                    <input type="checkbox" id="numbness" name="condition" class="form-check-input" />
                                                                    <label for="numbness" class="form-check-label">N - Numbness</label><br />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>



                                                <div className="col-md-12">
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <label
                                                                style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                htmlFor="endorsedByTeam"
                                                            >
                                                                Endorsed By: Team
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                id="endorsedByTeam"
                                                                name="endorsedByTeam"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <label
                                                                style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                htmlFor="tlInput"
                                                            >
                                                                TL:
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                id="tlInput"
                                                                name="tlInput"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <label
                                                                style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                htmlFor="r1Input"
                                                            >
                                                                R1:
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                id="r1Input"
                                                                name="r1Input"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <label
                                                                style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                htmlFor="r2Input"
                                                            >
                                                                R2:
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                id="r2Input"
                                                                name="r2Input"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <label
                                                                style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                htmlFor="r3Input"
                                                            >
                                                                R3:
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                id="r3Input"
                                                                name="r3Input"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <label
                                                                style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                htmlFor="r4Input"
                                                            >
                                                                R4:
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                id="r4Input"
                                                                name="r4Input"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <label
                                                                style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                                htmlFor="r5Input"
                                                            >
                                                                R5:
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                id="r5Input"
                                                                name="r5Input"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <hr />
                                                    <h5 className="card-title text-center mb-3" style={{ color: 'black' }}>
                                                        Incident Information
                                                    </h5>
                                                </div>

                                                <div className="col-md-6">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                        htmlFor="incidentType"
                                                    >
                                                        Incident Type:
                                                    </label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="vehicularAccident" name="incidentType" className="form-check-input" />
                                                        <label htmlFor="vehicularAccident" className="form-check-label">Vehicular Accident</label><br />

                                                        <input type="checkbox" id="medicalAttention" name="incidentType" className="form-check-input" />
                                                        <label htmlFor="medicalAttention" className="form-check-label">Medical Attention</label><br />

                                                        <input type="checkbox" id="patientTransport" name="incidentType" className="form-check-input" />
                                                        <label htmlFor="patientTransport" className="form-check-label">Patient Transport</label><br />

                                                        <input type="checkbox" id="openWaterIncident" name="incidentType" className="form-check-input" />
                                                        <label htmlFor="openWaterIncident" className="form-check-label">Open Water Incident</label><br />

                                                        <input type="checkbox" id="drowningIncident" name="incidentType" className="form-check-input" />
                                                        <label htmlFor="drowningIncident" className="form-check-label">Drowning Incident</label><br />

                                                        <input type="checkbox" id="maritimeIncident" name="incidentType" className="form-check-input" />
                                                        <label htmlFor="maritimeIncident" className="form-check-label">Maritime Incident</label><br />

                                                        <input type="checkbox" id="fireIncident" name="incidentType" className="form-check-input" />
                                                        <label htmlFor="fireIncident" className="form-check-label">Fire Incident</label><br />

                                                        <input type="checkbox" id="specialCases" name="incidentType" className="form-check-input" />
                                                        <label htmlFor="specialCases" className="form-check-label">Special Cases</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                        htmlFor="incidentSummary"
                                                    >
                                                        Incident Summary:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="incidentSummary"
                                                        name="incidentSummary"
                                                    />
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="noPatientFound" name="incidentSummaryOptions" className="form-check-input" />
                                                        <label htmlFor="noPatientFound" className="form-check-label">No Patient Found</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <hr />
                                                    <h5 className="card-title text-center mb-3" style={{ color: 'black' }}>
                                                        Incident Location
                                                    </h5>
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                        htmlFor="incident_sameAsResidence"
                                                    >
                                                        Incident Location:
                                                    </label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="incident_sameAsResidence" name="incident_incidentLocationOptions" className="form-check-input" />
                                                        <label htmlFor="sameAsResidence" className="form-check-label">Same as Residence</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                        htmlFor="incident_landmarkPlace"
                                                    >
                                                        Landmark / Place:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="incident_landmarkPlace"
                                                        name="incident_landmarkPlace"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                        htmlFor="incident_roadStreetName"
                                                    >
                                                        Road / Street Name:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="incident_roadStreetName"
                                                        name="incident_roadStreetName"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                        htmlFor="incident_purok"
                                                    >
                                                        Purok:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="incident_purok"
                                                        name="incident_purok"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                        htmlFor="incident_barangay"
                                                    >
                                                        Barangay:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="incident_barangay"
                                                        name="incident_barangay"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                        htmlFor="incident_municipalityCity"
                                                    >
                                                        Municipality / City:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="incident_municipalityCity"
                                                        name="incident_municipalityCity"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                        htmlFor="incident_province"
                                                    >
                                                        Province:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="incident_province"
                                                        name="incident_province"
                                                    />
                                                </div>



                                                <div className="col-md-12">
                                                    <hr />
                                                    <h5 className="card-title text-center mb-3" style={{ color: 'black' }}>
                                                        Transport Location
                                                    </h5>
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                        htmlFor="transport_incidentLocation"
                                                    >
                                                        Incident Location:
                                                    </label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="transport_sameAsResidence" name="transport_incidentLocationOption" className="form-check-input" />
                                                        <label htmlFor="sameAsResidence" className="form-check-label">Same as Residence</label><br />

                                                        <input type="checkbox" id="transport_refusedTransport" name="transport_incidentLocationOption" className="form-check-input" />
                                                        <label htmlFor="refusedTransport" className="form-check-label">Refused Transport</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                        htmlFor="transport_landmarkPlace"
                                                    >
                                                        Landmark / Place:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="transport_landmarkPlace"
                                                        name="transport_landmarkPlace"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                        htmlFor="roadStreetName"
                                                    >
                                                        Road / Street Name:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="transport_roadStreetName"
                                                        name="transport_roadStreetName"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                        htmlFor="transport_purok"
                                                    >
                                                        Purok:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="transport_purok"
                                                        name="transport_purok"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                        htmlFor="transport_barangay"
                                                    >
                                                        Barangay:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="transport_barangay"
                                                        name="transport_barangay"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                        htmlFor="transport_municipalityCity"
                                                    >
                                                        Municipality / City:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="transport_municipalityCity"
                                                        name="transport_municipalityCity"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                        htmlFor="transport_province"
                                                    >
                                                        Province:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="transport_province"
                                                        name="transport_province"
                                                    />
                                                </div>

                                                <div className="col-md-12">
                                                    <hr />
                                                </div>

                                                <div className="col-md-6">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                        htmlFor="vehicularAccidentDetails"
                                                    >
                                                        Part 1. Vehicular Accident Incident Details Location
                                                    </label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input
                                                            type="checkbox"
                                                            id="selfAccident"
                                                            name="vehicularAccidentType"
                                                            className="form-check-input"
                                                        />
                                                        <label htmlFor="selfAccident" className="form-check-label">Self Accident</label><br />

                                                        <input
                                                            type="checkbox"
                                                            id="motorVehicleCollision"
                                                            name="vehicularAccidentType"
                                                            className="form-check-input"
                                                        />
                                                        <label htmlFor="motorVehicleCollision" className="form-check-label">Motor Vehicle Collision</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                        htmlFor="incidentSummary"
                                                    >
                                                        V.A Incident Summary: (Indicate if has motor vehicle collision ex. MC VS MC)
                                                    </label>
                                                    <br /> <hr />
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="incidentSummary"
                                                        name="incidentSummary"
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                        htmlFor="severity"
                                                    >
                                                        Severity:
                                                    </label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input
                                                            type="checkbox"
                                                            id="fatal"
                                                            name="severity"
                                                            className="form-check-input"
                                                        />
                                                        <label htmlFor="fatal" className="form-check-label">Fatal</label><br />

                                                        <input
                                                            type="checkbox"
                                                            id="injury"
                                                            name="severity"
                                                            className="form-check-input"
                                                        />
                                                        <label htmlFor="injury" className="form-check-label">Injury</label><br />

                                                        <input
                                                            type="checkbox"
                                                            id="propertyDamage"
                                                            name="severity"
                                                            className="form-check-input"
                                                        />
                                                        <label htmlFor="propertyDamage" className="form-check-label">Property Damage</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                        htmlFor="incidentMainCause"
                                                    >
                                                        Incident Main Cause:
                                                    </label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input
                                                            type="checkbox"
                                                            id="humanError"
                                                            name="incidentMainCause"
                                                            className="form-check-input"
                                                        />
                                                        <label htmlFor="humanError" className="form-check-label">Human Error</label><br />

                                                        <input
                                                            type="checkbox"
                                                            id="vehicleDefect"
                                                            name="incidentMainCause"
                                                            className="form-check-input"
                                                        />
                                                        <label htmlFor="vehicleDefect" className="form-check-label">Vehicle Defect</label><br />

                                                        <input
                                                            type="checkbox"
                                                            id="roadDefect"
                                                            name="incidentMainCause"
                                                            className="form-check-input"
                                                        />
                                                        <label htmlFor="roadDefect" className="form-check-label">Road Defect</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }}
                                                        htmlFor="collisionType"
                                                    >
                                                        Collision Type:
                                                    </label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="rearEnd" name="collisionType" className="form-check-input" />
                                                        <label htmlFor="rearEnd" className="form-check-label">Rear End</label><br />

                                                        <input type="checkbox" id="sideSwipe" name="collisionType" className="form-check-input" />
                                                        <label htmlFor="sideSwipe" className="form-check-label">Side Swipe</label><br />

                                                        <input type="checkbox" id="headOn" name="collisionType" className="form-check-input" />
                                                        <label htmlFor="headOn" className="form-check-label">Head On</label><br />

                                                        <input type="checkbox" id="hitObject" name="collisionType" className="form-check-input" />
                                                        <label htmlFor="hitObject" className="form-check-label">Hit Object in Road</label><br />

                                                        <input type="checkbox" id="hitPedestrian" name="collisionType" className="form-check-input" />
                                                        <label htmlFor="hitPedestrian" className="form-check-label">Hit Pedestrian</label><br />

                                                        <input type="checkbox" id="sideImpact" name="collisionType" className="form-check-input" />
                                                        <label htmlFor="sideImpact" className="form-check-label">Side Impact</label><br />

                                                        <input type="checkbox" id="rollover" name="collisionType" className="form-check-input" />
                                                        <label htmlFor="rollover" className="form-check-label">Rollover</label><br />

                                                        <input type="checkbox" id="multipleVehicle" name="collisionType" className="form-check-input" />
                                                        <label htmlFor="multipleVehicle" className="form-check-label">Multiple Vehicle</label><br />

                                                        <input type="checkbox" id="hitParkedVehicle" name="collisionType" className="form-check-input" />
                                                        <label htmlFor="hitParkedVehicle" className="form-check-label">Hit Parked Vehicle</label><br />

                                                        <input type="checkbox" id="hitAnimal" name="collisionType" className="form-check-input" />
                                                        <label htmlFor="hitAnimal" className="form-check-label">Hit Animal</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label
                                                        style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }}
                                                        htmlFor="incidentDescription"
                                                    >
                                                        Incident Description:
                                                    </label>
                                                    <br /> <hr />
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="incidentDescription"
                                                        name="incidentDescription"
                                                    />
                                                </div>

                                                <div className="col-md-12">
                                                    <hr />
                                                </div>

                                                <div className="col-md-6">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Part 2. Vehicular Accident Vehicle Details</label>
                                                    <br /> <hr />
                                                    <input
                                                        id='vehicularAccidentDetails'
                                                        type="text"
                                                        className="form-control"
                                                    />
                                                </div>


                                                <div className="col-md-6">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="classification">
                                                        Classification:
                                                    </label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input
                                                            type="checkbox"
                                                            id="classificationPrivate"
                                                            name="classification"
                                                            value="Private"
                                                            className="form-check-input"
                                                        />
                                                        <label htmlFor="classificationPrivate" className="form-check-label">Private</label><br />

                                                        <input
                                                            type="checkbox"
                                                            id="classificationPublic"
                                                            name="classification"
                                                            value="Public"
                                                            className="form-check-input"
                                                        />
                                                        <label htmlFor="classificationPublic" className="form-check-label">Public</label><br />

                                                        <input
                                                            type="checkbox"
                                                            id="classificationGovernment"
                                                            name="classification"
                                                            value="Government"
                                                            className="form-check-input"
                                                        />
                                                        <label htmlFor="classificationGovernment" className="form-check-label">Government</label><br />

                                                        <input
                                                            type="checkbox"
                                                            id="classificationDiplomat"
                                                            name="classification"
                                                            value="Diplomat"
                                                            className="form-check-input"
                                                        />
                                                        <label htmlFor="classificationDiplomat" className="form-check-label">Diplomat</label><br />
                                                    </div>
                                                </div>


                                                <div className="col-md-12">
                                                    <hr />
                                                </div>

                                                <div className="col-md-6">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Type of Vehicle Involved:</label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="motorcycle" name="vehicleType" value="Motorcycle" className="form-check-input" />
                                                        <label htmlFor="motorcycle" className="form-check-label">Motorcycle</label><br />

                                                        <input type="checkbox" id="bike" name="vehicleType" value="Bike" className="form-check-input" />
                                                        <label htmlFor="bike" className="form-check-label">Bike</label><br />

                                                        <input type="checkbox" id="jeepney" name="vehicleType" value="Jeepney" className="form-check-input" />
                                                        <label htmlFor="jeepney" className="form-check-label">Jeepney</label><br />

                                                        <input type="checkbox" id="ambulance" name="vehicleType" value="Ambulance" className="form-check-input" />
                                                        <label htmlFor="ambulance" className="form-check-label">Ambulance</label><br />

                                                        <input type="checkbox" id="heavyEquipment" name="vehicleType" value="Heavy Equipment" className="form-check-input" />
                                                        <label htmlFor="heavyEquipment" className="form-check-label">Heavy Equipment</label><br />

                                                        <input type="checkbox" id="tricycle" name="vehicleType" value="Tricycle" className="form-check-input" />
                                                        <label htmlFor="tricycle" className="form-check-label">Tricycle</label><br />

                                                        <input type="checkbox" id="eBike" name="vehicleType" value="E-Bike" className="form-check-input" />
                                                        <label htmlFor="eBike" className="form-check-label">E-Bike</label><br />

                                                        <input type="checkbox" id="horseDriven" name="vehicleType" value="Horse Driven" className="form-check-input" />
                                                        <label htmlFor="horseDriven" className="form-check-label">Horse Driven</label><br />

                                                        <input type="checkbox" id="pushCart" name="vehicleType" value="Push Cart" className="form-check-input" />
                                                        <label htmlFor="pushCart" className="form-check-label">Push Cart</label><br />

                                                        <input type="checkbox" id="car" name="vehicleType" value="Car" className="form-check-input" />
                                                        <label htmlFor="car" className="form-check-label">Car</label><br />

                                                        <input type="checkbox" id="eTricycle" name="vehicleType" value="E-Tricycle" className="form-check-input" />
                                                        <label htmlFor="eTricycle" className="form-check-label">E-Tricycle</label><br />

                                                        <input type="checkbox" id="pedicab" name="vehicleType" value="Pedicab" className="form-check-input" />
                                                        <label htmlFor="pedicab" className="form-check-label">Pedicab</label><br />

                                                        <input type="checkbox" id="fourWheelsAtv" name="vehicleType" value="4 Wheels ATV" className="form-check-input" />
                                                        <label htmlFor="fourWheelsAtv" className="form-check-label">4 Wheels ATV</label><br />

                                                        <input type="checkbox" id="waterVessel" name="vehicleType" value="Water Vessel" className="form-check-input" />
                                                        <label htmlFor="waterVessel" className="form-check-label">Water Vessel</label><br />

                                                        <input type="checkbox" id="truck" name="vehicleType" value="Truck" className="form-check-input" />
                                                        <label htmlFor="truck" className="form-check-label">Truck</label><br />

                                                        <input type="checkbox" id="hauler" name="vehicleType" value="Hauler" className="form-check-input" />
                                                        <label htmlFor="hauler" className="form-check-label">Hauler</label><br />

                                                        <input type="checkbox" id="bus" name="vehicleType" value="Bus" className="form-check-input" />
                                                        <label htmlFor="bus" className="form-check-label">Bus</label><br />

                                                        <input type="checkbox" id="armoredCar" name="vehicleType" value="Armored Car" className="form-check-input" />
                                                        <label htmlFor="armoredCar" className="form-check-label">Armored Car</label><br />

                                                        <input type="checkbox" id="animal" name="vehicleType" value="Animal" className="form-check-input" />
                                                        <label htmlFor="animal" className="form-check-label">Animal</label><br />

                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }} htmlFor="vehicleOthers">Others:</label>
                                                        <input type="text" id="vehicleOthers" name="vehicleOthers" className="form-control" />
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="form-check">
                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }} htmlFor="vehicleMake">Make:</label>
                                                        <input type="text" id="vehicleMake" name="vehicleMake" className="form-control" />
                                                    </div>
                                                    <hr />
                                                    <div className="form-check">
                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }} htmlFor="vehicleModel">Model:</label>
                                                        <input type="text" id="vehicleModel" name="vehicleModel" className="form-control" />
                                                    </div>
                                                    <hr />
                                                    <div className="form-check">
                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }} htmlFor="plateNumber">Plate No.:</label>
                                                        <input type="text" id="plateNumber" name="plateNumber" className="form-control" />
                                                    </div>
                                                    <hr />
                                                    <div className="form-check">
                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }} htmlFor="tcBodyNumber">TC Body No.:</label>
                                                        <input type="text" id="tcBodyNumber" name="tcBodyNumber" className="form-control" />
                                                    </div>
                                                    <hr />
                                                </div>


                                                <div className="col-md-12">
                                                    <hr />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Manuever: </label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="leftTurn" name="maneuver" className="form-check-input" />
                                                        <label htmlFor="leftTurn" className="form-check-label">Left Turn</label><br />

                                                        <input type="checkbox" id="rightTurn" name="maneuver" className="form-check-input" />
                                                        <label htmlFor="rightTurn" className="form-check-label">Right Turn</label><br />

                                                        <input type="checkbox" id="uTurn" name="maneuver" className="form-check-input" />
                                                        <label htmlFor="uTurn" className="form-check-label">U Turn</label><br />

                                                        <input type="checkbox" id="crossTraffic" name="maneuver" className="form-check-input" />
                                                        <label htmlFor="crossTraffic" className="form-check-label">Cross Traffic</label><br />

                                                        <input type="checkbox" id="merging" name="maneuver" className="form-check-input" />
                                                        <label htmlFor="merging" className="form-check-label">Merging</label><br />

                                                        <input type="checkbox" id="diverging" name="maneuver" className="form-check-input" />
                                                        <label htmlFor="diverging" className="form-check-label">Diverging</label><br />

                                                        <input type="checkbox" id="overtaking" name="maneuver" className="form-check-input" />
                                                        <label htmlFor="overtaking" className="form-check-label">Overtaking</label><br />

                                                        <input type="checkbox" id="goingAhead" name="maneuver" className="form-check-input" />
                                                        <label htmlFor="goingAhead" className="form-check-label">Going Ahead</label><br />

                                                        <input type="checkbox" id="reversing" name="maneuver" className="form-check-input" />
                                                        <label htmlFor="reversing" className="form-check-label">Reversing</label><br />

                                                        <input type="checkbox" id="suddenStop" name="maneuver" className="form-check-input" />
                                                        <label htmlFor="suddenStop" className="form-check-label">Sudden Stop</label><br />

                                                        <input type="checkbox" id="suddenStart" name="maneuver" className="form-check-input" />
                                                        <label htmlFor="suddenStart" className="form-check-label">Sudden Start</label><br />

                                                        <input type="checkbox" id="parkedOffRoad" name="maneuver" className="form-check-input" />
                                                        <label htmlFor="parkedOffRoad" className="form-check-label">Parked Off Road</label><br />

                                                        <input type="checkbox" id="parkedOnRoad" name="maneuver" className="form-check-input" />
                                                        <label htmlFor="parkedOnRoad" className="form-check-label">Parked On Road</label><br />

                                                        <label style={{ color: 'black', marginBottom: '10px', marginTop: '20px' }} htmlFor="ambulanceInput2">Others:   </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="otherManeuver"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Damage: </label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="damageRear" name="damage" className="form-check-input" />
                                                        <label htmlFor="damageRear" className="form-check-label">Rear</label><br />

                                                        <input type="checkbox" id="damageRoof" name="damage" className="form-check-input" />
                                                        <label htmlFor="damageRoof" className="form-check-label">Roof</label><br />

                                                        <input type="checkbox" id="damageNone" name="damage" className="form-check-input" />
                                                        <label htmlFor="damageNone" className="form-check-label">None</label><br />

                                                        <input type="checkbox" id="damageRight" name="damage" className="form-check-input" />
                                                        <label htmlFor="damageRight" className="form-check-label">Right</label><br />

                                                        <input type="checkbox" id="damageMultiple" name="damage" className="form-check-input" />
                                                        <label htmlFor="damageMultiple" className="form-check-label">Multiple</label><br />

                                                        <input type="checkbox" id="damageFront" name="damage" className="form-check-input" />
                                                        <label htmlFor="damageFront" className="form-check-label">Front</label><br />

                                                        <input type="checkbox" id="damageLeft" name="damage" className="form-check-input" />
                                                        <label htmlFor="damageLeft" className="form-check-label">Left</label><br />

                                                        <input type="checkbox" id="damageOthers" name="damage" className="form-check-input" />
                                                        <label htmlFor="damageOthers" className="form-check-label">Others</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Defect: </label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="defectBrakes" name="defect" className="form-check-input" />
                                                        <label htmlFor="defectBrakes" className="form-check-label">Brakes</label><br />

                                                        <input type="checkbox" id="defectMultiple" name="defect" className="form-check-input" />
                                                        <label htmlFor="defectMultiple" className="form-check-label">Multiple</label><br />

                                                        <input type="checkbox" id="defectNone" name="defect" className="form-check-input" />
                                                        <label htmlFor="defectNone" className="form-check-label">None</label><br />

                                                        <input type="checkbox" id="defectSteering" name="defect" className="form-check-input" />
                                                        <label htmlFor="defectSteering" className="form-check-label">Steering</label><br />

                                                        <input type="checkbox" id="defectEngine" name="defect" className="form-check-input" />
                                                        <label htmlFor="defectEngine" className="form-check-label">Engine</label><br />

                                                        <input type="checkbox" id="defectLights" name="defect" className="form-check-input" />
                                                        <label htmlFor="defectLights" className="form-check-label">Lights</label><br />

                                                        <input type="checkbox" id="defectTires" name="defect" className="form-check-input" />
                                                        <label htmlFor="defectTires" className="form-check-label">Tires</label><br />

                                                        <input type="checkbox" id="defectOthers" name="defect" className="form-check-input" />
                                                        <label htmlFor="defectOthers" className="form-check-label">Others</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Loading: </label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="loadingLegal" name="loading" className="form-check-input" />
                                                        <label htmlFor="loadingLegal" className="form-check-label">Legal</label><br />

                                                        <input type="checkbox" id="loadingOverloaded" name="loading" className="form-check-input" />
                                                        <label htmlFor="loadingOverloaded" className="form-check-label">Overloaded</label><br />

                                                        <input type="checkbox" id="loadingUnsafe" name="loading" className="form-check-input" />
                                                        <label htmlFor="loadingUnsafe" className="form-check-label">Unsafe Load</label><br />
                                                    </div>
                                                </div>


                                                <div className="col-md-12">
                                                    <hr />
                                                </div>

                                                <div className="col-md-4">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Part 3. Vehicular Involved People Details</label>
                                                    <br /> <hr />
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id='part3'
                                                    />
                                                </div>


                                                <div className="col-md-4">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">Involvement:</label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="involvement_driver" name="involvement_driver" className="form-check-input" />
                                                        <label htmlFor="cardiac" className="form-check-label">Driver</label><br />

                                                        <input type="checkbox" id="involvement_passenger" name="involvement_passenger" className="form-check-input" />
                                                        <label htmlFor="cardiac" className="form-check-label">Passenger</label><br />

                                                        <input type="checkbox" id="involvement_pedestrian" name="involvement_pedestrian" className="form-check-input" />
                                                        <label htmlFor="cardiac" className="form-check-label">Pedestrian</label><br />
                                                    </div>
                                                </div>


                                                <div className="col-md-4">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2">License No.:</label>
                                                    <br /> <hr />
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id='licenseNumber'
                                                    />

                                                    <hr />

                                                    <div className="form-check">
                                                        <input type="checkbox" id="NolicenseNumber" name="NolicenseNumber" className="form-check-input" />
                                                        <label htmlFor="cardiac" className="form-check-label">No License</label><br />
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <hr />
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="driverError">Driver of Vehicle Error:</label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="driverErrorFatigued" name="driverError" className="form-check-input" />
                                                        <label htmlFor="driverErrorFatigued" className="form-check-label">Fatigued/Sleep</label><br />

                                                        <input type="checkbox" id="driverErrorNoSignal" name="driverError" className="form-check-input" />
                                                        <label htmlFor="driverErrorNoSignal" className="form-check-label">No Signal</label><br />

                                                        <input type="checkbox" id="driverErrorBadOvertaking" name="driverError" className="form-check-input" />
                                                        <label htmlFor="driverErrorBadOvertaking" className="form-check-label">Bad Overtaking</label><br />

                                                        <input type="checkbox" id="driverErrorInattentive" name="driverError" className="form-check-input" />
                                                        <label htmlFor="driverErrorInattentive" className="form-check-label">Inattentive</label><br />

                                                        <input type="checkbox" id="driverErrorBadTurning" name="driverError" className="form-check-input" />
                                                        <label htmlFor="driverErrorBadTurning" className="form-check-label">Bad Turning</label><br />

                                                        <input type="checkbox" id="driverErrorTooFast" name="driverError" className="form-check-input" />
                                                        <label htmlFor="driverErrorTooFast" className="form-check-label">Too Fast</label><br />

                                                        <input type="checkbox" id="driverErrorUsingCellphone" name="driverError" className="form-check-input" />
                                                        <label htmlFor="driverErrorUsingCellphone" className="form-check-label">Using Cellphone</label><br />

                                                        <input type="checkbox" id="driverErrorTooClose" name="driverError" className="form-check-input" />
                                                        <label htmlFor="driverErrorTooClose" className="form-check-label">Too Close</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="injury">Injury:</label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="injuryFatal" name="injury" className="form-check-input" />
                                                        <label htmlFor="injuryFatal" className="form-check-label">Fatal</label><br />

                                                        <input type="checkbox" id="injurySerious" name="injury" className="form-check-input" />
                                                        <label htmlFor="injurySerious" className="form-check-label">Serious</label><br />

                                                        <input type="checkbox" id="injuryMinor" name="injury" className="form-check-input" />
                                                        <label htmlFor="injuryMinor" className="form-check-label">Minor</label><br />

                                                        <input type="checkbox" id="injuryNotInjured" name="injury" className="form-check-input" />
                                                        <label htmlFor="injuryNotInjured" className="form-check-label">Not Injured</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="alcoholDrugs">Alcohol/Drugs:</label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="alcoholSuspected" name="alcoholDrugs" className="form-check-input" />
                                                        <label htmlFor="alcoholSuspected" className="form-check-label">Alcohol Suspected</label><br />

                                                        <input type="checkbox" id="drugsSuspected" name="alcoholDrugs" className="form-check-input" />
                                                        <label htmlFor="drugsSuspected" className="form-check-label">Drugs Suspected</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="seatbeltHelmet">Seatbelt/Helmet:</label>
                                                    <br /> <hr />
                                                    <div className="form-check">
                                                        <input type="checkbox" id="seatbeltHelmetWorn" name="seatbeltHelmet" className="form-check-input" />
                                                        <label htmlFor="seatbeltHelmetWorn" className="form-check-label">Seatbelt/Helmet Worn</label><br />

                                                        <input type="checkbox" id="seatbeltHelmetNotWorn" name="seatbeltHelmet" className="form-check-input" />
                                                        <label htmlFor="seatbeltHelmetNotWorn" className="form-check-label">Not Worn</label><br />

                                                        <input type="checkbox" id="seatbeltHelmetNotWornCorrectly" name="seatbeltHelmet" className="form-check-input" />
                                                        <label htmlFor="seatbeltHelmetNotWornCorrectly" className="form-check-label">Not Worn Correctly</label><br />

                                                        <input type="checkbox" id="seatbeltHelmetNoSeatbelt" name="seatbeltHelmet" className="form-check-input" />
                                                        <label htmlFor="seatbeltHelmetNoSeatbelt" className="form-check-label">No Seatbelt / Helmet</label><br />
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <hr />
                                                </div>


                                            </div>

                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                            <button type="button" className="btn btn-primary" onClick={handleSavePatientCareReport}>Save changes</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>





                    </div>
                </section >
            </div >
        </>
    );
}

export default ARP_DashboardContent;
