import React from 'react';
import { firestore } from '../../../firebase/firebase';
import { addDoc, collection, getDocs, query, where, doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Swal from 'sweetalert2';

export const handleEditPatientCareReport = async (patientId, accountId) => {

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
        /* if (getValueInputIfNotEmpty('genderSelect')) basicInformation['gender'] = getValueInputIfNotEmpty('genderSelect'); */

        if (getValueInputIfNotEmpty("genderSelect")) {
            basicInformation["gender"] = document.getElementById("genderSelect").value;
        } else {
            console.warn("Gender is not selected or is invalid.");
        }

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
        if (getValueInputIfNotEmpty('addressInput')) basicInformation['addressInput'] = getValueInputIfNotEmpty('addressInput');

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
        if (getCheckboxValueIfChecked('obsGynHaemorrhageLess')) obs_gnyae['obsGynHaemorrhageLess'] = true;
        if (getCheckboxValueIfChecked('obsGynLabour')) obs_gnyae['obsGynLabour'] = true;
        if (getCheckboxValueIfChecked('obsGynPPH')) obs_gnyae['obsGynPPH'] = true;
        if (getCheckboxValueIfChecked('obsGynPreDelivery')) obs_gnyae['obsGynPreDelivery'] = true;

        // Handle "Other Obstetrics/Gynaecology" logic
        const otherObsGynChecked = getCheckboxValueIfChecked('otherObsGyn');
        const otherObsGynInputValue = getValueInputIfNotEmpty('otherObsGynInput');
        if (otherObsGynInputValue) {
            obs_gnyae['otherObsGynInput'] = otherObsGynInputValue;
        }

        const neurological = {};
        if (getCheckboxValueIfChecked('neurologicalAlteredLOC')) neurological['neurologicalAlteredLOC'] = true;
        if (getCheckboxValueIfChecked('neurologicalSeizures')) neurological['neurologicalSeizures'] = true;
        if (getCheckboxValueIfChecked('neurologicalStroke')) neurological['neurologicalStroke'] = true;

        const otherNeurologicalInput = getValueInputIfNotEmpty('otherNeurologicalInput');
        if (otherNeurologicalInput) {
            neurological['otherNeurologicalInput'] = otherNeurologicalInput;
        }

        // Handle "Other Neurological" logic
        const otherNeurologicalChecked = getCheckboxValueIfChecked('otherNeurological');
        const otherNeurologicalInputValue = getValueInputIfNotEmpty('otherNeurologicalInput');
        if (otherNeurologicalChecked && otherNeurologicalInputValue) {
            neurological['otherNeurologicalInput'] = otherNeurologicalInputValue;
        }

        const trauma = {};
        if (getCheckboxValueIfChecked('traumaBurns')) trauma['traumaBurns'] = true;
        if (getCheckboxValueIfChecked('traumaDislocation')) trauma['traumaDislocation'] = true;
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
        if (otherTraumaInputValue) {
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
        if (mechanismInjuryOtherInputValue) {
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
        if (medicalOtherInputValue) {
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
        if (respiratoryOtherInputValue) {
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
        if (generalOtherInputValue) {
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
        if (getCheckboxValueIfChecked('cleaning')) wound['cleaning'] = getCheckboxValueIfChecked('cleaning');
        if (getCheckboxValueIfChecked('dressingBandaging')) wound['dressingBandaging'] = getCheckboxValueIfChecked('dressingBandaging');

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

        const characterModel = {};
        if (getCheckboxValueIfChecked('rightHead')) characterModel['rightHead'] = getCheckboxValueIfChecked('rightHead');
        if (getCheckboxValueIfChecked('rightNeck')) characterModel['rightNeck'] = getCheckboxValueIfChecked('rightNeck');
        if (getCheckboxValueIfChecked('rightShoulder')) characterModel['rightShoulder'] = getCheckboxValueIfChecked('rightShoulder');
        if (getCheckboxValueIfChecked('rightChest')) characterModel['rightChest'] = getCheckboxValueIfChecked('rightChest');
        if (getCheckboxValueIfChecked('rightArm')) characterModel['rightArm'] = getCheckboxValueIfChecked('rightArm');
        if (getCheckboxValueIfChecked('rightHand')) characterModel['rightHand'] = getCheckboxValueIfChecked('rightHand');
        if (getCheckboxValueIfChecked('rightAbdomen')) characterModel['rightAbdomen'] = getCheckboxValueIfChecked('rightAbdomen');
        if (getCheckboxValueIfChecked('rightHip')) characterModel['rightHip'] = getCheckboxValueIfChecked('rightHip');
        if (getCheckboxValueIfChecked('rightThigh')) characterModel['rightThigh'] = getCheckboxValueIfChecked('rightThigh');
        if (getCheckboxValueIfChecked('rightKnee')) characterModel['rightKnee'] = getCheckboxValueIfChecked('rightKnee');
        if (getCheckboxValueIfChecked('rightShin')) characterModel['rightShin'] = getCheckboxValueIfChecked('rightShin');
        if (getCheckboxValueIfChecked('rightFoot')) characterModel['rightFoot'] = getCheckboxValueIfChecked('rightFoot');
        if (getCheckboxValueIfChecked('leftHead')) characterModel['leftHead'] = getCheckboxValueIfChecked('leftHead');
        if (getCheckboxValueIfChecked('leftNeck')) characterModel['leftNeck'] = getCheckboxValueIfChecked('leftNeck');
        if (getCheckboxValueIfChecked('leftShoulder')) characterModel['leftShoulder'] = getCheckboxValueIfChecked('leftShoulder');
        if (getCheckboxValueIfChecked('leftChest')) characterModel['leftChest'] = getCheckboxValueIfChecked('leftChest');
        if (getCheckboxValueIfChecked('leftArm')) characterModel['leftArm'] = getCheckboxValueIfChecked('leftArm');
        if (getCheckboxValueIfChecked('leftHand')) characterModel['leftHand'] = getCheckboxValueIfChecked('leftHand');
        if (getCheckboxValueIfChecked('leftAbdomen')) characterModel['leftAbdomen'] = getCheckboxValueIfChecked('leftAbdomen');
        if (getCheckboxValueIfChecked('leftHip')) characterModel['leftHip'] = getCheckboxValueIfChecked('leftHip');
        if (getCheckboxValueIfChecked('leftThigh')) characterModel['leftThigh'] = getCheckboxValueIfChecked('leftThigh');
        if (getCheckboxValueIfChecked('leftKnee')) characterModel['leftKnee'] = getCheckboxValueIfChecked('leftKnee');
        if (getCheckboxValueIfChecked('leftShin')) characterModel['leftShin'] = getCheckboxValueIfChecked('leftShin');
        if (getCheckboxValueIfChecked('leftFoot')) characterModel['leftFoot'] = getCheckboxValueIfChecked('leftFoot');

        if (getCheckboxValueIfChecked('rightBackHead')) characterModel['rightBackHead'] = getCheckboxValueIfChecked('rightBackHead');
        if (getCheckboxValueIfChecked('rightBackNeck')) characterModel['rightBackNeck'] = getCheckboxValueIfChecked('rightBackNeck');
        if (getCheckboxValueIfChecked('rightBackShoulder')) characterModel['rightBackShoulder'] = getCheckboxValueIfChecked('rightBackShoulder');
        if (getCheckboxValueIfChecked('rightBackArm')) characterModel['rightBackArm'] = getCheckboxValueIfChecked('rightBackArm');
        if (getCheckboxValueIfChecked('rightBackHand')) characterModel['rightBackHand'] = getCheckboxValueIfChecked('rightBackHand');
        if (getCheckboxValueIfChecked('rightBackUpperBack')) characterModel['rightBackUpperBack'] = getCheckboxValueIfChecked('rightBackUpperBack');
        if (getCheckboxValueIfChecked('rightBackLowerBack')) characterModel['rightBackLowerBack'] = getCheckboxValueIfChecked('rightBackLowerBack');
        if (getCheckboxValueIfChecked('rightBackHip')) characterModel['rightBackHip'] = getCheckboxValueIfChecked('rightBackHip');
        if (getCheckboxValueIfChecked('rightBackThigh')) characterModel['rightBackThigh'] = getCheckboxValueIfChecked('rightBackThigh');
        if (getCheckboxValueIfChecked('rightCalf')) characterModel['rightCalf'] = getCheckboxValueIfChecked('rightCalf');
        if (getCheckboxValueIfChecked('rightBackFoot')) characterModel['rightBackFoot'] = getCheckboxValueIfChecked('rightBackFoot');
        if (getCheckboxValueIfChecked('leftBackHead')) characterModel['leftBackHead'] = getCheckboxValueIfChecked('leftBackHead');
        if (getCheckboxValueIfChecked('leftBackNeck')) characterModel['leftBackNeck'] = getCheckboxValueIfChecked('leftBackNeck');
        if (getCheckboxValueIfChecked('leftBackShoulder')) characterModel['leftBackShoulder'] = getCheckboxValueIfChecked('leftBackShoulder');
        if (getCheckboxValueIfChecked('leftBackArm')) characterModel['leftBackArm'] = getCheckboxValueIfChecked('leftBackArm');
        if (getCheckboxValueIfChecked('leftBackHand')) characterModel['leftBackHand'] = getCheckboxValueIfChecked('leftBackHand');
        if (getCheckboxValueIfChecked('leftBackUpperBack')) characterModel['leftBackUpperBack'] = getCheckboxValueIfChecked('leftBackUpperBack');
        if (getCheckboxValueIfChecked('leftBackLowerBack')) characterModel['leftBackLowerBack'] = getCheckboxValueIfChecked('leftBackLowerBack');
        if (getCheckboxValueIfChecked('leftBackHip')) characterModel['leftBackHip'] = getCheckboxValueIfChecked('leftBackHip');
        if (getCheckboxValueIfChecked('leftBackThigh')) characterModel['leftBackThigh'] = getCheckboxValueIfChecked('leftBackThigh');
        if (getCheckboxValueIfChecked('leftCalf')) characterModel['leftCalf'] = getCheckboxValueIfChecked('leftCalf');
        if (getCheckboxValueIfChecked('leftBackFoot')) characterModel['leftBackFoot'] = getCheckboxValueIfChecked('leftBackFoot');


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
        if (getCheckboxValueIfChecked('maritimeIncident')) incidentType['maritimeIncident'] = getCheckboxValueIfChecked('maritimeIncident');
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
        if (getValueInputIfNotEmpty('collision_incidentSummary')) part1['collision_incidentSummary'] = getValueInputIfNotEmpty('collision_incidentSummary');

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
        if (getValueInputIfNotEmpty('classificationPublic')) classification['classificationPublic'] = getValueInputIfNotEmpty('classificationPublic');
        if (getValueInputIfNotEmpty('classificationGovernment')) classification['classificationGovernment'] = getValueInputIfNotEmpty('classificationGovernment');
        if (getValueInputIfNotEmpty('classificationDiplomat')) classification['classificationDiplomat'] = getValueInputIfNotEmpty('classificationDiplomat');

        const typeVehicle = {};
        if (getCheckboxValueIfChecked('motorcycle')) typeVehicle['motorcycle'] = getCheckboxValueIfChecked('motorcycle');
        if (getCheckboxValueIfChecked('bike')) typeVehicle['bike'] = getCheckboxValueIfChecked('bike');
        if (getCheckboxValueIfChecked('jeepney')) typeVehicle['jeepney'] = getCheckboxValueIfChecked('jeepney');
        if (getCheckboxValueIfChecked('ambulance')) typeVehicle['ambulance'] = getCheckboxValueIfChecked('ambulance');
        if (getCheckboxValueIfChecked('heavyEquipment')) typeVehicle['heavyEquipment'] = getCheckboxValueIfChecked('heavyEquipment');
        if (getCheckboxValueIfChecked('aircraft')) typeVehicle['aircraft'] = getCheckboxValueIfChecked('aircraft');
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
        if (getValueInputIfNotEmpty('plateNumber')) typeVehicle['plateNumber'] = getValueInputIfNotEmpty('plateNumber');
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
        if (getCheckboxValueIfChecked('damageOthers')) damage['damageOthers'] = getCheckboxValueIfChecked('damageOthers');
        if (getValueInputIfNotEmpty('damageOthersInput')) damage['damageOthersInput'] = getValueInputIfNotEmpty('damageOthersInput');

        const defect = {};
        if (getCheckboxValueIfChecked('defectBrakes')) defect['defectBrakes'] = getCheckboxValueIfChecked('defectBrakes');
        if (getCheckboxValueIfChecked('defectMultiple')) defect['defectMultiple'] = getCheckboxValueIfChecked('defectMultiple');
        if (getCheckboxValueIfChecked('defectNone')) defect['defectNone'] = getCheckboxValueIfChecked('defectNone');
        if (getCheckboxValueIfChecked('defectSteering')) defect['defectSteering'] = getCheckboxValueIfChecked('defectSteering');
        if (getCheckboxValueIfChecked('defectEngine')) defect['defectEngine'] = getCheckboxValueIfChecked('defectEngine');
        if (getCheckboxValueIfChecked('defectLights')) defect['defectLights'] = getCheckboxValueIfChecked('defectLights');
        if (getCheckboxValueIfChecked('defectTires')) defect['defectTires'] = getCheckboxValueIfChecked('defectTires');
        if (getCheckboxValueIfChecked('defectOthers')) defect['defectOthers'] = getCheckboxValueIfChecked('defectOthers');
        if (getValueInputIfNotEmpty('defectOthersInput')) defect['defectOthersInput'] = getValueInputIfNotEmpty('defectOthersInput');

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

        try {
            // Validate that `patientId` is provided for the update
            if (!patientId) {
                throw new Error("No patient ID provided for update.");
            }

            // Reference the existing document using `patientId`
            const docRef = doc(firestore, "PatientCareReport", patientId);

            // Update the document in Firestore
            await updateDoc(docRef, {
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
                characterModel: characterModel,
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
                savedAt: serverTimestamp(), // Update server timestamp
                ambulancePersonelId: accountId,
                patient_status: "Emergency",
                /* ambulanceId: ambulanceId */
            });

            const notif_docRef = await addDoc(collection(firestore, "NotificationInformation"), {
                NotificationStatus: "EditPatientCareReport",
                TransactionId: patientId,
                savedAt: serverTimestamp(),
                AccountId: accountId,
            });

            console.log("Document updated with ID: ", patientId);

            Swal.fire({
                icon: 'success',
                title: 'Patient Care Report Updated!',
                text: `Patient Care Record updated successfully.`,
                confirmButtonText: 'OK',
            }).then(() => {
                location.reload();
            });
        } catch (error) {
            console.error("Error updating document: ", error);

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
};



