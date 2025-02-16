import React, { useState } from "react";
import { drawText, PDFDocument } from "pdf-lib";

// Helper function to load image as a byte array
const loadImage = async (imageUrl) => {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
};

function GeneratePdf() {
    const [pdfUrl, setPdfUrl] = useState(null);

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

    const generatePdf = async () => {
        try {
            // Create a new PDF document
            const pdfDoc = await PDFDocument.create();

            // Load background images
            const imageBytes1 = await loadImage("/PCR-Page1.png");
            const image1 = await pdfDoc.embedPng(imageBytes1);

            const imageBytes2 = await loadImage("/PCR-Page2.png");
            const image2 = await pdfDoc.embedPng(imageBytes2);

            // Get original image dimensions for Page 1
            const { width: originalWidth1, height: originalHeight1 } = image1;

            // Define the margin
            const margin = 50;

            // Adjust the image dimensions to leave room for the margin
            const imageWidth1 = originalWidth1 - 2 * margin;
            const imageHeight1 = originalHeight1 - 2 * margin;

            // Create the first page with the background image
            const page1 = pdfDoc.addPage([originalWidth1, originalHeight1]);
            page1.drawImage(image1, {
                x: margin,
                y: margin,
                width: imageWidth1,
                height: imageHeight1,
            });

            // Function to adjust text dynamically based on width
            const drawTextDynamic = (text, x, y, maxWidth, fontSize) => {
                if (!text) return; // Skip if text is undefined or null
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                context.font = `${fontSize}px Arial`;

                // Adjust font size dynamically
                while (context.measureText(text).width > maxWidth && fontSize > 5) {
                    fontSize -= 1;
                    context.font = `${fontSize}px Arial`;
                }

                page1.drawText(text, { x, y, size: fontSize });
            };

            // Draw text fields on the first page (considering margins)
            if (basicInformation.surname) {
                drawTextDynamic(basicInformation.surname, margin + 20, originalHeight1 - 445, 300, 30);
            }
            if (basicInformation.firstName) {
                drawTextDynamic(basicInformation.firstName, margin + 320, originalHeight1 - 445, 300, 30);
            }
            if (basicInformation.middleName) {
                drawTextDynamic(basicInformation.middleName, margin + 615, originalHeight1 - 445, 300, 30);
            }
            if (basicInformation.extName) {
                drawTextDynamic(basicInformation.extName, margin + 900, originalHeight1 - 445, 300, 30);
            }
            if (basicInformation.age) {
                drawTextDynamic(basicInformation.age, margin + 1240, originalHeight1 - 445, 300, 30);
            }

            if (basicInformation.gender == "Male") {
                drawTextDynamic('/', margin + 1385, originalHeight1 - 460, 300, 30);
            } else if (basicInformation.gender == "Female") {
                drawTextDynamic('/', margin + 1460, originalHeight1 - 460, 300, 30);
            }

            if (basicInformation.birthdate) {
                const birthdate = basicInformation.birthdate.split("-");
                // day
                drawTextDynamic(birthdate[1], margin + 1030, originalHeight1 - 545, 300, 30);
                // month
                drawTextDynamic(birthdate[2], margin + 1105, originalHeight1 - 545, 300, 30);
                // year
                drawTextDynamic(birthdate[0], margin + 1170, originalHeight1 - 545, 300, 30);
            }

            if (basicInformation.nationality == "Filipino") {
                drawTextDynamic("/", margin + 1260, originalHeight1 - 530, 300, 26);
            } else {
                drawTextDynamic(basicInformation.nationality, margin + 1340, originalHeight1 - 560, 165, 30);
            }

            if (basicInformation.addressInput) {
                drawTextDynamic(basicInformation.addressInput, margin + 20, originalHeight1 - 540, 950, 30);
            }

            if (triageTagging.triageTaggingR == true) {
                drawTextDynamic('/', margin + 330, originalHeight1 - 600, 300, 30);
            }
            if (triageTagging.triageTaggingY == true) {
                drawTextDynamic('/', margin + 390, originalHeight1 - 600, 300, 30);
            }
            if (triageTagging.triageTaggingG == true) {
                drawTextDynamic('/', margin + 445, originalHeight1 - 600, 300, 30);
            }
            if (triageTagging.triageTaggingB == true) {
                drawTextDynamic('/', margin + 505, originalHeight1 - 600, 300, 30);
            }

            if (natureCall.natureCallEmergent == true) {
                drawTextDynamic('/', margin + 842, originalHeight1 - 600, 300, 30);
            }
            if (natureCall.natureCallUrgent == true) {
                drawTextDynamic('/', margin + 1068, originalHeight1 - 600, 300, 30);
            }
            if (natureCall.natureCallNonEmergent == true) {
                drawTextDynamic('/', margin + 1240, originalHeight1 - 600, 300, 30);
            }

            if (cardiac.cardiacArrest == true) {
                drawTextDynamic('/', margin + 60, originalHeight1 - 700, 300, 24);
            }
            if (cardiac.cardiacArrhythmia == true) {
                drawTextDynamic('/', margin + 60, originalHeight1 - 732, 300, 24);
            }
            if (cardiac.cardiacChestPain == true) {
                drawTextDynamic('/', margin + 60, originalHeight1 - 765, 300, 24);
            }
            if (cardiac.heartFailure == true) {
                drawTextDynamic('/', margin + 60, originalHeight1 - 795, 300, 24);
            }
            if (cardiac.otherCardiacInput) {
                drawTextDynamic('/', margin + 60, originalHeight1 - 825, 300, 24);
                drawTextDynamic(cardiac.otherCardiacInput, margin + 60, originalHeight1 - 860, 300, 24);
            }

            if (obs_gnyae.obsGynHaemorrhage == true) {
                drawTextDynamic('/', margin + 337, originalHeight1 - 698, 300, 24);
            }
            if (obs_gnyae.obsGynHaemorrhageLess == true) {
                drawTextDynamic('/', margin + 337, originalHeight1 - 730, 300, 24);
            }
            if (obs_gnyae.obsGynLabour == true) {
                drawTextDynamic('/', margin + 337, originalHeight1 - 760, 300, 24);
            }
            if (obs_gnyae.obsGynPPH == true) {
                drawTextDynamic('/', margin + 337, originalHeight1 - 790, 300, 24);
            }
            if (obs_gnyae.obsGynPreDelivery == true) {
                drawTextDynamic('/', margin + 337, originalHeight1 - 820, 300, 24);
            }
            if (obs_gnyae.otherObsGynInput) {
                drawTextDynamic('/', margin + 337, originalHeight1 - 850, 300, 24);
                drawTextDynamic(obs_gnyae.otherObsGynInput, margin + 337, originalHeight1 - 880, 300, 24);
            }

            if (neurological.neurologicalAlteredLOC == true) {
                drawTextDynamic('/', margin + 630, originalHeight1 - 698, 300, 24);
            }
            if (neurological.neurologicalSeizures == true) {
                drawTextDynamic('/', margin + 630, originalHeight1 - 730, 300, 24);
            }
            if (neurological.neurologicalStroke == true) {
                drawTextDynamic('/', margin + 630, originalHeight1 - 760, 300, 24);
            }
            if (neurological.otherNeurologicalInput) {
                drawTextDynamic('/', margin + 630, originalHeight1 - 790, 300, 24);
                drawTextDynamic(neurological.otherNeurologicalInput, margin + 630, originalHeight1 - 820, 300, 24);
            }

            if (trauma.traumaBurns == true) {
                drawTextDynamic('/', margin + 916, originalHeight1 - 698, 300, 24);
            }
            if (trauma.traumaDislocation == true) {
                drawTextDynamic('/', margin + 916, originalHeight1 - 730, 300, 24);
            }
            if (trauma.traumaFracture == true) {
                drawTextDynamic('/', margin + 916, originalHeight1 - 760, 300, 24);
            }
            if (trauma.traumaHaemorrhage == true) {
                drawTextDynamic('/', margin + 916, originalHeight1 - 790, 300, 24);
            }
            if (trauma.traumaHeadInjury == true) {
                drawTextDynamic('/', margin + 916, originalHeight1 - 820, 300, 24);
            }
            if (trauma.traumaMaxilloFacial == true) {
                drawTextDynamic('/', margin + 916, originalHeight1 - 850, 300, 24);
            }
            if (trauma.traumaMultiple == true) {
                drawTextDynamic('/', margin + 916, originalHeight1 - 881, 300, 24);
            }
            if (trauma.traumaOpenWound == true) {
                drawTextDynamic('/', margin + 916, originalHeight1 - 915, 300, 24);
            }
            if (trauma.traumaShock == true) {
                drawTextDynamic('/', margin + 916, originalHeight1 - 942, 300, 24);
            }
            if (trauma.traumaSoftTissue == true) {
                drawTextDynamic('/', margin + 916, originalHeight1 - 974, 300, 24);
            }
            if (trauma.traumaSpinal == true) {
                drawTextDynamic('/', margin + 916, originalHeight1 - 1004, 300, 24);
            }
            if (trauma.otherTraumaInput) {
                drawTextDynamic('/', margin + 916, originalHeight1 - 1035, 300, 24);
                drawTextDynamic(trauma.otherTraumaInput, margin + 916, originalHeight1 - 1075, 300, 24);
            }

            if (mechanismInjury.mechanismInjuryAssault == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 672, 300, 24);
            }
            if (mechanismInjury.mechanismInjuryAnimalAttack == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 700, 300, 24);
            }
            if (mechanismInjury.mechanismInjuryChemical == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 732, 300, 24);
            }
            if (mechanismInjury.mechanismInjuryDrowning == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 762, 300, 24);
            }
            if (mechanismInjury.mechanismInjuryElectrocution == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 792, 300, 24);
            }
            if (mechanismInjury.mechanismInjuryCold == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 822, 300, 24);
            }
            if (mechanismInjury.mechanismInjuryHeat == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 852, 300, 24);
            }
            if (mechanismInjury.mechanismInjuryFall == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 882, 300, 24);
            }
            if (mechanismInjury.mechanismInjuryFirearm == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 912, 300, 24);
            }
            if (mechanismInjury.mechanismInjuryChild == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 942, 300, 24);
            }
            if (mechanismInjury.mechanismInjuryMachinery == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 974, 300, 24);
            }
            if (mechanismInjury.mechanismInjuryRTA == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 1004, 300, 24);
            }
            if (mechanismInjury.mechanismInjurySmoke == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 1034, 300, 24);
            }
            if (mechanismInjury.mechanismInjurySports == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 1064, 300, 24);
            }
            if (mechanismInjury.mechanismInjuryStabbing == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 1094, 300, 24);
            }
            if (mechanismInjury.mechanismInjuryStumble == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 1124, 300, 24);
            }
            if (mechanismInjury.mechanismInjuryWater == true) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 1155, 300, 24);
            }
            if (mechanismInjury.mechanismInjuryOtherInput) {
                drawTextDynamic('/', margin + 1210, originalHeight1 - 1185, 300, 24);
                drawTextDynamic(mechanismInjury.mechanismInjuryOtherInput, margin + 1250, originalHeight1 - 1210, 300, 24);
            }

            if (medical.medicalBackPain == true) {
                drawTextDynamic('/', margin + 60, originalHeight1 - 935, 300, 24);
            }
            if (medical.medicalDiabetes == true) {
                drawTextDynamic('/', margin + 60, originalHeight1 - 965, 300, 24);
            }
            if (medical.medicalFever == true) {
                drawTextDynamic('/', margin + 60, originalHeight1 - 997, 300, 24);
            }
            if (medical.medicalHeadache == true) {
                drawTextDynamic('/', margin + 60, originalHeight1 - 1027, 300, 24);
            }
            if (medical.medicalHypothermia) {
                drawTextDynamic('/', margin + 60, originalHeight1 - 1058, 300, 24);
            }
            if (medical.medicalOtherInput) {
                drawTextDynamic('/', margin + 60, originalHeight1 - 1088, 300, 24);
                drawTextDynamic(medical.medicalOtherInput, margin + 60, originalHeight1 - 1130, 300, 24);
            }

            if (respiratory.respiratoryAsthma == true) {
                drawTextDynamic('/', margin + 335, originalHeight1 - 952, 300, 24);
            }
            if (respiratory.respiratoryCOPD == true) {
                drawTextDynamic('/', margin + 335, originalHeight1 - 982, 300, 24);
            }
            if (respiratory.respiratoryFBAO == true) {
                drawTextDynamic('/', margin + 335, originalHeight1 - 1015, 300, 24);
            }
            if (respiratory.respiratoryArrest == true) {
                drawTextDynamic('/', margin + 335, originalHeight1 - 1045, 300, 24);
            }
            if (respiratory.respiratorySmoke == true) {
                drawTextDynamic('/', margin + 335, originalHeight1 - 1073, 300, 24);
            }
            if (respiratory.respiratoryOtherInput) {
                drawTextDynamic('/', margin + 335, originalHeight1 - 1105, 300, 24);
                drawTextDynamic(respiratory.respiratoryOtherInput, margin + 335, originalHeight1 - 1130, 300, 24);
            }


            if (general.generalAbdominalPain == true) {
                drawTextDynamic('/', margin + 630, originalHeight1 - 890, 300, 24);
            }
            if (general.generalAllergicReaction == true) {
                drawTextDynamic('/', margin + 630, originalHeight1 - 920, 300, 24);
            }
            if (general.generalBehavioralDisorder == true) {
                drawTextDynamic('/', margin + 630, originalHeight1 - 950, 300, 24);
            }
            if (general.generalIllnessUnknown == true) {
                drawTextDynamic('/', margin + 630, originalHeight1 - 980, 300, 24);
            }
            if (general.generalNausea == true) {
                drawTextDynamic('/', margin + 630, originalHeight1 - 1010, 300, 24);
            }
            if (general.generalPoisoning == true) {
                drawTextDynamic('/', margin + 630, originalHeight1 - 1040, 300, 24);
            }
            if (general.generalSyncope == true) {
                drawTextDynamic('/', margin + 630, originalHeight1 - 1070, 300, 24);
            }
            if (general.generalOtherInput) {
                drawTextDynamic('/', margin + 630, originalHeight1 - 1105, 300, 24);
                drawTextDynamic(general.generalOtherInput, margin + 630, originalHeight1 - 1130, 300, 24);
            }

            if (circumstances.circumstancesAccident == true) {
                drawTextDynamic('/', margin + 290, originalHeight1 - 1170, 300, 24);
            }
            if (circumstances.circumstancesEvent == true) {
                drawTextDynamic('/', margin + 443, originalHeight1 - 1170, 300, 24);
            }
            if (circumstances.circumstancesSelfHarm == true) {
                drawTextDynamic('/', margin + 846, originalHeight1 - 1170, 300, 24);
            }

            if (clinicalStatus.clinicalLifeThreatening == true) {
                drawTextDynamic('/', margin + 276, originalHeight1 - 1208, 300, 24);
            }
            if (clinicalStatus.clinicalSerious == true) {
                drawTextDynamic('/', margin + 505, originalHeight1 - 1208, 300, 24);
            }
            if (clinicalStatus.clinicalNonSerious == true) {
                drawTextDynamic('/', margin + 821, originalHeight1 - 1208, 300, 24);
            }

            if (motor.motorObey == true) {
                drawTextDynamic('/', margin + 44, originalHeight1 - 1285, 300, 28);
            }
            if (motor.motorLocalize == true) {
                drawTextDynamic('/', margin + 44, originalHeight1 - 1318, 300, 28);
            }
            if (motor.motorWithdraw == true) {
                drawTextDynamic('/', margin + 44, originalHeight1 - 1352, 300, 28);
            }
            if (motor.motorFlexion == true) {
                drawTextDynamic('/', margin + 44, originalHeight1 - 1385, 300, 28);
            }
            if (motor.motorExtension == true) {
                drawTextDynamic('/', margin + 44, originalHeight1 - 1419, 300, 28);
            }
            if (motor.motorNone == true) {
                drawTextDynamic('/', margin + 44, originalHeight1 - 1453, 300, 28);
            }

            if (verbal.verbalOriented == true) {
                drawTextDynamic('/', margin + 268, originalHeight1 - 1285, 300, 28);
            }
            if (verbal.verbalConfused == true) {
                drawTextDynamic('/', margin + 268, originalHeight1 - 1318, 300, 28);
            }
            if (verbal.verbalInappropriate == true) {
                drawTextDynamic('/', margin + 268, originalHeight1 - 1352, 300, 28);
            }
            if (verbal.verbalIncomprehensible == true) {
                drawTextDynamic('/', margin + 268, originalHeight1 - 1385, 300, 28);
            }
            if (verbal.verbalNone == true) {
                drawTextDynamic('/', margin + 268, originalHeight1 - 1419, 300, 28);
            }


            if (eye_opening.eyeSpontaneous == true) {
                drawTextDynamic('/', margin + 589, originalHeight1 - 1285, 300, 28);
            }
            if (eye_opening.eyeToVoice == true) {
                drawTextDynamic('/', margin + 589, originalHeight1 - 1318, 300, 28);
            }
            if (eye_opening.eyeToPain == true) {
                drawTextDynamic('/', margin + 589, originalHeight1 - 1352, 300, 28);
            }
            if (eye_opening.eyeNone == true) {
                drawTextDynamic('/', margin + 589, originalHeight1 - 1385, 300, 28);
            }

            if (eye_opening.gcsTotal) {
                drawTextDynamic(eye_opening.gcsTotal, margin + 615, originalHeight1 - 1453, 300, 28);
            }

            if (pulse.pulsePositive) {
                drawTextDynamic('/', margin + 200, originalHeight1 - 1499, 300, 28);
            }
            if (pulse.pulseRapid) {
                drawTextDynamic('/', margin + 335, originalHeight1 - 1499, 300, 28);
            }
            if (pulse.pulseSlow) {
                drawTextDynamic('/', margin + 450, originalHeight1 - 1499, 300, 28);
            }
            if (pulse.pulseNegative) {
                drawTextDynamic('/', margin + 553, originalHeight1 - 1499, 300, 28);
            }

            if (airway.airwayClear) {
                drawTextDynamic('/', margin + 200, originalHeight1 - 1540, 300, 28);
            }
            if (airway.airwayPartial) {
                drawTextDynamic('/', margin + 316, originalHeight1 - 1540, 300, 28);
            }
            if (airway.airwayObstructed) {
                drawTextDynamic('/', margin + 597, originalHeight1 - 1540, 300, 28);
            }

            if (breathing.breathingNormal) {
                drawTextDynamic('/', margin + 200, originalHeight1 - 1585, 300, 28);
            }
            if (breathing.breathingRapid) {
                drawTextDynamic('/', margin + 335, originalHeight1 - 1585, 300, 28);
            }
            if (breathing.breathingSlow) {
                drawTextDynamic('/', margin + 452, originalHeight1 - 1585, 300, 28);
            }
            if (breathing.breathingShallow) {
                drawTextDynamic('/', margin + 555, originalHeight1 - 1585, 300, 28);
            }
            if (breathing.breathingHyperventilate) {
                drawTextDynamic('/', margin + 200, originalHeight1 - 1627, 300, 28);
            }
            if (breathing.breathingNone) {
                drawTextDynamic('/', margin + 452, originalHeight1 - 1627, 300, 28);
            }

            if (gagReflex.gagReflexPresent) {
                drawTextDynamic('/', margin + 220, originalHeight1 - 1668, 300, 28);
            }
            if (gagReflex.gagReflexAbsent) {
                drawTextDynamic('/', margin + 371, originalHeight1 - 1668, 300, 28);
            }

            if (complaintDets.chiefComplaintInput) {
                drawTextDynamic(complaintDets.chiefComplaintInput, margin + 1030, originalHeight1 - 1250, 300, 28);
            }
            if (complaintDets.historyInput) {
                drawTextDynamic(complaintDets.historyInput, margin + 908, originalHeight1 - 1328, 300, 28);
            }
            if (complaintDets.signsSymptomsInput) {
                drawTextDynamic(complaintDets.signsSymptomsInput, margin + 1050, originalHeight1 - 1442, 300, 28);
            }
            if (complaintDets.allergiesInput) {
                drawTextDynamic(complaintDets.allergiesInput, margin + 950, originalHeight1 - 1476, 300, 28);
            }
            if (complaintDets.medicationsInput) {
                drawTextDynamic(complaintDets.medicationsInput, margin + 975, originalHeight1 - 1508, 300, 28);
            }
            if (complaintDets.pastMedicalHistoryInput) {
                drawTextDynamic(complaintDets.pastMedicalHistoryInput, margin + 1115, originalHeight1 - 1542, 300, 28);
            }
            if (complaintDets.lastMealIntakeInput) {
                drawTextDynamic(complaintDets.lastMealIntakeInput, margin + 1045, originalHeight1 - 1575, 300, 28);
            }
            if (complaintDets.timeInput) {
                drawTextDynamic(complaintDets.timeInput, margin + 1425, originalHeight1 - 1575, 300, 28);
            }
            if (complaintDets.eventPriorInput) {
                drawTextDynamic(complaintDets.eventPriorInput, margin + 60, originalHeight1 - 1612, 300, 28);
            }

            if (vitalSigns.row1LOCA == true) {
                drawTextDynamic('/', margin + 29, originalHeight1 - 1775, 300, 28);
            }
            if (vitalSigns.row1LOCV == true) {
                drawTextDynamic('/', margin + 89, originalHeight1 - 1775, 300, 28);
            }
            if (vitalSigns.row1LOCP == true) {
                drawTextDynamic('/', margin + 146, originalHeight1 - 1775, 300, 28);
            }
            if (vitalSigns.row1LOCU == true) {
                drawTextDynamic('/', margin + 205, originalHeight1 - 1775, 300, 28);
            }
            if (vitalSigns.row1BP) {
                drawTextDynamic(vitalSigns.row1BP, margin + 262, originalHeight1 - 1773, 300, 28);
            }
            if (vitalSigns.row1PR) {
                drawTextDynamic(vitalSigns.row1PR, margin + 345, originalHeight1 - 1773, 300, 28);
            }
            if (vitalSigns.row1RR) {
                drawTextDynamic(vitalSigns.row1RR, margin + 413, originalHeight1 - 1773, 300, 28);
            }
            if (vitalSigns.row1SPO2) {
                drawTextDynamic(vitalSigns.row1SPO2, margin + 480, originalHeight1 - 1773, 300, 28);
            }
            if (vitalSigns.row1TEMP) {
                drawTextDynamic(vitalSigns.row1TEMP, margin + 570, originalHeight1 - 1773, 300, 28);
            }
            if (vitalSigns.row1Time) {
                drawTextDynamic(vitalSigns.row1Time, margin + 665, originalHeight1 - 1773, 300, 28);
            }

            if (vitalSigns.row2LOCA == true) {
                drawTextDynamic('/', margin + 29, originalHeight1 - 1812, 300, 28);
            }
            if (vitalSigns.row2LOCV == true) {
                drawTextDynamic('/', margin + 89, originalHeight1 - 1812, 300, 28);
            }
            if (vitalSigns.row2LOCP == true) {
                drawTextDynamic('/', margin + 146, originalHeight1 - 1812, 300, 28);
            }
            if (vitalSigns.row2LOCU == true) {
                drawTextDynamic('/', margin + 205, originalHeight1 - 1812, 300, 28);
            }
            if (vitalSigns.row2BP) {
                drawTextDynamic(vitalSigns.row2BP, margin + 262, originalHeight1 - 1812, 300, 28);
            }
            if (vitalSigns.row2PR) {
                drawTextDynamic(vitalSigns.row2PR, margin + 345, originalHeight1 - 1812, 300, 28);
            }
            if (vitalSigns.row2RR) {
                drawTextDynamic(vitalSigns.row2RR, margin + 413, originalHeight1 - 1812, 300, 28);
            }
            if (vitalSigns.row2SPO2) {
                drawTextDynamic(vitalSigns.row2SPO2, margin + 480, originalHeight1 - 1812, 300, 28);
            }
            if (vitalSigns.row2TEMP) {
                drawTextDynamic(vitalSigns.row2TEMP, margin + 570, originalHeight1 - 1812, 300, 28);
            }
            if (vitalSigns.row2Time) {
                drawTextDynamic(vitalSigns.row2Time, margin + 665, originalHeight1 - 1812, 300, 28);
            }

            if (vitalSigns.row3LOCA == true) {
                drawTextDynamic('/', margin + 29, originalHeight1 - 1850, 300, 28);
            }
            if (vitalSigns.row3LOCV == true) {
                drawTextDynamic('/', margin + 89, originalHeight1 - 1850, 300, 28);
            }
            if (vitalSigns.row3LOCP == true) {
                drawTextDynamic('/', margin + 146, originalHeight1 - 1850, 300, 28);
            }
            if (vitalSigns.row3LOCU == true) {
                drawTextDynamic('/', margin + 205, originalHeight1 - 1850, 300, 28);
            }
            if (vitalSigns.row3BP) {
                drawTextDynamic(vitalSigns.row3BP, margin + 262, originalHeight1 - 1850, 300, 28);
            }
            if (vitalSigns.row3PR) {
                drawTextDynamic(vitalSigns.row3PR, margin + 345, originalHeight1 - 1850, 300, 28);
            }
            if (vitalSigns.row3RR) {
                drawTextDynamic(vitalSigns.row3RR, margin + 413, originalHeight1 - 1850, 300, 28);
            }
            if (vitalSigns.row3SPO2) {
                drawTextDynamic(vitalSigns.row3SPO2, margin + 480, originalHeight1 - 1850, 300, 28);
            }
            if (vitalSigns.row3TEMP) {
                drawTextDynamic(vitalSigns.row3TEMP, margin + 570, originalHeight1 - 1850, 300, 28);
            }
            if (vitalSigns.row3Time) {
                drawTextDynamic(vitalSigns.row3Time, margin + 665, originalHeight1 - 1850, 300, 28);
            }

            if (vitalSigns.row4LOCA == true) {
                drawTextDynamic('/', margin + 29, originalHeight1 - 1887, 300, 28);
            }
            if (vitalSigns.row4LOCV == true) {
                drawTextDynamic('/', margin + 89, originalHeight1 - 1887, 300, 28);
            }
            if (vitalSigns.row4LOCP == true) {
                drawTextDynamic('/', margin + 146, originalHeight1 - 1887, 300, 28);
            }
            if (vitalSigns.row4LOCU == true) {
                drawTextDynamic('/', margin + 205, originalHeight1 - 1887, 300, 28);
            }
            if (vitalSigns.row4BP) {
                drawTextDynamic(vitalSigns.row4BP, margin + 262, originalHeight1 - 1887, 300, 28);
            }
            if (vitalSigns.row4PR) {
                drawTextDynamic(vitalSigns.row4PR, margin + 345, originalHeight1 - 1887, 300, 28);
            }
            if (vitalSigns.row4RR) {
                drawTextDynamic(vitalSigns.row4RR, margin + 413, originalHeight1 - 1887, 300, 28);
            }
            if (vitalSigns.row4SPO2) {
                drawTextDynamic(vitalSigns.row4SPO2, margin + 480, originalHeight1 - 1887, 300, 28);
            }
            if (vitalSigns.row4TEMP) {
                drawTextDynamic(vitalSigns.row4TEMP, margin + 570, originalHeight1 - 1887, 300, 28);
            }
            if (vitalSigns.row4Time) {
                drawTextDynamic(vitalSigns.row4Time, margin + 665, originalHeight1 - 1887, 300, 28);
            }


            if (pupilDets['Pearrl-L'] == true) {
                drawTextDynamic('/', margin + 172, originalHeight1 - 1955, 300, 28);
            }
            if (pupilDets['Pearrl-R'] == true) {
                drawTextDynamic('/', margin + 220, originalHeight1 - 1955, 300, 28);
            }

            if (pupilDets['Clear-L']) {
                drawTextDynamic('/', margin + 416, originalHeight1 - 1955, 300, 28);
            }
            if (pupilDets['Clear-R']) {
                drawTextDynamic('/', margin + 461, originalHeight1 - 1955, 300, 28);
            }

            if (pupilDets['row1lm']) {
                drawTextDynamic(pupilDets['row1lm'], margin + 675, originalHeight1 - 1955, 300, 28);
            }


            if (pupilDets['Pinpoint-L'] == true) {
                drawTextDynamic('/', margin + 172, originalHeight1 - 1985, 300, 28);
            }
            if (pupilDets['Pinpoint-R'] == true) {
                drawTextDynamic('/', margin + 220, originalHeight1 - 1985, 300, 28);
            }
            if (pupilDets['AbsentL']) {
                drawTextDynamic('/', margin + 416, originalHeight1 - 1985, 300, 28);
            }
            if (pupilDets['AbsentR']) {
                drawTextDynamic('/', margin + 461, originalHeight1 - 1985, 300, 28);
            }
            if (pupilDets['armsYes']) {
                drawTextDynamic('/', margin + 590, originalHeight1 - 1985, 300, 28);
            }
            if (pupilDets['armsNo']) {
                drawTextDynamic('/', margin + 637, originalHeight1 - 1985, 300, 28);
            }
            if (pupilDets['row2LM']) {
                drawTextDynamic(pupilDets['row2LM'], margin + 675, originalHeight1 - 1985, 300, 28);
            }

            if (pupilDets['dLatedL'] == true) {
                drawTextDynamic('/', margin + 172, originalHeight1 - 2021, 300, 28);
            }
            if (pupilDets['dLatedR'] == true) {
                drawTextDynamic('/', margin + 220, originalHeight1 - 2021, 300, 28);
            }
            if (pupilDets['decreaseL']) {
                drawTextDynamic('/', margin + 416, originalHeight1 - 2021, 300, 28);
            }
            if (pupilDets['decreaseR']) {
                drawTextDynamic('/', margin + 461, originalHeight1 - 2021, 300, 28);
            }
            if (pupilDets['arms2Yes']) {
                drawTextDynamic('/', margin + 590, originalHeight1 - 2021, 300, 28);
            }
            if (pupilDets['arms2No']) {
                drawTextDynamic('/', margin + 637, originalHeight1 - 2021, 300, 28);
            }
            if (pupilDets['row3LM']) {
                drawTextDynamic(pupilDets['row3LM'], margin + 675, originalHeight1 - 2021, 300, 28);
            }

            if (pupilDets['sluggishL'] == true) {
                drawTextDynamic('/', margin + 172, originalHeight1 - 2052, 300, 28);
            }
            if (pupilDets['sluggishR'] == true) {
                drawTextDynamic('/', margin + 220, originalHeight1 - 2052, 300, 28);
            }
            if (pupilDets['cracklesL']) {
                drawTextDynamic('/', margin + 416, originalHeight1 - 2052, 300, 28);
            }
            if (pupilDets['cracklesR']) {
                drawTextDynamic('/', margin + 461, originalHeight1 - 2052, 300, 28);
            }
            if (pupilDets['legs1Yes']) {
                drawTextDynamic('/', margin + 590, originalHeight1 - 2052, 300, 28);
            }
            if (pupilDets['legs1No']) {
                drawTextDynamic('/', margin + 637, originalHeight1 - 2052, 300, 28);
            }
            if (pupilDets['row4LM']) {
                drawTextDynamic(pupilDets['row4LM'], margin + 675, originalHeight1 - 2052, 300, 28);
            }

            if (pupilDets['fixedL'] == true) {
                drawTextDynamic('/', margin + 172, originalHeight1 - 2089, 300, 28);
            }
            if (pupilDets['fixedR'] == true) {
                drawTextDynamic('/', margin + 220, originalHeight1 - 2089, 300, 28);
            }
            if (pupilDets['ronchiL']) {
                drawTextDynamic('/', margin + 416, originalHeight1 - 2089, 300, 28);
            }
            if (pupilDets['ronchiR']) {
                drawTextDynamic('/', margin + 461, originalHeight1 - 2089, 300, 28);
            }
            if (pupilDets['legs2Yes']) {
                drawTextDynamic('/', margin + 590, originalHeight1 - 2089, 300, 28);
            }
            if (pupilDets['legs1No']) {
                drawTextDynamic('/', margin + 637, originalHeight1 - 2089, 300, 28);
            }
            if (pupilDets['row5LM']) {
                drawTextDynamic(pupilDets['row5LM'], margin + 675, originalHeight1 - 2089, 300, 28);
            }

            if (pupilDets['cataractL'] == true) {
                drawTextDynamic('/', margin + 172, originalHeight1 - 2121, 300, 28);
            }
            if (pupilDets['cataractR'] == true) {
                drawTextDynamic('/', margin + 220, originalHeight1 - 2121, 300, 28);
            }
            if (pupilDets['wheezeL']) {
                drawTextDynamic('/', margin + 416, originalHeight1 - 2121, 300, 28);
            }
            if (pupilDets['wheezeR']) {
                drawTextDynamic('/', margin + 461, originalHeight1 - 2121, 300, 28);
            }
            if (pupilDets['legs3Yes']) {
                drawTextDynamic('/', margin + 590, originalHeight1 - 2121, 300, 28);
            }
            if (pupilDets['legs3No']) {
                drawTextDynamic('/', margin + 637, originalHeight1 - 2121, 300, 28);
            }
            if (pupilDets['row6LM']) {
                drawTextDynamic(pupilDets['row6LM'], margin + 675, originalHeight1 - 2121, 300, 28);
            }

            if (wound['bleedingControl'] == true) {
                drawTextDynamic('/', margin + 140, originalHeight1 - 2153, 300, 24);
            }
            if (wound['appliedAntiseptic'] == true) {
                drawTextDynamic('/', margin + 451, originalHeight1 - 2153, 300, 24);
            }
            if (wound['cleaning'] == true) {
                drawTextDynamic('/', margin + 140, originalHeight1 - 2182, 300, 24);
            }
            if (wound['dressingBandaging'] == true) {
                drawTextDynamic('/', margin + 451, originalHeight1 - 2182, 300, 24);
            }

            if (immobilisation['c-collar'] == true) {
                drawTextDynamic('/', margin + 260, originalHeight1 - 2225, 300, 24);
            }
            if (immobilisation['spineboard'] == true) {
                drawTextDynamic('/', margin + 451, originalHeight1 - 2225, 300, 24);
            }
            if (immobilisation['KED'] == true) {
                drawTextDynamic('/', margin + 158, originalHeight1 - 2257, 300, 24);
            }
            if (immobilisation['splints'] == true) {
                drawTextDynamic('/', margin + 262, originalHeight1 - 2257, 300, 24);
            }
            if (immobilisation['scoopStretcher'] == true) {
                drawTextDynamic('/', margin + 452, originalHeight1 - 2257, 300, 24);
            }
            if (immobilisation['immobilisationOthers']) {
                drawTextDynamic(immobilisation['immobilisationOthers'], margin + 170, originalHeight1 - 2305, 300, 30);
            }

            if (condition['deformity'] == true) {
                drawTextDynamic('/', margin + 1340, originalHeight1 - 1660, 300, 24);
            }
            if (condition['confusion'] == true) {
                drawTextDynamic('/', margin + 1340, originalHeight1 - 1687, 300, 24);
            }
            if (condition['abrasion'] == true) {
                drawTextDynamic('/', margin + 1340, originalHeight1 - 1717, 300, 24);
            }
            if (condition['puncture'] == true) {
                drawTextDynamic('/', margin + 1340, originalHeight1 - 1747, 300, 24);
            }
            if (condition['burn'] == true) {
                drawTextDynamic('/', margin + 1340, originalHeight1 - 1777, 300, 24);
            }
            if (condition['tenderness'] == true) {
                drawTextDynamic('/', margin + 1340, originalHeight1 - 1807, 300, 24);
            }
            if (condition['laceration'] == true) {
                drawTextDynamic('/', margin + 1340, originalHeight1 - 1837, 300, 24);
            }
            if (condition['swelling'] == true) {
                drawTextDynamic('/', margin + 1340, originalHeight1 - 1867, 300, 24);
            }
            if (condition['fracture'] == true) {
                drawTextDynamic('/', margin + 1340, originalHeight1 - 1925, 300, 24);
            }
            if (condition['avulsion'] == true) {
                drawTextDynamic('/', margin + 1340, originalHeight1 - 1955, 300, 24);
            }
            if (condition['dislocation'] == true) {
                drawTextDynamic('/', margin + 1340, originalHeight1 - 1985, 300, 24);
            }
            if (condition['pain'] == true) {
                drawTextDynamic('/', margin + 1340, originalHeight1 - 2015, 300, 24);
            }
            if (condition['rashes'] == true) {
                drawTextDynamic('/', margin + 1340, originalHeight1 - 2045, 300, 24);
            }
            if (condition['numbness'] == true) {
                drawTextDynamic('/', margin + 1340, originalHeight1 - 2075, 300, 24);
            }

            if (characterModel['rightHead'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/RightHead.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 890,
                    y: margin + 625,
                    width: 25,
                    height: 65,
                });
            }

            if (characterModel['rightNeck'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/RightNeck.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 900,
                    y: margin + 610,
                    width: 16,
                    height: 25,
                });
            }

            if (characterModel['rightChest'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/RightChest.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 870,
                    y: margin + 545,
                    width: 47,
                    height: 72
                });
            }


            if (characterModel['rightShoulder'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/RightShoulder.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 847,
                    y: margin + 570,
                    width: 24,
                    height: 35,
                });
            }

            if (characterModel['rightArm'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/RightArm.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 821,
                    y: margin + 435,
                    width: 52,
                    height: 135,
                });
            }


            if (characterModel['rightHand'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/RightHand.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);

                page1.drawImage(rightHeadImg, {
                    x: margin + 800,
                    y: margin + 375,
                    width: 40,
                    height: 65,
                });
            }


            if (characterModel['rightAbdomen'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/RightAbdomen.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 870,
                    y: margin + 472,
                    width: 47,
                    height: 72,
                });
            }

            if (characterModel['rightHip'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/RightHips.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 870,
                    y: margin + 436,
                    width: 47,
                    height: 35,
                });
            }

            if (characterModel['rightThigh'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/RightThigh.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 870,
                    y: margin + 325,
                    width: 47,
                    height: 110,
                });
            }

            if (characterModel['rightKnee'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/RightKnee.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 885,
                    y: margin + 295,
                    width: 35,
                    height: 30,
                });
            }

            if (characterModel['rightShin'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/RightShin.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 882,
                    y: margin + 205,
                    width: 35,
                    height: 90,
                });
            }

            if (characterModel['rightFoot'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/RightFoot.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 888,
                    y: margin + 180,
                    width: 30,
                    height: 25,
                });
            }

            if (characterModel['leftHead'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/LeftHead.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 915.5,
                    y: margin + 625,
                    width: 25,
                    height: 65,
                });
            }

            if (characterModel['leftNeck'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/LeftNeck.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 916.3,
                    y: margin + 610,
                    width: 17,
                    height: 26,
                });
            }


            if (characterModel['leftChest'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/LeftChest.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 915,
                    y: margin + 545,
                    width: 47,
                    height: 72,
                });
            }

            if (characterModel['leftShoulder'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/LeftShoulder.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 961,
                    y: margin + 570,
                    width: 24,
                    height: 35,
                });
            }

            if (characterModel['leftArm'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/LeftArm.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 961,
                    y: margin + 435,
                    width: 52,
                    height: 135,
                });
            }

            if (characterModel['leftHand'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/LeftHand.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 995,
                    y: margin + 375,
                    width: 40,
                    height: 65,
                });
            }

            if (characterModel['leftAbdomen'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/LeftAbdomen.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 915,
                    y: margin + 472,
                    width: 47,
                    height: 72,
                });
            }

            if (characterModel['leftHip'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/LeftHips.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 915,
                    y: margin + 436,
                    width: 47,
                    height: 35,
                });
            }

            if (characterModel['leftThigh'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/LeftThigh.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 915,
                    y: margin + 325,
                    width: 47,
                    height: 110,
                });
            }


            if (characterModel['leftKnee'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/LeftKnee.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 920,
                    y: margin + 295,
                    width: 35,
                    height: 30,
                });
            }


            if (characterModel['leftShin'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/LeftShin.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 920,
                    y: margin + 205,
                    width: 35,
                    height: 90,
                });
            }

            if (characterModel['leftFoot'] == true) {

                const imageBytes3 = await loadImage("/assets/img/FrontModel/LeftFoot.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 920,
                    y: margin + 180,
                    width: 30,
                    height: 25,
                });
            }

            // BACK MODEL


            if (characterModel['leftBackHead'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/LeftBackHead.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1167,
                    y: margin + 630,
                    width: 25,
                    height: 60,
                });
            }

            if (characterModel['leftBackNeck'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/LeftBackNeck.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1175,
                    y: margin + 613,
                    width: 17,
                    height: 17,
                });
            }

            if (characterModel['leftBackUpperBack'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/LeftUpperBack.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1150,
                    y: margin + 533,
                    width: 45,
                    height: 90,
                });
            }

            if (characterModel['leftBackShoulder'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/LeftBackShoulder.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1125,
                    y: margin + 570,
                    width: 25,
                    height: 37,
                });
            }

            if (characterModel['leftBackArm'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/LeftBackArm.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1093,
                    y: margin + 435,
                    width: 60,
                    height: 135,
                });
            }

            if (characterModel['leftBackHand'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/LeftBackHand.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1075,
                    y: margin + 374,
                    width: 41,
                    height: 65,
                });
            }

            if (characterModel['leftBackLowerBack'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/LeftLowerBack.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1145,
                    y: margin + 448,
                    width: 47,
                    height: 85,
                });
            }

            if (characterModel['leftBackHip'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/LeftBackHip.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1147,
                    y: margin + 408,
                    width: 45,
                    height: 40,
                });
            }


            if (characterModel['leftBackThigh'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/LeftBackThigh.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1150,
                    y: margin + 320,
                    width: 45,
                    height: 87,
                });
            }

            if (characterModel['leftCalf'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/LeftBackCalf.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1160,
                    y: margin + 200,
                    width: 35,
                    height: 120,
                });
            }

            if (characterModel['leftBackFoot'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/LeftBackFoot.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1160,
                    y: margin + 180,
                    width: 35,
                    height: 20,
                });
            }

            if (characterModel['rightBackHead'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/RightBackHead.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1193,
                    y: margin + 630,
                    width: 26,
                    height: 60,
                });
            }

            if (characterModel['rightBackNeck'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/RightBackNeck.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1192,
                    y: margin + 613,
                    width: 18,
                    height: 17,
                });
            }

            if (characterModel['rightBackUpperBack'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/RightUpperBack.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1192,
                    y: margin + 533,
                    width: 45,
                    height: 90,
                });
            }

            if (characterModel['rightBackShoulder'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/RightBackShoulder.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1238,
                    y: margin + 570,
                    width: 25,
                    height: 35,
                });
            }

            if (characterModel['rightBackArm'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/RightBackArm.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1233,
                    y: margin + 434,
                    width: 65,
                    height: 135,
                });
            }

            if (characterModel['rightBackHand'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/RightBackHand.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1272,
                    y: margin + 374,
                    width: 41,
                    height: 65,
                });
            }

            if (characterModel['rightBackLowerBack'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/RightLowerBack.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1192,
                    y: margin + 448,
                    width: 47,
                    height: 85,
                });
            }

            if (characterModel['rightBackHip'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/RightBackHip.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1192,
                    y: margin + 408,
                    width: 50,
                    height: 40,
                });
            }

            if (characterModel['rightBackThigh'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/RightBackThigh.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1195,
                    y: margin + 320,
                    width: 45,
                    height: 87,
                });
            }

            if (characterModel['rightCalf'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/RightBackCalf.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1195,
                    y: margin + 200,
                    width: 35,
                    height: 120,
                });
            }

            if (characterModel['rightBackFoot'] == true) {

                const imageBytes3 = await loadImage("/assets/img/BackModel/RightBackFoot.png");
                const rightHeadImg = await pdfDoc.embedPng(imageBytes3);


                page1.drawImage(rightHeadImg, {
                    x: margin + 1200,
                    y: margin + 180,
                    width: 35,
                    height: 20,
                });
            }

            if (endorsedTeam['endorsedByTeam']) {
                drawTextDynamic(endorsedTeam['endorsedByTeam'], margin + 1060, originalHeight1 - 2190, 300, 24);
            }
            if (endorsedTeam['tlInput']) {
                drawTextDynamic(endorsedTeam['tlInput'], margin + 810, originalHeight1 - 2225, 300, 24);
            }
            if (endorsedTeam['r1Input']) {
                drawTextDynamic(endorsedTeam['r1Input'], margin + 945, originalHeight1 - 2225, 300, 24);
            }
            if (endorsedTeam['r2Input']) {
                drawTextDynamic(endorsedTeam['r2Input'], margin + 1070, originalHeight1 - 2225, 300, 24);
            }
            if (endorsedTeam['r3Input']) {
                drawTextDynamic(endorsedTeam['r3Input'], margin + 1190, originalHeight1 - 2225, 300, 24);
            }
            if (endorsedTeam['r4Input']) {
                drawTextDynamic(endorsedTeam['r4Input'], margin + 1320, originalHeight1 - 2225, 300, 24);
            }
            if (endorsedTeam['r5Input']) {
                drawTextDynamic(endorsedTeam['r5Input'], margin + 1445, originalHeight1 - 2225, 300, 24);
            }


            // Get original image dimensions for Page 2
            const { width: originalWidth2, height: originalHeight2 } = image2;

            // Adjust the image dimensions to leave room for the margin
            const imageWidth2 = originalWidth2 - 2 * margin;
            const imageHeight2 = originalHeight2 - 2 * margin;

            // Create the second page with the background image
            const page2 = pdfDoc.addPage([originalWidth2, originalHeight2]);
            page2.drawImage(image2, {
                x: margin,
                y: margin,
                width: imageWidth2,
                height: imageHeight2,
            });

            // Function to adjust text dynamically based on width
            const drawTextDynamicPage2 = (text, x, y, maxWidth, fontSize) => {
                if (!text) return; // Skip if text is undefined or null
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                context.font = `${fontSize}px Arial`;

                // Adjust font size dynamically
                while (context.measureText(text).width > maxWidth && fontSize > 5) {
                    fontSize -= 1;
                    context.font = `${fontSize}px Arial`;
                }

                page2.drawText(text, { x, y, size: fontSize });
            };


            if (incidentType['vehicularAccident']) {
                drawTextDynamicPage2('/', margin + 295, originalHeight1 - 123, 300, 28);
            }
            if (incidentType['medicalAttention']) {
                drawTextDynamicPage2('/', margin + 590, originalHeight1 - 123, 300, 28);
            }
            if (incidentType['patientTransport']) {
                drawTextDynamicPage2('/', margin + 865, originalHeight1 - 123, 300, 28);
            }
            if (incidentType['openWaterIncident']) {
                drawTextDynamicPage2('/', margin + 1145, originalHeight1 - 123, 300, 28);
            }

            if (incidentType['drowningIncident']) {
                drawTextDynamicPage2('/', margin + 295, originalHeight1 - 160, 300, 28);
            }
            if (incidentType['maritimeIncident']) {
                drawTextDynamicPage2('/', margin + 590, originalHeight1 - 160, 300, 28);
            }
            if (incidentType['fireIncident']) {
                drawTextDynamicPage2('/', margin + 865, originalHeight1 - 160, 300, 28);
            }
            if (incidentType['specialCases']) {
                drawTextDynamicPage2('/', margin + 1145, originalHeight1 - 160, 300, 28);
            }
            if (incidentType['incidentSummary']) {
                drawTextDynamicPage2(incidentType['incidentSummary'], margin + 330, originalHeight1 - 210, 300, 28);
            }
            if (incidentType['noPatientFound']) {
                drawTextDynamicPage2('/', margin + 1218, originalHeight1 - 210, 300, 28);
            }

            if (incidentLocation['incident_sameAsResidence']) {
                drawTextDynamicPage2('/', margin + 34, originalHeight1 - 300, 300, 28);
            }
            if (incidentLocation['incident_landmarkPlace']) {
                drawTextDynamicPage2(incidentLocation['incident_landmarkPlace'], margin + 350, originalHeight1 - 260, 300, 28);
            }
            if (incidentLocation['incident_roadStreetName']) {
                drawTextDynamicPage2(incidentLocation['incident_roadStreetName'], margin + 980, originalHeight1 - 260, 300, 28);
            }
            if (incidentLocation['incident_purok']) {
                drawTextDynamicPage2(incidentLocation['incident_purok'], margin + 350, originalHeight1 - 335, 300, 28);
            }
            if (incidentLocation['incident_barangay']) {
                drawTextDynamicPage2(incidentLocation['incident_barangay'], margin + 550, originalHeight1 - 335, 300, 28);
            }
            if (incidentLocation['incident_municipalityCity']) {
                drawTextDynamicPage2(incidentLocation['incident_municipalityCity'], margin + 920, originalHeight1 - 335, 300, 28);
            }
            if (incidentLocation['incident_province']) {
                drawTextDynamicPage2(incidentLocation['incident_province'], margin + 1250, originalHeight1 - 335, 300, 28);
            }

            if (transportLocation['transport_sameAsResidence']) {
                drawTextDynamicPage2('/', margin + 33, originalHeight1 - 478, 300, 28);
            }
            if (transportLocation['transport_sameAsResidence']) {
                drawTextDynamicPage2('/', margin + 33, originalHeight1 - 514, 300, 28);
            }

            if (transportLocation['transport_landmarkPlace']) {
                drawTextDynamicPage2(transportLocation['transport_landmarkPlace'], margin + 350, originalHeight1 - 410, 300, 28);
            }
            if (transportLocation['transport_roadStreetName']) {
                drawTextDynamicPage2(transportLocation['transport_roadStreetName'], margin + 980, originalHeight1 - 410, 300, 28);
            }
            if (transportLocation['transport_purok']) {
                drawTextDynamicPage2(transportLocation['transport_purok'], margin + 350, originalHeight1 - 485, 300, 28);
            }
            if (transportLocation['transport_barangay']) {
                drawTextDynamicPage2(transportLocation['transport_barangay'], margin + 550, originalHeight1 - 485, 300, 28);
            }
            if (transportLocation['transport_municipalityCity']) {
                drawTextDynamicPage2(transportLocation['transport_municipalityCity'], margin + 920, originalHeight1 - 485, 300, 28);
            }
            if (transportLocation['transport_province']) {
                drawTextDynamicPage2(transportLocation['transport_province'], margin + 1250, originalHeight1 - 485, 300, 28);
            }

            if (part1['selfAccident']) {
                drawTextDynamicPage2('/', margin + 800, originalHeight1 - 562, 300, 28);
            }
            if (part1['motorVehicleCollision']) {
                drawTextDynamicPage2('/', margin + 1090, originalHeight1 - 562, 300, 28);
            }
            if (part1['collision_incidentSummary']) {
                drawTextDynamicPage2(part1['collision_incidentSummary'], margin + 980, originalHeight1 - 600, 300, 28);
            }

            if (severity['fatal'] == true) {
                drawTextDynamicPage2('/', margin + 187, originalHeight1 - 652, 300, 28);
            }
            if (severity['injury'] == true) {
                drawTextDynamicPage2('/', margin + 315, originalHeight1 - 652, 300, 28);
            }
            if (severity['propertyDamage'] == true) {
                drawTextDynamicPage2('/', margin + 465, originalHeight1 - 652, 300, 28);
            }

            if (incidentMainCause['humanError'] == true) {
                drawTextDynamicPage2('/', margin + 1023, originalHeight1 - 650, 300, 28);
            }
            if (incidentMainCause['vehicleDefect'] == true) {
                drawTextDynamicPage2('/', margin + 1196, originalHeight1 - 650, 300, 28);
            }
            if (incidentMainCause['roadDefect'] == true) {
                drawTextDynamicPage2('/', margin + 1370, originalHeight1 - 650, 300, 28);
            }

            if (collisionType['rearEnd'] == true) {
                drawTextDynamicPage2('/', margin + 187, originalHeight1 - 702, 300, 28);
            }
            if (collisionType['sideSwipe'] == true) {
                drawTextDynamicPage2('/', margin + 407, originalHeight1 - 702, 300, 28);
            }
            if (collisionType['headOn'] == true) {
                drawTextDynamicPage2('/', margin + 610, originalHeight1 - 702, 300, 28);
            }
            if (collisionType['hitObject'] == true) {
                drawTextDynamicPage2('/', margin + 910, originalHeight1 - 702, 300, 28);
            }
            if (collisionType['hitPedestrian'] == true) {
                drawTextDynamicPage2('/', margin + 1248, originalHeight1 - 702, 300, 28);
            }

            if (collisionType['sideImpact'] == true) {
                drawTextDynamicPage2('/', margin + 187, originalHeight1 - 735, 300, 28);
            }
            if (collisionType['rollover'] == true) {
                drawTextDynamicPage2('/', margin + 407, originalHeight1 - 735, 300, 28);
            }
            if (collisionType['multipleVehicle'] == true) {
                drawTextDynamicPage2('/', margin + 610, originalHeight1 - 735, 300, 28);
            }
            if (collisionType['hitParkedVehicle'] == true) {
                drawTextDynamicPage2('/', margin + 910, originalHeight1 - 735, 300, 28);
            }
            if (collisionType['hitAnimal'] == true) {
                drawTextDynamicPage2('/', margin + 1248, originalHeight1 - 735, 300, 28);
            }
            if (collisionType['incidentDescription']) {
                drawTextDynamicPage2(collisionType['incidentDescription'], margin + 380, originalHeight1 - 779, 300, 28);
            }

            if (part2['vehicularAccidentDetails']) {
                drawTextDynamicPage2(part2['vehicularAccidentDetails'], margin + 770, originalHeight1 - 823, 300, 28);
            }

            if (classification['classificationPrivate']) {
                drawTextDynamicPage2('/', margin + 285, originalHeight1 - 862, 300, 28);
            }
            if (classification['classificationPublic']) {
                drawTextDynamicPage2('/', margin + 446, originalHeight1 - 862, 300, 28);
            }
            if (classification['classificationGovernment']) {
                drawTextDynamicPage2('/', margin + 587, originalHeight1 - 862, 300, 28);
            }
            if (classification['classificationDiplomat']) {
                drawTextDynamicPage2('/', margin + 823, originalHeight1 - 862, 300, 28);
            }

            if (typeVehicle['motorcycle']) {
                drawTextDynamicPage2('/', margin + 189, originalHeight1 - 905, 300, 28);
            }
            if (typeVehicle['bike']) {
                drawTextDynamicPage2('/', margin + 442, originalHeight1 - 905, 300, 28);
            }
            if (typeVehicle['jeepney']) {
                drawTextDynamicPage2('/', margin + 607, originalHeight1 - 905, 300, 28);
            }
            if (typeVehicle['ambulance']) {
                drawTextDynamicPage2('/', margin + 875, originalHeight1 - 905, 300, 28);
            }
            if (typeVehicle['aircraft']) {
                drawTextDynamicPage2('/', margin + 1148, originalHeight1 - 905, 300, 28);
            }
            if (typeVehicle['heavyEquipment']) {
                drawTextDynamicPage2('/', margin + 1148, originalHeight1 - 863, 300, 28);
            }

            if (typeVehicle['tricycle']) {
                drawTextDynamicPage2('/', margin + 189, originalHeight1 - 943, 300, 28);
            }
            if (typeVehicle['eBike']) {
                drawTextDynamicPage2('/', margin + 442, originalHeight1 - 943, 300, 28);
            }
            if (typeVehicle['horseDriven']) {
                drawTextDynamicPage2('/', margin + 607, originalHeight1 - 943, 300, 28);
            }
            if (typeVehicle['pushCart']) {
                drawTextDynamicPage2('/', margin + 875, originalHeight1 - 943, 300, 28);
            }
            if (typeVehicle['car']) {
                drawTextDynamicPage2('/', margin + 1148, originalHeight1 - 943, 300, 28);
            }

            if (typeVehicle['eTricycle']) {
                drawTextDynamicPage2('/', margin + 189, originalHeight1 - 983, 300, 28);
            }
            if (typeVehicle['pedicab']) {
                drawTextDynamicPage2('/', margin + 442, originalHeight1 - 983, 300, 28);
            }
            if (typeVehicle['fourWheelsAtv']) {
                drawTextDynamicPage2('/', margin + 607, originalHeight1 - 983, 300, 28);
            }
            if (typeVehicle['waterVessel']) {
                drawTextDynamicPage2('/', margin + 875, originalHeight1 - 983, 300, 28);
            }
            if (typeVehicle['truck']) {
                drawTextDynamicPage2('/', margin + 1148, originalHeight1 - 983, 300, 28);
            }

            if (typeVehicle['hauler']) {
                drawTextDynamicPage2('/', margin + 189, originalHeight1 - 1025, 300, 28);
            }
            if (typeVehicle['bus']) {
                drawTextDynamicPage2('/', margin + 442, originalHeight1 - 1025, 300, 28);
            }
            if (typeVehicle['armoredCar']) {
                drawTextDynamicPage2('/', margin + 607, originalHeight1 - 1025, 300, 28);
            }
            if (typeVehicle['animal']) {
                drawTextDynamicPage2('/', margin + 875, originalHeight1 - 1025, 300, 28);
            }
            if (typeVehicle['vehicleOthers']) {
                drawTextDynamicPage2('/', margin + 1148, originalHeight1 - 1025, 300, 28);
                drawTextDynamicPage2(typeVehicle['vehicleOthers'], margin + 1300, originalHeight1 - 1025, 300, 28);
            }

            if (typeVehicle['vehicleMake']) {
                drawTextDynamicPage2(typeVehicle['vehicleMake'], margin + 120, originalHeight1 - 1070, 300, 28);
            }
            if (typeVehicle['vehicleModel']) {
                drawTextDynamicPage2(typeVehicle['vehicleModel'], margin + 530, originalHeight1 - 1070, 300, 28);
            }
            if (typeVehicle['plateNumber']) {
                drawTextDynamicPage2(typeVehicle['plateNumber'], margin + 945, originalHeight1 - 1070, 300, 28);
            }
            if (typeVehicle['tcBodyNumber']) {
                drawTextDynamicPage2(typeVehicle['tcBodyNumber'], margin + 1410, originalHeight1 - 1070, 300, 28);
            }


            if (maneuver['leftTurn']) {
                drawTextDynamicPage2('/', margin + 212, originalHeight1 - 1118, 300, 28);
            }
            if (maneuver['rightTurn']) {
                drawTextDynamicPage2('/', margin + 212, originalHeight1 - 1155, 300, 28);
            }
            if (maneuver['uTurn']) {
                drawTextDynamicPage2('/', margin + 212, originalHeight1 - 1193, 300, 28);
            }

            if (maneuver['crossTraffic']) {
                drawTextDynamicPage2('/', margin + 441, originalHeight1 - 1118, 300, 28);
            }
            if (maneuver['merging']) {
                drawTextDynamicPage2('/', margin + 441, originalHeight1 - 1155, 300, 28);
            }
            if (maneuver['diverging']) {
                drawTextDynamicPage2('/', margin + 441, originalHeight1 - 1193, 300, 28);
            }

            if (maneuver['overtaking']) {
                drawTextDynamicPage2('/', margin + 705, originalHeight1 - 1118, 300, 28);
            }
            if (maneuver['goingAhead']) {
                drawTextDynamicPage2('/', margin + 705, originalHeight1 - 1155, 300, 28);
            }
            if (maneuver['reversing']) {
                drawTextDynamicPage2('/', margin + 705, originalHeight1 - 1193, 300, 28);
            }

            if (maneuver['suddenStop']) {
                drawTextDynamicPage2('/', margin + 938, originalHeight1 - 1118, 300, 28);
            }
            if (maneuver['suddenStart']) {
                drawTextDynamicPage2('/', margin + 938, originalHeight1 - 1155, 300, 28);
            }
            if (maneuver['parkedOffRoad']) {
                drawTextDynamicPage2('/', margin + 938, originalHeight1 - 1193, 300, 28);
            }

            if (maneuver['parkedOnRoad']) {
                drawTextDynamicPage2('/', margin + 1245, originalHeight1 - 1118, 300, 28);
            }
            if (maneuver['otherManeuver']) {
                drawTextDynamicPage2('/', margin + 1245, originalHeight1 - 1155, 300, 28);
                drawTextDynamicPage2(maneuver['otherManeuver'], margin + 1285, originalHeight1 - 1193, 300, 28);
            }


            if (damage['damageRear']) {
                drawTextDynamicPage2('/', margin + 170, originalHeight1 - 1235, 300, 28);
            }
            if (damage['damageRoof']) {
                drawTextDynamicPage2('/', margin + 300, originalHeight1 - 1235, 300, 28);
            }
            if (damage['damageNone']) {
                drawTextDynamicPage2('/', margin + 35, originalHeight1 - 1268, 300, 28);
            }
            if (damage['damageRight']) {
                drawTextDynamicPage2('/', margin + 170, originalHeight1 - 1268, 300, 28);
            }
            if (damage['damageMultiple']) {
                drawTextDynamicPage2('/', margin + 300, originalHeight1 - 1268, 300, 28);
            }
            if (damage['damageFront']) {
                drawTextDynamicPage2('/', margin + 35, originalHeight1 - 1308, 300, 28);
            }
            if (damage['damageLeft']) {
                drawTextDynamicPage2('/', margin + 170, originalHeight1 - 1308, 300, 28);
            }
            if (damage['damageOthers']) {
                drawTextDynamicPage2('/', margin + 300, originalHeight1 - 1308, 300, 28);
            }


            if (defect['defectBrakes']) {
                drawTextDynamicPage2('/', margin + 643, originalHeight1 - 1235, 300, 28);
            }
            if (defect['defectMultiple']) {
                drawTextDynamicPage2('/', margin + 843, originalHeight1 - 1235, 300, 28);
            }
            if (defect['defectNone']) {
                drawTextDynamicPage2('/', margin + 500, originalHeight1 - 1268, 300, 28);
            }
            if (defect['defectSteering']) {
                drawTextDynamicPage2('/', margin + 643, originalHeight1 - 1268, 300, 28);
            }
            if (defect['defectEngine']) {
                drawTextDynamicPage2('/', margin + 843, originalHeight1 - 1268, 300, 28);
            }
            if (defect['defectLights']) {
                drawTextDynamicPage2('/', margin + 500, originalHeight1 - 1308, 300, 28);
            }
            if (defect['defectTires']) {
                drawTextDynamicPage2('/', margin + 643, originalHeight1 - 1308, 300, 28);
            }
            if (defect['defectOthers']) {
                drawTextDynamicPage2('/', margin + 843, originalHeight1 - 1308, 300, 28);
            }

            if (loading['loadingLegal']) {
                drawTextDynamicPage2('/', margin + 1050, originalHeight1 - 1263, 300, 28);
            }
            if (loading['loadingUnsafe']) {
                drawTextDynamicPage2('/', margin + 1295, originalHeight1 - 1263, 300, 28);
            }
            if (loading['loadingOverloaded']) {
                drawTextDynamicPage2('/', margin + 1050, originalHeight1 - 1303, 300, 28);
            }

            if (part3['part3']) {
                drawTextDynamicPage2(part3['part3'], margin + 900, originalHeight1 - 1348, 300, 28);
            }

            if (involvement['involvement_driver']) {
                drawTextDynamicPage2('/', margin + 240, originalHeight1 - 1385, 300, 28);
            }
            if (involvement['involvement_passenger']) {
                drawTextDynamicPage2('/', margin + 395, originalHeight1 - 1385, 300, 28);
            }
            if (involvement['involvement_pedestrian']) {
                drawTextDynamicPage2('/', margin + 605, originalHeight1 - 1385, 300, 28);
            }
            if (involvement['licenseNumber']) {
                drawTextDynamicPage2(involvement['licenseNumber'], margin + 1030, originalHeight1 - 1385, 300, 28);
            }
            if (involvement['involvement_pedestrian']) {
                drawTextDynamicPage2('/', margin + 1333, originalHeight1 - 1385, 300, 28);
            }

            if (driverError['driverErrorFatigued']) {
                drawTextDynamicPage2('/', margin + 32, originalHeight1 - 1452, 300, 28);
            }
            if (driverError['driverErrorNoSignal']) {
                drawTextDynamicPage2('/', margin + 337, originalHeight1 - 1452, 300, 28);
            }
            if (driverError['driverErrorBadOvertaking']) {
                drawTextDynamicPage2('/', margin + 32, originalHeight1 - 1487, 300, 28);
            }
            if (driverError['driverErrorInattentive']) {
                drawTextDynamicPage2('/', margin + 337, originalHeight1 - 1487, 300, 28);
            }
            if (driverError['driverErrorBadTurning']) {
                drawTextDynamicPage2('/', margin + 32, originalHeight1 - 1524, 300, 28);
            }
            if (driverError['driverErrorTooFast']) {
                drawTextDynamicPage2('/', margin + 337, originalHeight1 - 1524, 300, 28);
            }
            if (driverError['driverErrorUsingCellphone']) {
                drawTextDynamicPage2('/', margin + 32, originalHeight1 - 1556, 300, 28);
            }
            if (driverError['driverErrorTooClose']) {
                drawTextDynamicPage2('/', margin + 337, originalHeight1 - 1556, 300, 28);
            }

            if (injury['injuryFatal']) {
                drawTextDynamicPage2('/', margin + 560, originalHeight1 - 1452, 300, 28);
            }
            if (injury['injurySerious']) {
                drawTextDynamicPage2('/', margin + 560, originalHeight1 - 1487, 300, 28);
            }
            if (injury['injuryMinor']) {
                drawTextDynamicPage2('/', margin + 560, originalHeight1 - 1524, 300, 28);
            }
            if (injury['injuryNotInjured']) {
                drawTextDynamicPage2('/', margin + 560, originalHeight1 - 1556, 300, 28);
            }

            if (alcoholDrugs['alcoholSuspected']) {
                drawTextDynamicPage2('/', margin + 800, originalHeight1 - 1458, 300, 28);
            }
            if (alcoholDrugs['drugsSuspected']) {
                drawTextDynamicPage2('/', margin + 800, originalHeight1 - 1508, 300, 28);
            }

            if (seatbeltHelmet['seatbeltHelmetWorn']) {
                drawTextDynamicPage2('/', margin + 1155, originalHeight1 - 1452, 300, 28);
            }
            if (seatbeltHelmet['seatbeltHelmetNotWorn']) {
                drawTextDynamicPage2('/', margin + 1155, originalHeight1 - 1487, 300, 28);
            }
            if (seatbeltHelmet['seatbeltHelmetNotWornCorrectly']) {
                drawTextDynamicPage2('/', margin + 1155, originalHeight1 - 1524, 300, 28);
            }
            if (seatbeltHelmet['seatbeltHelmetNoSeatbelt']) {
                drawTextDynamicPage2('/', margin + 1155, originalHeight1 - 1556, 300, 28);
            }

            // Save the PDF and create a URL
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };


    return (
        <div>
            <button onClick={generatePdf} style={{ marginBottom: "10px", marginRight: '5px' }}>
                Generate PDF
            </button>

            {pdfUrl && (
                <a href={pdfUrl} download="generated.pdf">
                    Download PDF
                </a>
            )}
        </div>
    );
};

export default GeneratePdf;
