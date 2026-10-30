import { initializeApp } from "firebase/app";
import { isSupported, getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
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

let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  }).catch(() => {});
}

import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export { analytics };