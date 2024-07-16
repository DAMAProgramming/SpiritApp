// js/register.js

import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email.trim() === '' || password.length < 6) {
        alert("Please enter a valid email and a password with at least 6 characters.");
        return;
    }
    
    try {
        console.log("Attempting to create user with email:", email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User created successfully:", user.uid);
        
        // Create user document in Firestore
        console.log("Creating user document in Firestore");
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            isAdmin: false // By default, new users are not admins
        });
        console.log("User document created in Firestore");

        alert('Registration successful!');
        window.location.href = './login.html';
    } catch (error) {
        console.error("Error during registration:", error);
        alert("Error: " + error.message);
    }
});