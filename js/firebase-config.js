// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBVEy_WmlrUaxjG0SQ0GLBItxpEnS1l-3U",
    authDomain: "spirit-app-1a380.firebaseapp.com",
    projectId: "spirit-app-1a380",
    storageBucket: "spirit-app-1a380.appspot.com",
    messagingSenderId: "778717564793",
    appId: "1:778717564793:web:965fb504ba5072a62de9a8"
};

// Initialize Firebase
console.log("Initializing Firebase");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
console.log("Firebase Initialized");

export { auth, db, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, getFirestore };