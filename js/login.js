// login.js
import { auth, signInWithEmailAndPassword} from './firebase-config.js';

auth.signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // User is logged in
    alert("Login successful!");

    // Redirect to another page
    window.location.href = '/SpiritApp/main.html';  // Redirect to profile or dashboard
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;

    // Log the error and inform the user
    console.error("Login failed:", errorCode, errorMessage);
    
    // Show an error message
    alert("Login failed: " + errorMessage);
  });
