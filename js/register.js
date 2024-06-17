import { auth, getAuth, createUserWithEmailAndPassword } from "./firebase-config.js";

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const auth = getAuth();

    if (email.trim() === '' || password.length < 6) {
        alert("Please enter a valid email and a password with at least 6 characters.");
        return;
    }
    
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
        // Signed up 
            const user = userCredential.user;
            alert('Registration successful!');
            window.location.href = '/shhs-app/login.html';
        // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert("Error: " + error.message);
        // ..
        });
});
