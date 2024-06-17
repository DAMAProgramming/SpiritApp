import { auth } from './firebase-config.js';

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Handle successful registration
            alert('Registration successful!');
            window.location.href = '/login.html'; // Redirect to login page after registration
        })
        .catch((error) => {
            // Handle errors during registration
            alert("Error: " + error.message);
        });
});
