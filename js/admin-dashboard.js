// admin-dashboard.js

import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            signOut(auth).then(() => {
                console.log('User signed out');
                window.location.href = '/login.html'; // Redirect to login page
            }).catch((error) => {
                console.error('Sign out error:', error);
            });
        });
    }

    // Initialize screenshot cycling
    initScreenshotCycling();
});

function initScreenshotCycling() {
    const adminLinks = document.querySelectorAll('.admin-link');
    
    adminLinks.forEach(link => {
        const page = link.dataset.page;
        const img = link.querySelector('img');
        let currentIndex = 1;
        let screenshots = [];

        // Dynamically check for available screenshots
        for (let i = 1; ; i++) {
            const imgPath = `images/${page}-preview-${i}.jpg`;
            if (imageExists(imgPath)) {
                screenshots.push(imgPath);
            } else {
                break;
            }
        }

        if (screenshots.length > 1) {
            setInterval(() => {
                currentIndex = (currentIndex % screenshots.length) + 1;
                img.src = screenshots[currentIndex - 1];
            }, 3000); // Change screenshot every 3 seconds
        }

        // Add click event to navigate to the page
        link.addEventListener('click', () => {
            window.location.href = `./${page}.html`;
        });
    });
}

function imageExists(imageSrc) {
    var img = new Image();
    img.src = imageSrc;
    return img.height != 0;
}