// login.js
import { auth } from './firebase-config.js';

auth.signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // User is logged in
    console.log("Login successful!");

    // Redirect to another page
    window.location.href = '/profile.html';  // Redirect to profile or dashboard
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;

    // Log the error and inform the user
    console.error("Login failed:", errorCode, errorMessage);
    
    // Show an error message
    alert("Login failed: " + errorMessage);
  });
