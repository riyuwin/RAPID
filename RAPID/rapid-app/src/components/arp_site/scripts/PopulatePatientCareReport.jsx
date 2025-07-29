import { collection, query, where, onSnapshot, documentId } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase";

export const PopulatePatientCareReport = async (patientCareDetails) => {
    try {
        // Validate patientCareDetails array and its first element
        if (!Array.isArray(patientCareDetails) || !patientCareDetails[0]) {
            console.error("Invalid patient care details");
            return;
        }

        const callDetsMapping = {
            callReceived: "callReceived",
            toScene: "toScene",
            atScene: "atSceneInput",
            toHospital: "toHospitalInput",
            atHospital: "atHospitalInput",
            base: "baseInput",
        };

        const basicInformationMapping = {
            firstName: "nameInput",
            middleName: "middleNameInput",
            surname: "surnameInput",
            extName: "suffixInput",
            age: "ageInput",
            gender: "genderSelect",
            birthdate: "birthdateInput",
            nationality: "nationalitySelect",
            addressInput: "addressInput",
        };

        const triageTagging = {
            triageTaggingR: "triageTaggingR",
            triageTaggingY: "triageTaggingY",
            triageTaggingG: "triageTaggingG",
            triageTaggingB: "triageTaggingB",
        };

        const natureCall = {
            natureCallEmergent: "natureCallEmergent",
            natureCallUrgent: "natureCallUrgent",
            natureCallNonEmergent: "natureCallNonEmergent",
        };

        const cardiac = {
            cardiacArrest: "cardiacArrest",
            cardiacArrhythmia: "cardiacArrhythmia",
            cardiacChestPain: "cardiacChestPain",
            heartFailure: "heartFailure",
            otherCardiacInput: "otherCardiacInput",
        };

        const obs_gnyae = {
            obsGynHaemorrhage: "obsGynHaemorrhage",
            obsGynHaemorrhageLess: "obsGynHaemorrhageLess",
            obsGynLabour: "obsGynLabour",
            obsGynPPH: "obsGynPPH",
            obsGynPreDelivery: "obsGynPreDelivery",
            otherObsGynInput: "otherObsGynInput"
        };

        const neurological = {
            neurologicalAlteredLOC: "neurologicalAlteredLOC",
            neurologicalSeizures: "neurologicalSeizures",
            neurologicalStroke: "neurologicalStroke",
            otherNeurologicalInput: "otherNeurologicalInput",
        };

        const trauma = {
            traumaBurns: "traumaBurns",
            traumaDislocation: "traumaDislocation",
            traumaFracture: "traumaFracture",
            traumaHaemorrhage: "traumaHaemorrhage",
            traumaHeadInjury: "traumaHeadInjury",
            traumaMaxilloFacial: "traumaMaxilloFacial",
            traumaMultiple: "traumaMultiple",
            traumaOpenWound: "traumaOpenWound",
            traumaShock: "traumaShock",
            traumaSoftTissue: "traumaSoftTissue",
            traumaSpinal: "traumaSpinal",
            otherTraumaInput: "otherTraumaInput",
        };

        const mechanismInjury = {
            mechanismInjuryAssault: "mechanismInjuryAssault",
            mechanismInjuryAnimalAttack: "mechanismInjuryAnimalAttack",
            mechanismInjuryChemical: "mechanismInjuryChemical",
            mechanismInjuryDrowning: "mechanismInjuryDrowning",
            mechanismInjuryElectrocution: "mechanismInjuryElectrocution",
            mechanismInjuryCold: "mechanismInjuryCold",
            mechanismInjuryHeat: "mechanismInjuryHeat",
            mechanismInjuryFall: "mechanismInjuryFall",
            mechanismInjuryFirearm: "mechanismInjuryFirearm",
            mechanismInjuryChild: "mechanismInjuryChild",
            mechanismInjuryMachinery: "mechanismInjuryMachinery",
            mechanismInjuryRTA: "mechanismInjuryRTA",
            mechanismInjurySmoke: "mechanismInjurySmoke",
            mechanismInjurySports: "mechanismInjurySports",
            mechanismInjuryStabbing: "mechanismInjuryStabbing",
            mechanismInjuryStumble: "mechanismInjuryStumble",
            mechanismInjuryWater: "mechanismInjuryWater",
            mechanismInjuryOtherInput: "mechanismInjuryOtherInput",
        };

        const medical = {
            medicalBackPain: "medicalBackPain",
            medicalDiabetes: "medicalDiabetes",
            medicalFever: "medicalFever",
            medicalHeadache: "medicalHeadache",
            medicalHypothermia: "medicalHypothermia",
            medicalOtherInput: "medicalOtherInput",
        };

        const respiratory = {
            respiratoryAsthma: "respiratoryAsthma",
            respiratoryCOPD: "respiratoryCOPD",
            respiratoryFBAO: "respiratoryFBAO",
            respiratoryArrest: "respiratoryArrest",
            respiratorySmoke: "respiratorySmoke",
            respiratoryOtherInput: "respiratoryOtherInput",
        };

        const general = {
            generalAbdominalPain: "generalAbdominalPain",
            generalAllergicReaction: "generalAllergicReaction",
            generalBehavioralDisorder: "generalBehavioralDisorder",
            generalIllnessUnknown: "generalIllnessUnknown",
            generalNausea: "generalNausea",
            generalPoisoning: "generalPoisoning",
            generalSyncope: "generalSyncope",
            generalOtherInput: "generalOtherInput",
        };

        const circumstances = {
            circumstancesAccident: "circumstancesAccident",
            circumstancesEvent: "circumstancesEvent",
            circumstancesSelfHarm: "circumstancesSelfHarm",
        };

        const clinicalStatus = {
            clinicalLifeThreatening: "clinicalLifeThreatening",
            clinicalSerious: "clinicalSerious",
            clinicalNonSerious: "clinicalNonSerious",
        };

        const motor = {
            motorNone: "motorNone",
            motorExtension: "motorExtension",
            motorFlexion: "motorFlexion",
            motorWithdraw: "motorWithdraw",
            motorLocalize: "motorLocalize",
            motorObey: "motorObey",
        };

        const verbal = {
            verbalNone: "verbalNone",
            verbalIncomprehensible: "verbalIncomprehensible",
            verbalInappropriate: "verbalInappropriate",
            verbalConfused: "verbalConfused",
            verbalOriented: "verbalOriented",
        };

        const eye_opening = {
            eyeNone: "eyeNone",
            eyeToPain: "eyeToPain",
            eyeToVoice: "eyeToVoice",
            eyeSpontaneous: "eyeSpontaneous",
            gcsTotal: "gcsTotal",
        };

        const pulse = {
            pulsePositive: "pulsePositive",
            pulseRapid: "pulseRapid",
            pulseSlow: "pulseSlow",
            pulseNegative: "pulseNegative",
        };

        const airway = {
            airwayClear: "airwayClear",
            airwayPartial: "airwayPartial",
            airwayObstructed: "airwayObstructed",
        };

        const breathing = {
            breathingNormal: "breathingNormal",
            breathingRapid: "breathingRapid",
            breathingSlow: "breathingSlow",
            breathingShallow: "breathingShallow",
            breathingHyperventilate: "breathingHyperventilate",
            breathingNone: "breathingNone",
        };

        const gagReflex = {
            gagReflexPresent: "gagReflexPresent",
            gagReflexAbsent: "gagReflexAbsent",
        };

        const complaintDets = {
            chiefComplaintInput: "chiefComplaintInput",
            historyInput: "historyInput",
            signsSymptomsInput: "signsSymptomsInput",
            allergiesInput: "allergiesInput",
            medicationsInput: "medicationsInput",
            pastMedicalHistoryInput: "pastMedicalHistoryInput",
            lastMealIntakeInput: "lastMealIntakeInput",
            timeInput: "timeInput",
            eventPriorInput: "eventPriorInput",
        };

        const vitalSigns = {
            row1LOCA: "row1LOCA",
            row1LOCV: "row1LOCV",
            row1LOCP: "row1LOCP",
            row1LOCU: "row1LOCU",
            row1BP: "row1BP",
            row1PR: "row1PR",
            row1RR: "row1RR",
            row1SPO2: "row1SPO2",
            row1TEMP: "row1TEMP",
            row1Time: "row1Time",

            row2LOCA: "row2LOCA",
            row2LOCV: "row2LOCV",
            row2LOCP: "row2LOCP",
            row2LOCU: "row2LOCU",
            row2BP: "row2BP",
            row2PR: "row2PR",
            row2RR: "row2RR",
            row2SPO2: "row2SPO2",
            row2TEMP: "row2TEMP",
            row2Time: "row2Time",

            row3LOCA: "row3LOCA",
            row3LOCV: "row3LOCV",
            row3LOCP: "row3LOCP",
            row3LOCU: "row3LOCU",
            row3BP: "row3BP",
            row3PR: "row3PR",
            row3RR: "row3RR",
            row3SPO2: "row3SPO2",
            row3TEMP: "row3TEMP",
            row3Time: "row3Time",

            row4LOCA: "row4LOCA",
            row4LOCV: "row4LOCV",
            row4LOCP: "row4LOCP",
            row4LOCU: "row4LOCU",
            row4BP: "row4BP",
            row4PR: "row4PR",
            row4RR: "row4RR",
            row4SPO2: "row4SPO2",
            row4TEMP: "row4TEMP",
            row4Time: "row4Time",
        };

        const pupilDets = {
            "Pearrl-L": "Pearrl-L",
            "Pearrl-R": "Pearrl-R",
            "Clear-L": "Clear-L",
            "Clear-R": "Clear-R",
            "limbYes": "limbYes",
            "limbNo": "limbNo",
            "row1lm": "row1lm",

            "Pinpoint-L": "Pinpoint-L",
            "Pinpoint-R": "Pinpoint-R",
            "AbsentL": "AbsentL",
            "AbsentR": "AbsentR",
            "armsYes": "armsYes",
            "armsNo": "armsNo",
            "row2LM": "row2LM",

            "dLatedL": "dLatedL",
            "dLatedR": "dLatedR",
            "decreaseL": "decreaseL",
            "decreaseR": "decreaseR",
            "arms2Yes": "arms2Yes",
            "arms2No": "arms2No",
            "row3LM": "row3LM",

            "sluggishL": "sluggishL",
            "sluggishR": "sluggishR",
            "cracklesL": "cracklesL",
            "cracklesR": "cracklesR",
            "legs1Yes": "legs1Yes",
            "legs1No": "legs1No",
            "row4LM": "row4LM",

            "fixedL": "fixedL",
            "fixedR": "fixedR",
            "ronchiL": "ronchiL",
            "ronchiR": "ronchiR",
            "legs2Yes": "legs2Yes",
            "legs2No": "legs2No",
            "row5LM": "row5LM",

            "cataractL": "cataractL",
            "cataractR": "cataractR",
            "wheezeL": "wheezeL",
            "wheezeR": "wheezeR",
            "legs3Yes": "legs3Yes",
            "legs3No": "legs3No",
            "row6LM": "row6LM",
        };

        const wound = {
            "bleedingControl": "bleedingContol",
            "appliedAntiseptic": "appliedAntiseptic",
            "cleaning": "cleaning",
            "dressingBandaging": "dressingBandaging",
        };

        const care = {
            "cleaning": "cleaning",
            "dressingBandaging": "dressingBandaging",
        };

        const immobilisation = {
            "c-collar": "c-collar",
            "spineboard": "spineboard",
            "KED": "KED",
            "splints": "splints",
            "scoopStretcher": "scoopStretcher",
            "immobilisationOthers": "immobilisationOthers",
        };

        const condition = {
            "deformity": "deformity",
            "confusion": "confusion",
            "abrasion": "abrasion",
            "puncture": "puncture",
            "burn": "burn",
            "tenderness": "tenderness",
            "laceration": "laceration",
            "swelling": "swelling",
            "fracture": "fracture",
            "avulsion": "avulsion",
            "dislocation": "dislocation",
            "pain": "pain",
            "rashes": "rashes",
            "numbness": "numbness",
        };

        const characterModel = {
            "rightHead": "rightHead",
            "rightNeck": "rightNeck",
            "rightShoulder": "rightShoulder",
            "rightChest": "rightChest",
            "rightArm": "rightArm",
            "rightHand": "rightHand",
            "rightAbdomen": "rightAbdomen",
            "rightHip": "rightHip",
            "rightThigh": "rightThigh",
            "rightKnee": "rightKnee",
            "rightShin": "rightShin",
            "rightFoot": "rightFoot",
            "leftHead": "leftHead",
            "leftNeck": "leftNeck",
            "leftShoulder": "leftShoulder",
            "leftChest": "leftChest",
            "leftArm": "leftArm",
            "leftHand": "leftHand",
            "leftAbdomen": "leftAbdomen",
            "leftHip": "leftHip",
            "leftThigh": "leftThigh",
            "leftKnee": "leftKnee",
            "leftShin": "leftShin",
            "leftFoot": "leftFoot",

            "rightBackHead": "rightBackHead",
            "rightBackNeck": "rightBackNeck",
            "rightBackShoulder": "rightBackShoulder",
            "rightBackArm": "rightBackArm",
            "rightBackHand": "rightBackHand",
            "rightBackUpperBack": "rightBackUpperBack",
            "rightBackLowerBack": "rightBackLowerBack",
            "rightBackHip": "rightBackHip",
            "rightBackThigh": "rightBackThigh",
            "rightCalf": "rightCalf",
            "rightBackFoot": "rightBackFoot",
            "leftBackHead": "leftBackHead",
            "leftBackNeck": "leftBackNeck",
            "leftBackShoulder": "leftBackShoulder",
            "leftBackArm": "leftBackArm",
            "leftBackHand": "leftBackHand",
            "leftBackUpperBack": "leftBackUpperBack",
            "leftBackLowerBack": "leftBackLowerBack",
            "leftBackHip": "leftBackHip",
            "leftBackThigh": "leftBackThigh",
            "leftCalf": "leftCalf",
            "leftBackFoot": "leftBackFoot",
        }

        const endorsedTeam = {
            "endorsedByTeam": "endorsedByTeam",
            "tlInput": "tlInput",
            "r1Input": "r1Input",
            "r2Input": "r2Input",
            "r3Input": "r3Input",
            "r4Input": "r4Input",
            "r5Input": "r5Input",
        };

        const incidentType = {
            "vehicularAccident": "vehicularAccident",
            "medicalAttention": "medicalAttention",
            "patientTransport": "patientTransport",
            "openWaterIncident": "openWaterIncident",
            "drowningIncident": "drowningIncident",
            "maritimeIncident": "maritimeIncident",
            "fireIncident": "fireIncident",
            "specialCases": "specialCases",
            "incidentSummary": "incidentSummary",
            "noPatientFound": "noPatientFound",
        };

        const incidentLocation = {
            "incident_sameAsResidence": "incident_sameAsResidence",
            "incident_landmarkPlace": "incident_landmarkPlace",
            "incident_roadStreetName": "incident_roadStreetName",
            "incident_purok": "incident_purok",
            "incident_barangay": "incident_barangay",
            "incident_municipalityCity": "incident_municipalityCity",
            "incident_province": "incident_province",
        };

        const transportLocation = {
            "transport_sameAsResidence": "transport_sameAsResidence",
            "transport_refusedTransport": "transport_refusedTransport",
            "transport_landmarkPlace": "transport_landmarkPlace",
            "transport_roadStreetName": "transport_roadStreetName",
            "transport_purok": "transport_purok",
            "transport_barangay": "transport_barangay",
            "transport_municipalityCity": "transport_municipalityCity",
            "transport_province": "transport_province",
        };

        const part1 = {
            "selfAccident": "selfAccident",
            "motorVehicleCollision": "motorVehicleCollision",
            "collision_incidentSummary": "collision_incidentSummary",
        };

        const severity = {
            "fatal": "fatal",
            "injury": "injury",
            "propertyDamage": "propertyDamage",
        };

        const incidentMainCause = {
            "humanError": "humanError",
            "vehicleDefect": "vehicleDefect",
            "roadDefect": "roadDefect",
        };

        const collisionType = {
            "rearEnd": "rearEnd",
            "sideSwipe": "sideSwipe",
            "headOn": "headOn",
            "hitObject": "hitObject",
            "hitPedestrian": "hitPedestrian",
            "sideImpact": "sideImpact",
            "rollover": "rollover",
            "multipleVehicle": "multipleVehicle",
            "hitParkedVehicle": "hitParkedVehicle",
            "hitAnimal": "hitAnimal",
            "incidentDescription": "incidentDescription",
        };

        const part2 = {
            "vehicularAccidentDetails": "vehicularAccidentDetails",
        };

        const classification = {
            "classificationPrivate": "classificationPrivate",
            "classificationPublic": "classificationPublic",
            "classificationGovernment": "classificationGovernment",
            "classificationDiplomat": "classificationDiplomat",
        };

        const typeVehicle = {
            "motorcycle": "motorcycle",
            "bike": "bike",
            "jeepney": "jeepney",
            "ambulance": "ambulance",
            "heavyEquipment": "heavyEquipment",
            "aircraft": "aircraft",
            "tricycle": "tricycle",
            "eBike": "eBike",
            "horseDriven": "horseDriven",
            "pushCart": "pushCart",
            "car": "car",
            "eTricycle": "eTricycle",
            "pedicab": "pedicab",
            "fourWheelsAtv": "fourWheelsAtv",
            "waterVessel": "waterVessel",
            "truck": "truck",
            "hauler": "hauler",
            "bus": "bus",
            "armoredCar": "armoredCar",
            "animal": "animal",
            "vehicleOthers": "vehicleOthers",
            "vehicleMake": "vehicleMake",
            "vehicleModel": "vehicleModel",
            "plateNumber": "plateNumber",
            "tcBodyNumber": "tcBodyNumber",
        };

        const maneuver = {
            "leftTurn": "leftTurn",
            "rightTurn": "rightTurn",
            "uTurn": "uTurn",
            "crossTraffic": "crossTraffic",
            "merging": "merging",
            "diverging": "diverging",
            "overtaking": "overtaking",
            "goingAhead": "goingAhead",
            "reversing": "reversing",
            "suddenStop": "suddenStop",
            "suddenStart": "suddenStart",
            "parkedOffRoad": "parkedOffRoad",
            "parkedOnRoad": "parkedOnRoad",
            "otherManeuver": "otherManeuver",
        };

        const damage = {
            "damageRear": "damageRear",
            "damageRoof": "damageRoof",
            "damageNone": "damageNone",
            "damageRight": "damageRight",
            "damageMultiple": "damageMultiple",
            "damageFront": "damageFront",
            "damageLeft": "damageLeft",
            "damageOthers": "damageOthers",
            "damageOthersInput": "damageOthersInput",
        };

        const defect = {
            "defectBrakes": "defectBrakes",
            "defectMultiple": "defectMultiple",
            "defectNone": "defectNone",
            "defectSteering": "defectSteering",
            "defectEngine": "defectEngine",
            "defectLights": "defectLights",
            "defectTires": "defectTires",
            "defectOthers": "defectOthers",
            "defectOthersInput": "defectOthersInput",
        };

        const loading = {
            "loadingLegal": "loadingLegal",
            "loadingOverloaded": "loadingOverloaded",
            "loadingUnsafe": "loadingUnsafe",
        };

        const part3 = {
            "part3": "part3",
        };

        const involvement = {
            "involvement_driver": "involvement_driver",
            "involvement_passenger": "involvement_passenger",
            "involvement_pedestrian": "involvement_pedestrian",
            "licenseNumber": "licenseNumber",
            "NolicenseNumber": "NolicenseNumber",
        };

        const driverError = {
            "driverErrorFatigued": "driverErrorFatigued",
            "driverErrorNoSignal": "driverErrorNoSignal",
            "driverErrorBadOvertaking": "driverErrorBadOvertaking",
            "driverErrorInattentive": "driverErrorInattentive",
            "driverErrorBadTurning": "driverErrorBadTurning",
            "driverErrorTooFast": "driverErrorTooFast",
            "driverErrorUsingCellphone": "driverErrorUsingCellphone",
            "driverErrorTooClose": "driverErrorTooClose",
        };

        const injury = {
            "injuryFatal": "injuryFatal",
            "injurySerious": "injurySerious",
            "injuryMinor": "injuryMinor",
            "injuryNotInjured": "injuryNotInjured",
        };

        const alcoholDrugs = {
            "alcoholSuspected": "alcoholSuspected",
            "drugsSuspected": "drugsSuspected",
        };

        const seatbeltHelmet = {
            "seatbeltHelmetWorn": "seatbeltHelmetWorn",
            "seatbeltHelmetNotWorn": "seatbeltHelmetNotWorn",
            "seatbeltHelmetNotWornCorrectly": "seatbeltHelmetNotWornCorrectly",
            "seatbeltHelmetNoSeatbelt": "seatbeltHelmetNoSeatbelt",
        };

        console.log("hello ", patientCareDetails)


        // Check and populate `callDets` data
        if (patientCareDetails[0].callDets) {
            Object.entries(callDetsMapping).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].callDets[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);
                    if (inputElement) {
                        inputElement.value = value; // Populate the input field
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `basicInformation` data if needed
        if (patientCareDetails[0].basicInformation) {
            Object.entries(basicInformationMapping).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].basicInformation[firestoreField];
                if (value !== undefined && value !== null) {
                    const inputElement = document.getElementById(inputId);
                    if (inputElement) {
                        const inputValue = inputElement.value = value;

                        if (patientCareDetails.length > 0 && patientCareDetails[0].basicInformation) {
                            const nationality = patientCareDetails[0].basicInformation['nationality'];
                            const nationalitySelect = document.getElementById('nationalitySelect');
                            const otherNationality = document.getElementById('otherNationality');

                            if (nationalitySelect) {
                                if (nationality !== "Filipino") {
                                    nationalitySelect.value = "Other";
                                    otherNationality.value = nationality;
                                }
                            } else {
                                console.error("Nationality select or input field not found in the DOM.");
                            }
                        } else {
                            console.error("patientCareDetails is empty or missing basicInformation.");
                        }


                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `triageTagging` data if needed
        if (patientCareDetails[0].triageTagging) {
            Object.entries(triageTagging).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].triageTagging[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const checkboxElement = document.getElementById(inputId);
                    if (checkboxElement) {
                        checkboxElement.checked = value; // Set the checkbox based on the Firestore value (true or false)
                    } else {
                        console.warn(`Checkbox element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].natureCall) {
            Object.entries(natureCall).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].natureCall[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const checkboxElement = document.getElementById(inputId);
                    if (checkboxElement) {
                        checkboxElement.checked = value; // Set the checkbox based on the Firestore value (true or false)
                    } else {
                        console.warn(`Checkbox element with ID '${inputId}' not found`);
                    }
                }
            });
        }


        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].cardiac) {
            Object.entries(cardiac).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].cardiac[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            const isChecked = document.getElementById('otherCardiac').checked = true;
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].obs_gnyae) {
            Object.entries(obs_gnyae).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].obs_gnyae[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            const isChecked = document.getElementById('otherObsGyn').checked = true;
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].neurological) {
            Object.entries(neurological).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].neurological[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            const isChecked = document.getElementById('otherNeurological').checked = true;
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].trauma) {
            Object.entries(trauma).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].trauma[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            const isChecked = document.getElementById('otherTrauma').checked = true;
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        /* if (patientCareDetails[0].mechanismInjury) {
            Object.entries(mechanismInjury).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].mechanismInjury[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            const isChecked = document.getElementById('mechanismInjuryOther').checked = true;
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        } */

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].medical) {
            Object.entries(medical).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].medical[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            const isChecked = document.getElementById('medicalOther').checked = true;
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].respiratory) {
            Object.entries(respiratory).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].respiratory[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            const isChecked = document.getElementById('respiratoryOther').checked = true;
                            console.log(isChecked)
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].general) {
            Object.entries(general).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].general[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            const isChecked = document.getElementById('generalOther').checked = true;
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].circumstances) {
            Object.entries(circumstances).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].circumstances[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].clinicalStatus) {
            Object.entries(clinicalStatus).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].clinicalStatus[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            const isChecked = document.getElementById('generalOther').checked = true;
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].motor) {
            Object.entries(motor).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].motor[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "radio") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].verbal) {
            Object.entries(verbal).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].verbal[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].verbal) {
            Object.entries(verbal).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].verbal[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "radio") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].eye_opening) {
            Object.entries(eye_opening).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].eye_opening[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "radio") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].eye_opening) {
            Object.entries(eye_opening).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].eye_opening[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].pulse) {
            Object.entries(pulse).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].pulse[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "radio") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].airway) {
            Object.entries(airway).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].airway[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "radio") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].breathing) {
            Object.entries(breathing).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].breathing[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "radio") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].gagReflex) {
            Object.entries(gagReflex).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].gagReflex[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "radio") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].complaintDets) {
            Object.entries(complaintDets).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].complaintDets[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }


        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].vitalSigns) {
            Object.entries(vitalSigns).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].vitalSigns[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "radio") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].pupilDets) {
            Object.entries(pupilDets).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].pupilDets[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "radio") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].wound) {
            Object.entries(wound).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].wound[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].care) {
            Object.entries(care).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].care[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].immobilisation) {
            Object.entries(immobilisation).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].immobilisation[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].condition) {
            Object.entries(condition).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].condition[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].characterModel) {
            Object.entries(characterModel).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].characterModel[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].endorsedTeam) {
            Object.entries(endorsedTeam).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].endorsedTeam[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].incidentType) {
            Object.entries(incidentType).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].incidentType[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].incidentLocation) {
            Object.entries(incidentLocation).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].incidentLocation[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].transportLocation) {
            Object.entries(transportLocation).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].transportLocation[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].part1) {
            Object.entries(part1).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].part1[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].severity) {
            Object.entries(severity).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].severity[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].incidentMainCause) {
            Object.entries(incidentMainCause).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].incidentMainCause[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "radio") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].collisionType) {
            Object.entries(collisionType).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].collisionType[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].part2) {
            Object.entries(part2).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].part2[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].classification) {
            Object.entries(classification).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].classification[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].typeVehicle) {
            Object.entries(typeVehicle).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].typeVehicle[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].maneuver) {
            Object.entries(maneuver).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].maneuver[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].damage) {
            Object.entries(damage).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].damage[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            const isChecked = document.getElementById('damageOthers').checked = true;
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].defect) {
            Object.entries(defect).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].defect[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            const isChecked = document.getElementById('defectOthers').checked = true;
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].loading) {
            Object.entries(loading).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].loading[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].part3) {
            Object.entries(part3).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].part3[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].involvement) {
            Object.entries(involvement).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].involvement[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].driverError) {
            Object.entries(driverError).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].driverError[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].injury) {
            Object.entries(injury).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].injury[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].alcoholDrugs) {
            Object.entries(alcoholDrugs).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].alcoholDrugs[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "checkbox") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

        // Check and populate `natureCall` data if needed
        if (patientCareDetails[0].seatbeltHelmet) {
            Object.entries(seatbeltHelmet).forEach(([firestoreField, inputId]) => {
                const value = patientCareDetails[0].seatbeltHelmet[firestoreField]; // Get Firestore value
                if (value !== undefined && value !== null) { // Check for valid value
                    const inputElement = document.getElementById(inputId);

                    if (inputElement) {
                        // Check if the input is a checkbox
                        if (inputElement.type === "radio") {
                            inputElement.checked = value; // Set the checkbox state based on the value
                        } else {
                            inputElement.value = value; // Set the input field value (for text inputs)
                        }
                    } else {
                        console.warn(`Input element with ID '${inputId}' not found`);
                    }
                }
            });
        }

    } catch (error) {
        console.error("An error occurred while populating patient care report:", error);
    }


};
