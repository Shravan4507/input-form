// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add your Firebase configuration here
// You can find this in your Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
    apiKey: "AIzaSyBycNoxmDsxtUyFCnvzAUoTUc302zwv3fs",
    authDomain: "input-form-f2acf.firebaseapp.com",
    projectId: "input-form-f2acf",
    storageBucket: "input-form-f2acf.firebasestorage.app",
    messagingSenderId: "238423529853",
    appId: "1:238423529853:web:fb1fd28a373d611afb5414"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
