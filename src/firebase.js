// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtYmnrv57_88QtRyY3RPoETDH_dlI3nPg",
  authDomain: "job-portfolio-9f3b2.firebaseapp.com",
  projectId: "job-portfolio-9f3b2",
  storageBucket: "job-portfolio-9f3b2.firebasestorage.app",
  messagingSenderId: "913773615644",
  appId: "1:913773615644:web:758481bb0e5e50e3149dd9",
  measurementId: "G-RFRBGVCGBW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);