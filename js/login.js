// login.js
import { getAuth, signInWithEmailAndPassword} from './firebase-config.js';

document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
   
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const auth = getAuth();
  
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // User is logged in
      const user = userCredential.user
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
});