// js/login.js

import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
   
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // User is logged in
      const user = userCredential.user;
      localStorage.setItem('user', JSON.stringify(user));
      alert("Login successful!");

      // Redirect to admin dashboard
      window.location.href = './admin-dashboard.html';
    })
    .catch((error) => {
      console.error("Login failed:", error.code, error.message);
      alert("Login failed: " + error.message);
    });
});

// Check authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    console.log("User is signed in:", user.email);
  } else {
    // User is signed out
    console.log("User is signed out");
  }
});