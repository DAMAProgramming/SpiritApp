// js/dynamic-nav.js

import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    const accountDropdown = document.getElementById('account-dropdown');
    const loginBtnContainer = document.getElementById('login-btn-container');
    const logoutLink = document.getElementById('logout-link');
    const dropdownToggle = document.querySelector('.dropdown-toggle');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            accountDropdown.style.display = 'block';
            loginBtnContainer.style.display = 'none';
        } else {
            // User is signed out
            accountDropdown.style.display = 'none';
            loginBtnContainer.style.display = 'block';
        }
    });

    // Add event listener for logout
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).then(() => {
                console.log('User signed out');
                window.location.href = './index.html';
            }).catch((error) => {
                console.error('Sign out error:', error);
            });
        });
    }

    // Mobile dropdown toggle
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.innerWidth <= 960) {
                accountDropdown.classList.toggle('active');
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!accountDropdown.contains(e.target) && window.innerWidth <= 960) {
            accountDropdown.classList.remove('active');
        }
    });

    // Adjust for window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 960) {
            accountDropdown.classList.remove('active');
        }
    });
});