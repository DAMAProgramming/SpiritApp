// register.js
import { auth } from './firebase-config.js';

auth.createUserWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Access user details
    var user = userCredential.user;

    // Optionally, you could redirect them to another page:
    window.location.href = '/dashboard.html';

    // Or display a success message:
    console.log('Registration successful! Welcome,', user.email);

    // You might want to save the user's info in Firestore:
    db.collection('users').doc(user.uid).set({
      email: user.email,
      // any other user info
    });
    
    // Send verification email
    user.sendEmailVerification().then(() => {
      console.log("Verification email sent.");
    });
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;

    // Log the error or display it to the user
    console.error("Failed to register:", errorCode, errorMessage);
    
    // Show an error message to the user
    alert("Failed to register: " + errorMessage);
  });