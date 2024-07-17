// admin-points.js

import { db, auth } from './firebase-config.js';
import { doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    const updatePointsForm = document.getElementById('update-points-form');
    const logoutBtn = document.getElementById('logout-btn');

    if (!updatePointsForm) {
        console.error("Update points form not found!");
    }

    if (!logoutBtn) {
        console.error("Logout button not found!");
    }

    // Listen for real-time updates to the points
    console.log("Setting up real-time listener for spirit points");
    const pointsDoc = doc(db, 'spiritPoints', 'classes');
    onSnapshot(pointsDoc, (doc) => {
        console.log("Received update from Firestore");
        if (doc.exists()) {
            console.log("Document data:", doc.data());
            updateChart(doc.data());
        } else {
            console.log("No spirit points data found!");
        }
    }, (error) => {
        console.error("Error fetching spirit points:", error);
    });

    // Handle form submission
    if (updatePointsForm) {
        updatePointsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log("Form submitted");
            
            const selectedClass = document.getElementById('class-select').value;
            const points = parseInt(document.getElementById('points-input').value);

            console.log(`Updating points for ${selectedClass}: ${points}`);

            try {
                const pointsRef = doc(db, 'spiritPoints', 'classes');
                const pointsSnapshot = await getDoc(pointsRef);
                
                let currentPoints = pointsSnapshot.exists() ? pointsSnapshot.data() : {};
                console.log("Current points data:", currentPoints);

                currentPoints[selectedClass] = points;

                await setDoc(pointsRef, currentPoints);
                
                console.log("Points updated successfully");
                alert('Points updated successfully!');
                updatePointsForm.reset();
            } catch (error) {
                console.error("Error updating points: ", error);
                alert('Failed to update points. Please try again.');
            }
        });
    }

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Logout button clicked");
            signOut(auth).then(() => {
                console.log("User signed out successfully");
                window.location.href = '/login.html';
            }).catch((error) => {
                console.error('Sign out error:', error);
            });
        });
    }
});

function updateChart(pointsData) {
    console.log("Updating chart with data:", pointsData);

    const maxPoints = Math.max(...Object.values(pointsData));
    console.log("Max points:", maxPoints);

    for (const [className, points] of Object.entries(pointsData)) {
        const bar = document.querySelector(`.bar.${className.toLowerCase()}`);
        if (bar) {
            const percentage = maxPoints > 0 ? (points / maxPoints) * 100 : 0;
            console.log(`Setting height for ${className}: ${percentage}%`);

            bar.style.height = `${percentage}%`;
            
            // Update or create points display
            let pointsDisplay = bar.querySelector('.points-display');
            if (!pointsDisplay) {
                console.log(`Creating points display for ${className}`);
                pointsDisplay = document.createElement('div');
                pointsDisplay.className = 'points-display';
                bar.appendChild(pointsDisplay);
            }
            pointsDisplay.textContent = points;
        } else {
            console.error(`Bar element not found for ${className}`);
        }
    }
}