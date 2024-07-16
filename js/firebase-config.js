// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";

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
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export initialized services
export { auth, db, storage, getAuth };