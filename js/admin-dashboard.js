// admin-dashboard.js (and other admin page JS files)

import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signOut(auth).then(() => {
            // Sign-out successful.
            console.log('User signed out');
            window.location.href = '/login.html'; // Redirect to login page
        }).catch((error) => {
            // An error happened.
            console.error('Sign out error:', error);
        });
    });
});