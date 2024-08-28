// js/account.js

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut, updatePassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    const userEmail = document.getElementById('user-email');
    const adminStatus = document.getElementById('admin-status');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginBtn = document.getElementById('login-btn');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userEmail.textContent = user.email;
            loginBtn.textContent = 'Logout';
            loginBtn.href = '#';

            // Check admin status
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().isAdmin) {
                adminStatus.textContent = 'Yes';
            } else {
                adminStatus.textContent = 'No';
            }

            changePasswordBtn.addEventListener('click', changePassword);
            logoutBtn.addEventListener('click', logout);
        } else {
            window.location.href = './login.html';
        }
    });
});

function changePassword() {
    const newPassword = prompt("Enter new password:");
    if (newPassword) {
        updatePassword(auth.currentUser, newPassword)
            .then(() => {
                alert("Password updated successfully!");
            })
            .catch((error) => {
                console.error("Error updating password:", error);
                alert("Error updating password. Please try again.");
            });
    }
}

function logout() {
    signOut(auth)
        .then(() => {
            console.log("User signed out successfully");
            window.location.href = './index.html';
        })
        .catch((error) => {
            console.error("Error signing out:", error);
        });
}