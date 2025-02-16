import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function CharacterModel({ data }) {
    console.log("Haaaa", data)

    const [characterModelData, setCharacterModelData] = useState({
        rightHead: null,
        rightNeck: null,
        rightShoulder: null,
        rightChest: null,
        rightArm: null,
        rightHand: null,
        rightAbdomen: null,
        rightHip: null,
        rightThigh: null,
        rightKnee: null,
        rightShin: null,
        rightFoot: null,
        leftHead: null,
        leftNeck: null,
        leftShoulder: null,
        leftChest: null,
        leftArm: null,
        leftHand: null,
        leftAbdomen: null,
        leftHip: null,
        leftThigh: null,
        leftKnee: null,
        leftShin: null,
        leftFoot: null,

        rightBackHead: null,
        rightBackNeck: null,
        rightBackShoulder: null,
        rightBackArm: null,
        rightBackHand: null,
        rightBackUpperBack: null,
        rightBackLowerBack: null,
        rightBackHip: null,
        rightBackThigh: null,
        rightCalf: null,
        rightBackFoot: null,
        leftBackHead: null,
        leftBackNeck: null,
        leftBackShoulder: null,
        leftBackArm: null,
        leftBackHand: null,
        leftBackUpperBack: null,
        leftBackLowerBack: null,
        leftBackHip: null,
        leftBackThigh: null,
        leftCalf: null,
        leftBackFoot: null,
    });


    /* useEffect(() => {
        if (data[0].characterModel) {
            setCharacterModelData(prevState => ({
                ...prevState, // Keep previous state
                ...data[0].characterModel // Merge new data
            }));
        }
    }, [data]); */

    useEffect(() => {
        if (Array.isArray(data) && data.length > 0 && data[0]?.characterModel) {
            console.log("Updating state with:", data[0].characterModel);
            setCharacterModelData(prevState => ({
                ...prevState,
                ...data[0].characterModel
            }));
        } else {
            // Reset all values to null if data is empty or invalid
            setCharacterModelData(prevState =>
                Object.keys(prevState).reduce((acc, key) => {
                    acc[key] = null;
                    return acc;
                }, {})
            );
        }
    }, [data]);


    return (
        <>

            <div className="col-md-6 position-relative d-flex justify-content-center align-items-center">
                <div style={{ position: "relative", maxWidth: "100%", height: "auto" }}>
                    <img
                        src="/assets/img/character_model.png"
                        alt="Character Model"
                        className="img-fluid"
                        style={{ width: "100%", height: "auto" }}
                    />

                    {characterModelData.rightHead && (
                        <img
                            src="/assets/img/FrontModel/RightHead.png"
                            alt="Right Head"
                            style={{
                                position: "absolute",
                                top: "2%",
                                left: "21%",
                                transform: "translateX(-50%)",
                                width: "4.5%",
                                height: "13%"
                            }}
                        />
                    )}

                    {characterModelData.rightNeck && (
                        <img
                            src="/assets/img/FrontModel/RightNeck.png"
                            alt="Right Head"
                            style={{
                                position: "absolute",
                                top: "12%",
                                left: "21.7%",
                                transform: "translateX(-50%)",
                                width: "3.4%",
                                height: "5%"
                            }}
                        />
                    )}

                    {characterModelData.rightShoulder && (
                        <img
                            src="/assets/img/FrontModel/RightShoulder.png"
                            alt="Right Head"
                            style={{
                                position: "absolute",
                                top: "17.7%",
                                left: "12.9%",
                                transform: "translateX(-50%)",
                                width: "3.8%",
                                height: "5%"
                            }}
                        />
                    )}

                    {characterModelData.rightChest && (
                        <img
                            src="/assets/img/FrontModel/RightChest.png"
                            alt="Left Chest"
                            style={{
                                position: "absolute",
                                top: "15.6%",
                                left: "19%",
                                transform: "translateX(-50%)",
                                width: "8.7%",
                                height: "14.5%"
                            }}
                        />
                    )}

                    {characterModelData.rightArm && (
                        <img
                            src="/assets/img/FrontModel/RightArm.png"
                            alt="Right Arm"
                            style={{
                                position: "absolute",
                                top: "22.4%",
                                left: "10.5%",
                                transform: "translateX(-50%)",
                                width: "9.3%",
                                height: "29%"
                            }}
                        />
                    )}

                    {characterModelData.rightHand && (
                        <img
                            src="/assets/img/FrontModel/RightHand.png"
                            alt="Right Arm"
                            style={{
                                position: "absolute",
                                top: "50.5%",
                                left: "5.5%",
                                transform: "translateX(-50%)",
                                width: "8%",
                                height: "10.5%"
                            }}
                        />
                    )}

                    {characterModelData.rightAbdomen && (
                        <img
                            src="/assets/img/FrontModel/RightAbdomen.png"
                            alt="Right Abdomen"
                            style={{
                                position: "absolute",
                                top: "30%",
                                left: "19.2%",
                                transform: "translateX(-50%)",
                                width: "8.5%",
                                height: "14%"
                            }}
                        />
                    )}

                    {characterModelData.rightHip && (
                        <img
                            src="/assets/img/FrontModel/RightHips.png"
                            alt="Right Hip"
                            style={{
                                position: "absolute",
                                top: "44%",
                                left: "19.2%",
                                transform: "translateX(-50%)",
                                width: "8.5%",
                                height: "5%"
                            }}
                        />
                    )}


                    {characterModelData.rightThigh && (
                        <img
                            src="/assets/img/FrontModel/RightThigh.png"
                            alt="Left Hip"
                            style={{
                                position: "absolute",
                                top: "49%",
                                left: "19.3%",
                                transform: "translateX(-50%)",
                                width: "8.7%",
                                height: "21%"
                            }}
                        />
                    )}

                    {characterModelData.rightKnee && (
                        <img
                            src="/assets/img/FrontModel/RightKnee.png"
                            alt="Right Knee"
                            style={{
                                position: "absolute",
                                top: "70%",
                                left: "20.4%",
                                transform: "translateX(-50%)",
                                width: "6%",
                                height: "7%"
                            }}
                        />
                    )}

                    {characterModelData.rightShin && (
                        <img
                            src="/assets/img/FrontModel/RightShin.png"
                            alt="Right Shin"
                            style={{
                                position: "absolute",
                                top: "77%",
                                left: "20.5%",
                                transform: "translateX(-50%)",
                                width: "6.1%",
                                height: "17%"
                            }}
                        />
                    )}

                    {characterModelData.rightFoot && (
                        <img
                            src="/assets/img/FrontModel/RightFoot.png"
                            alt="Right Foot"
                            style={{
                                position: "absolute",
                                top: "94%",
                                left: "21.1%",
                                transform: "translateX(-50%)",
                                width: "6.1%",
                                height: "4%"
                            }}
                        />
                    )}

                    {characterModelData.leftHead && (
                        <img
                            src="/assets/img/FrontModel/LeftHead.png"
                            alt="Right Head"
                            style={{
                                position: "absolute",
                                top: "2%",
                                left: "25.44%",
                                transform: "translateX(-50%)",
                                width: "4.5%",
                                height: "13%"
                            }}
                        />
                    )}

                    {characterModelData.leftNeck && (
                        <img
                            src="/assets/img/FrontModel/LeftNeck.png"
                            alt="Right Head"
                            style={{
                                position: "absolute",
                                top: "12%",
                                left: "24.8%",
                                transform: "translateX(-50%)",
                                width: "3%",
                                height: "5%"
                            }}
                        />
                    )}

                    {characterModelData.leftShoulder && (
                        <img
                            src="/assets/img/FrontModel/LeftShoulder.png"
                            alt="Left Shoulder"
                            style={{
                                position: "absolute",
                                top: "17.7%",
                                left: "33.5%",
                                transform: "translateX(-50%)",
                                width: "3.8%",
                                height: "5%"
                            }}
                        />
                    )}

                    {characterModelData.leftChest && (
                        <img
                            src="/assets/img/FrontModel/LeftChest.png"
                            alt="Left Chest"
                            style={{
                                position: "absolute",
                                top: "15.6%",
                                left: "27.4%",
                                transform: "translateX(-50%)",
                                width: "8.7%",
                                height: "14.5%"
                            }}
                        />
                    )}


                    {characterModelData.leftArm && (
                        <img
                            src="/assets/img/FrontModel/LeftArm.png"
                            alt="Left Arm"
                            style={{
                                position: "absolute",
                                top: "22.4%",
                                left: "36.3%",
                                transform: "translateX(-50%)",
                                width: "9.6%",
                                height: "29%"
                            }}
                        />
                    )}

                    {characterModelData.leftHand && (
                        <img
                            src="/assets/img/FrontModel/LeftHand.png"
                            alt="Right Arm"
                            style={{
                                position: "absolute",
                                top: "50.5%",
                                left: "41.5%",
                                transform: "translateX(-50%)",
                                width: "7.5%",
                                height: "10.5%"
                            }}
                        />
                    )}

                    {characterModelData.leftAbdomen && (
                        <img
                            src="/assets/img/FrontModel/LeftAbdomen.png"
                            alt="Left Abdomen"
                            style={{
                                position: "absolute",
                                top: "30%",
                                left: "27.4%",
                                transform: "translateX(-50%)",
                                width: "8.5%",
                                height: "14%"
                            }}
                        />
                    )}

                    {characterModelData.leftHip && (
                        <img
                            src="/assets/img/FrontModel/LeftHips.png"
                            alt="Left Hip"
                            style={{
                                position: "absolute",
                                top: "44%",
                                left: "27.5%",
                                transform: "translateX(-50%)",
                                width: "8.9%",
                                height: "5%"
                            }}
                        />
                    )}

                    {characterModelData.leftThigh && (
                        <img
                            src="/assets/img/FrontModel/LeftThigh.png"
                            alt="Left Hip"
                            style={{
                                position: "absolute",
                                top: "49%",
                                left: "27.8%",
                                transform: "translateX(-50%)",
                                width: "8.7%",
                                height: "21%"
                            }}
                        />
                    )}


                    {characterModelData.leftKnee && (
                        <img
                            src="/assets/img/FrontModel/LeftKnee.png"
                            alt="Left Knee"
                            style={{
                                position: "absolute",
                                top: "70%",
                                left: "26.7%",
                                transform: "translateX(-50%)",
                                width: "6%",
                                height: "7%"
                            }}
                        />
                    )}

                    {characterModelData.leftShin && (
                        <img
                            src="/assets/img/FrontModel/LeftShin.png"
                            alt="Left Shin"
                            style={{
                                position: "absolute",
                                top: "77%",
                                left: "27.2%",
                                transform: "translateX(-50%)",
                                width: "6.1%",
                                height: "17%"
                            }}
                        />
                    )}

                    {characterModelData.leftFoot && (
                        <img
                            src="/assets/img/FrontModel/LeftFoot.png"
                            alt="Left Foot"
                            style={{
                                position: "absolute",
                                top: "94%",
                                left: "27.1%",
                                transform: "translateX(-50%)",
                                width: "6.1%",
                                height: "4%"
                            }}
                        />
                    )}

                    {characterModelData.rightBackHead && (
                        <img
                            src="/assets/img/BackModel/RightBackHead.png"
                            alt="Right Back Head Foot"
                            style={{
                                position: "absolute",
                                top: "2%",
                                left: "76.5%",
                                transform: "translateX(-50%)",
                                width: "5%",
                                height: "11%"
                            }}
                        />
                    )}

                    {characterModelData.rightBackNeck && (
                        <img
                            src="/assets/img/BackModel/RightBackNeck.png"
                            alt="Right Back Neck"
                            style={{
                                position: "absolute",
                                top: "13%",
                                left: "75.7%",
                                transform: "translateX(-50%)",
                                width: "3.5%",
                                height: "3.5%"
                            }}
                        />
                    )}

                    {characterModelData.rightBackShoulder && (
                        <img
                            src="/assets/img/BackModel/RightBackShoulder.png"
                            alt="Right Back Neck"
                            style={{
                                position: "absolute",
                                top: "17.5%",
                                left: "84.2%",
                                transform: "translateX(-50%)",
                                width: "5%",
                                height: "5%"
                            }}
                        />
                    )}

                    {characterModelData.rightBackArm && (
                        <img
                            src="/assets/img/BackModel/RightBackArm.png"
                            alt="Right Back Neck"
                            style={{
                                position: "absolute",
                                top: "22.5%",
                                left: "87.2%",
                                transform: "translateX(-50%)",
                                width: "11%",
                                height: "28%"
                            }}
                        />
                    )}

                    {characterModelData.rightBackHand && (
                        <img
                            src="/assets/img/BackModel/RightBackHand.png"
                            alt="Right Back Neck"
                            style={{
                                position: "absolute",
                                top: "49.5%",
                                left: "92.2%",
                                transform: "translateX(-50%)",
                                width: "7%",
                                height: "11%"
                            }}
                        />
                    )}

                    {characterModelData.rightBackUpperBack && (
                        <img
                            src="/assets/img/BackModel/RightUpperBack.png"
                            alt="Right Back Upper Back"
                            style={{
                                position: "absolute",
                                top: "15%",
                                left: "78.1%",
                                transform: "translateX(-50%)",
                                width: "8%",
                                height: "15%"
                            }}
                        />
                    )}

                    {characterModelData.rightBackLowerBack && (
                        <img
                            src="/assets/img/BackModel/RightLowerBack.png"
                            alt="Right Back Neck"
                            style={{
                                position: "absolute",
                                top: "30%",
                                left: "78.3%",
                                transform: "translateX(-50%)",
                                width: "8.5%",
                                height: "17%"
                            }}
                        />
                    )}

                    {characterModelData.rightBackHip && (
                        <img
                            src="/assets/img/BackModel/RightBackHip.png"
                            alt="Right Back Hip"
                            style={{
                                position: "absolute",
                                top: "47%",
                                left: "78.5%",
                                transform: "translateX(-50%)",
                                width: "9.2%",
                                height: "8%"
                            }}
                        />
                    )}

                    {characterModelData.rightBackThigh && (
                        <img
                            src="/assets/img/BackModel/RightBackThigh.png"
                            alt="Right Back Thigh"
                            style={{
                                position: "absolute",
                                top: "55%",
                                left: "78.5%",
                                transform: "translateX(-50%)",
                                width: "8%",
                                height: "17%"
                            }}
                        />
                    )}

                    {characterModelData.rightCalf && (
                        <img
                            src="/assets/img/BackModel/RightBackCalf.png"
                            alt="Right Back Thigh"
                            style={{
                                position: "absolute",
                                top: "71.8%",
                                left: "78%",
                                transform: "translateX(-50%)",
                                width: "6%",
                                height: "23%"
                            }}
                        />
                    )}

                    {characterModelData.rightBackFoot && (
                        <img
                            src="/assets/img/BackModel/RightBackFoot.png"
                            alt="Right Back Thigh"
                            style={{
                                position: "absolute",
                                top: "95%",
                                left: "78%",
                                transform: "translateX(-50%)",
                                width: "6%",
                                height: "3%"
                            }}
                        />
                    )}

                    {characterModelData.leftBackHead && (
                        <img
                            src="/assets/img/BackModel/LeftBackHead.png"
                            alt="Left Back Head"
                            style={{
                                position: "absolute",
                                top: "2%",
                                left: "71.5%",
                                transform: "translateX(-50%)",
                                width: "5%",
                                height: "11%"
                            }}
                        />
                    )}


                    {characterModelData.leftBackNeck && (
                        <img
                            src="/assets/img/BackModel/LeftBackNeck.png"
                            alt="Left Back Neck"
                            style={{
                                position: "absolute",
                                top: "13%",
                                left: "72.3%",
                                transform: "translateX(-50%)",
                                width: "3.5%",
                                height: "3.5%"
                            }}
                        />
                    )}

                    {characterModelData.leftBackUpperBack && (
                        <img
                            src="/assets/img/BackModel/LeftUpperBack.png"
                            alt="Left Upper Back"
                            style={{
                                position: "absolute",
                                top: "15%",
                                left: "70.3%",
                                transform: "translateX(-50%)",
                                width: "8%",
                                height: "15%"
                            }}
                        />
                    )}

                    {characterModelData.leftBackShoulder && (
                        <img
                            src="/assets/img/BackModel/LeftBackShoulder.png"
                            alt="Left Back Neck"
                            style={{
                                position: "absolute",
                                top: "17.5%",
                                left: "64%",
                                transform: "translateX(-50%)",
                                width: "5%",
                                height: "5%"
                            }}
                        />
                    )}

                    {characterModelData.leftBackArm && (
                        <img
                            src="/assets/img/BackModel/LeftBackArm.png"
                            alt="Right Back Neck"
                            style={{
                                position: "absolute",
                                top: "22.5%",
                                left: "61.5%",
                                transform: "translateX(-50%)",
                                width: "11%",
                                height: "28%"
                            }}
                        />
                    )}

                    {characterModelData.leftBackHand && (
                        <img
                            src="/assets/img/BackModel/LeftBackHand.png"
                            alt="Right Back Neck"
                            style={{
                                position: "absolute",
                                top: "49.4%",
                                left: "56.5%",
                                transform: "translateX(-50%)",
                                width: "7%",
                                height: "12%"
                            }}
                        />
                    )}

                    {characterModelData.leftBackLowerBack && (
                        <img
                            src="/assets/img/BackModel/LeftLowerBack.png"
                            alt="Right Back Neck"
                            style={{
                                position: "absolute",
                                top: "30%",
                                left: "69.9%",
                                transform: "translateX(-50%)",
                                width: "8%",
                                height: "17%"
                            }}
                        />
                    )}

                    {characterModelData.leftBackHip && (
                        <img
                            src="/assets/img/BackModel/LeftBackHip.png"
                            alt="Left Back Hip"
                            style={{
                                position: "absolute",
                                top: "47%",
                                left: "70%",
                                transform: "translateX(-50%)",
                                width: "9.2%",
                                height: "8%"
                            }}
                        />
                    )}

                    {characterModelData.leftBackThigh && (
                        <img
                            src="/assets/img/BackModel/LeftBackThigh.png"
                            alt="Left Back Thigh"
                            style={{
                                position: "absolute",
                                top: "55%",
                                left: "70%",
                                transform: "translateX(-50%)",
                                width: "8%",
                                height: "17%"
                            }}
                        />
                    )}

                    {characterModelData.leftCalf && (
                        <img
                            src="/assets/img/BackModel/LeftBackCalf.png"
                            alt="Left Back Thigh"
                            style={{
                                position: "absolute",
                                top: "71.8%",
                                left: "71%",
                                transform: "translateX(-50%)",
                                width: "6%",
                                height: "23%"
                            }}
                        />
                    )}

                    {characterModelData.leftBackFoot && (
                        <img
                            src="/assets/img/BackModel/LeftBackFoot.png"
                            alt="Left Back Foot"
                            style={{
                                position: "absolute",
                                top: "95%",
                                left: "71%",
                                transform: "translateX(-50%)",
                                width: "6%",
                                height: "3%"
                            }}
                        />
                    )}


                </div>
            </div>



            <div class="col-md-2">
                <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2"><b>Front Model</b></label>
                <hr />

                <div class="form-check">
                    <div class="form-check">
                        <input type="checkbox" id="rightHead" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    rightHead: e.target.checked
                                }))
                            } />
                        <label for="rightHead" class="form-check-label">Right Head</label><br />

                        <input type="checkbox" id="rightNeck" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    rightNeck: e.target.checked
                                }))
                            } />
                        <label for="rightNeck" class="form-check-label">Right Neck</label><br />

                        <input type="checkbox" id="rightShoulder" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    rightShoulder: e.target.checked
                                }))
                            } />
                        <label for="rightShoulder" class="form-check-label">Right Shoulder</label><br />

                        <input type="checkbox" id="rightArm" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    rightArm: e.target.checked
                                }))
                            } />
                        <label for="rightArm" class="form-check-label">Right Arm</label><br />

                        <input type="checkbox" id="rightHand" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    rightHand: e.target.checked
                                }))
                            } />
                        <label for="rightHand" class="form-check-label">Right Hand</label><br />

                        <input type="checkbox" id="rightChest" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    rightChest: e.target.checked
                                }))
                            } />
                        <label for="rightChest" class="form-check-label">Right Chest</label><br />

                        <input type="checkbox" id="rightAbdomen" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    rightAbdomen: e.target.checked
                                }))
                            } />
                        <label for="rightAbdomen" class="form-check-label">Right Abdomen</label><br />

                        <input type="checkbox" id="rightHip" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    rightHip: e.target.checked
                                }))
                            } />
                        <label for="rightHip" class="form-check-label">Right Hip</label><br />

                        <input type="checkbox" id="rightThigh" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    rightThigh: e.target.checked
                                }))
                            } />
                        <label for="rightThigh" class="form-check-label">Right Thigh</label><br />

                        <input type="checkbox" id="rightKnee" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    rightKnee: e.target.checked
                                }))
                            } />
                        <label for="rightKnee" class="form-check-label">Right Knee</label><br />

                        <input type="checkbox" id="rightShin" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    rightShin: e.target.checked
                                }))
                            } />
                        <label for="rightShin" class="form-check-label">Right Shin</label><br />

                        <input type="checkbox" id="rightFoot" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    rightFoot: e.target.checked
                                }))
                            } />
                        <label for="rightFoot" class="form-check-label">Right Foot</label><br /><br /><br />

                        <input type="checkbox" id="leftHead" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    leftHead: e.target.checked
                                }))
                            } />
                        <label for="leftHead" class="form-check-label">Left Head</label><br />

                        <input type="checkbox" id="leftNeck" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    leftNeck: e.target.checked
                                }))
                            } />
                        <label for="leftNeck" class="form-check-label">Left Neck</label><br />

                        <input type="checkbox" id="leftShoulder" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    leftShoulder: e.target.checked
                                }))
                            } />
                        <label for="leftShoulder" class="form-check-label">Left Shoulder</label><br />

                        <input type="checkbox" id="leftArm" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    leftArm: e.target.checked
                                }))
                            } />
                        <label for="leftArm" class="form-check-label">Left Arm</label><br />

                        <input type="checkbox" id="leftHand" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    leftHand: e.target.checked
                                }))
                            } />
                        <label for="leftHand" class="form-check-label">Left Hand</label><br />

                        <input type="checkbox" id="leftChest" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    leftChest: e.target.checked
                                }))
                            } />
                        <label for="leftChest" class="form-check-label">Left Chest</label><br />

                        <input type="checkbox" id="leftAbdomen" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    leftAbdomen: e.target.checked
                                }))
                            } />
                        <label for="leftAbdomen" class="form-check-label">Left Abdomen</label><br />

                        <input type="checkbox" id="leftHip" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    leftHip: e.target.checked
                                }))
                            } />
                        <label for="leftHip" class="form-check-label">Left Hip</label><br />

                        <input type="checkbox" id="leftThigh" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    leftThigh: e.target.checked
                                }))
                            } />
                        <label for="leftThigh" class="form-check-label">Left Thigh</label><br />

                        <input type="checkbox" id="leftKnee" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    leftKnee: e.target.checked
                                }))
                            } />
                        <label for="leftKnee" class="form-check-label">Left Knee</label><br />

                        <input type="checkbox" id="leftShin" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    leftShin: e.target.checked
                                }))
                            } />
                        <label for="leftShin" class="form-check-label">Left Shin</label><br />

                        <input type="checkbox" id="leftFoot" name="charactermodel" class="form-check-input"
                            onChange={(e) =>
                                setCharacterModelData(prev => ({
                                    ...prev,
                                    leftFoot: e.target.checked
                                }))
                            } />
                        <label for="leftFoot" class="form-check-label">Left Foot</label><br /><br />
                    </div>

                </div>
            </div>


            <div class="col-md-2">
                <label style={{ color: 'black', marginBottom: '10px', marginTop: '10px' }} htmlFor="ambulanceInput2"><b>Back Model</b></label>
                <hr />

                <div class="form-check">
                    <input type="checkbox" id="rightBackHead" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                rightBackHead: e.target.checked
                            }))
                        } />
                    <label for="rightBackHead" class="form-check-label">Right Back Head</label><br />

                    <input type="checkbox" id="rightBackNeck" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                rightBackNeck: e.target.checked
                            }))
                        } />
                    <label for="rightBackNeck" class="form-check-label">Right Back Neck</label><br />

                    <input type="checkbox" id="rightBackShoulder" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                rightBackShoulder: e.target.checked
                            }))
                        } />
                    <label for="rightBackShoulder" class="form-check-label">Right Back Shoulder</label><br />

                    <input type="checkbox" id="rightBackArm" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                rightBackArm: e.target.checked
                            }))
                        } />
                    <label for="rightBackArm" class="form-check-label">Right Back Arm</label><br />

                    <input type="checkbox" id="rightBackHand" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                rightBackHand: e.target.checked
                            }))
                        } />
                    <label for="rightBackHand" class="form-check-label">Right Back Hand</label><br />

                    <input type="checkbox" id="rightBackUpperBack" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                rightBackUpperBack: e.target.checked
                            }))
                        } />
                    <label for="rightBackUpperBack" class="form-check-label">Right Upper Back</label><br />

                    <input type="checkbox" id="rightBackLowerBack" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                rightBackLowerBack: e.target.checked
                            }))
                        } />
                    <label for="rightBackLowerBack" class="form-check-label">Right Lower Back</label><br />

                    <input type="checkbox" id="rightBackHip" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                rightBackHip: e.target.checked
                            }))
                        } />
                    <label for="rightBackHip" class="form-check-label">Right Back Hip</label><br />

                    <input type="checkbox" id="rightBackThigh" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                rightBackThigh: e.target.checked
                            }))
                        } />
                    <label for="rightBackThigh" class="form-check-label">Right Back Thigh</label><br />

                    <input type="checkbox" id="rightCalf" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                rightCalf: e.target.checked
                            }))
                        } />
                    <label for="rightCalf" class="form-check-label">Right Calf</label><br />

                    <input type="checkbox" id="rightBackFoot" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                rightBackFoot: e.target.checked
                            }))
                        } />
                    <label for="rightBackFoot" class="form-check-label">Right Back Foot</label><br /><br />

                    <input type="checkbox" id="leftBackHead" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                leftBackHead: e.target.checked
                            }))
                        } />
                    <label for="leftBackHead" class="form-check-label">Left Back Head</label><br />

                    <input type="checkbox" id="leftBackNeck" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                leftBackNeck: e.target.checked
                            }))
                        } />
                    <label for="leftBackNeck" class="form-check-label">Left Back Neck</label><br />

                    <input type="checkbox" id="leftBackShoulder" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                leftBackShoulder: e.target.checked
                            }))
                        } />
                    <label for="leftBackShoulder" class="form-check-label">Left Back Shoulder</label><br />

                    <input type="checkbox" id="leftBackArm" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                leftBackArm: e.target.checked
                            }))
                        } />
                    <label for="leftBackArm" class="form-check-label">Left Back Arm</label><br />

                    <input type="checkbox" id="leftBackHand" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                leftBackHand: e.target.checked
                            }))
                        } />
                    <label for="leftBackHand" class="form-check-label">Left Back Hand</label><br />

                    <input type="checkbox" id="leftBackUpperBack" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                leftBackUpperBack: e.target.checked
                            }))
                        } />
                    <label for="leftBackUpperBack" class="form-check-label">Left Upper Back</label><br />

                    <input type="checkbox" id="leftBackLowerBack" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                leftBackLowerBack: e.target.checked
                            }))
                        } />
                    <label for="leftBackLowerBack" class="form-check-label">Left Lower Back</label><br />

                    <input type="checkbox" id="leftBackHip" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                leftBackHip: e.target.checked
                            }))
                        } />
                    <label for="leftBackHip" class="form-check-label">Left Back Hip</label><br />

                    <input type="checkbox" id="leftBackThigh" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                leftBackThigh: e.target.checked
                            }))
                        } />
                    <label for="leftBackThigh" class="form-check-label">Left Back Thigh</label><br />

                    <input type="checkbox" id="leftCalf" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                leftCalf: e.target.checked
                            }))
                        } />
                    <label for="leftCalf" class="form-check-label">Left Calf</label><br />

                    <input type="checkbox" id="leftBackFoot" name="charactermodel" class="form-check-input"
                        onChange={(e) =>
                            setCharacterModelData(prev => ({
                                ...prev,
                                leftBackFoot: e.target.checked
                            }))
                        } />
                    <label for="leftBackFoot" class="form-check-label">Left Back Foot</label><br />

                </div>

            </div>

        </>
    );
}

export default CharacterModel;
