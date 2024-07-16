// js/login.js

import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.getElementById('loginForm').addEventListener('submit', async function(event) {
  event.preventDefault();
   
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    console.log("Attempting to sign in with email:", email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User signed in successfully:", user.uid);
    
    // Check if user document exists in Firestore
    console.log("Fetching user document from Firestore");
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    let isAdmin = false;
    if (userDoc.exists()) {
      console.log("User document data:", userDoc.data());
      isAdmin = userDoc.data().isAdmin === true;
      console.log("Is user admin?", isAdmin);
    } else {
      console.log("User document doesn't exist. Creating one.");
      // Create a user document if it doesn't exist
      await setDoc(userDocRef, {
        email: user.email,
        isAdmin: false
      });
    }

    localStorage.setItem('user', JSON.stringify({...user, isAdmin}));
    console.log("User data stored in localStorage");
    alert("Login successful!");

    // Redirect based on admin status
    if (isAdmin) {
      console.log("Redirecting to admin dashboard");
      window.location.href = './admin-dashboard.html';
    } else {
      console.log("Redirecting to index page");
      window.location.href = './index.html';
    }
  } catch (error) {
    console.error("Login failed:", error.code, error.message);
    alert("Login failed: " + error.message);
  }
});