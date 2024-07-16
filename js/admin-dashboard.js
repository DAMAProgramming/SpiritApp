// js/admin-dashboard.js

import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).then(() => {
            // Sign-out successful.
            alert('You have been logged out.');
            window.location.href = './login.html';
        }).catch((error) => {
            // An error happened.
            console.error('Logout failed:', error);
        });
    });
});