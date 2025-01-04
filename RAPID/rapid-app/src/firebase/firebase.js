import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBIuklwXmME0-QWHeTIaV2dAcB0hIdF8uQ",
  authDomain: "cnshs-rapid.firebaseapp.com",
  projectId: "cnshs-rapid",
  storageBucket: "cnshs-rapid.firebasestorage.app",
  messagingSenderId: "722007541548",
  appId: "1:722007541548:web:8f49bc1e5cb74e59760e89",
  measurementId: "G-969W5MZGZ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const firestore = getFirestore(app);