// index.js
import { db } from './js/firebase-config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");

    // Mobile menu toggle functionality
    const menu = document.querySelector('#mobile-menu');
    const menuLinks = document.querySelector('.navbar__menu');
    if (menu && menuLinks) {
        menu.addEventListener('click', function() {
            menu.classList.toggle('is-active');
            menuLinks.classList.toggle('active');
        });
    }

    // Real-time point updates
    console.log("Setting up real-time listener");
    const pointsDoc = doc(db, 'spiritPoints', 'classes');
    onSnapshot(pointsDoc, (doc) => {
        console.log("Snapshot received");
        if (doc.exists()) {
            console.log("Document data:", doc.data());
            updateChart(doc.data());
        } else {
            console.log("No spirit points data found!");
        }
    }, (error) => {
        console.error("Error fetching spirit points:", error);
    });
});

function updateChart(pointsData) {
    console.log("Updating chart with data:", pointsData);
    const maxPoints = Math.max(...Object.values(pointsData));
   
    for (const [className, points] of Object.entries(pointsData)) {
        const bar = document.querySelector(`.bar.${className.toLowerCase()}`);
        if (bar) {
            console.log(`Updating bar for ${className} with ${points} points`);
            const percentage = (points / maxPoints) * 100;
            bar.style.height = `${percentage}%`;
            bar.setAttribute('data-points', points);
            // Update the text display of points
            const pointsDisplay = bar.querySelector('.points-display') || bar.nextElementSibling;
            if (pointsDisplay) {
                pointsDisplay.textContent = points;
            }
        } else {
            console.log(`Bar element not found for ${className}`);
        }
    }
}