// js/admin-points.js

import { db, auth } from './firebase-config.js';
import { doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    const updatePointsForm = document.getElementById('update-points-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Listen for real-time updates to the points
    const pointsDoc = doc(db, 'spiritPoints', 'classes');
    onSnapshot(pointsDoc, (doc) => {
        if (doc.exists()) {
            updateChart(doc.data());
        }
    });

    // Handle form submission
    updatePointsForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const selectedClass = document.getElementById('class-select').value;
        const points = parseInt(document.getElementById('points-input').value);

        try {
            const pointsRef = doc(db, 'spiritPoints', 'classes');
            const pointsSnapshot = await getDoc(pointsRef);
            
            let currentPoints = pointsSnapshot.exists() ? pointsSnapshot.data() : {};
            currentPoints[selectedClass] = points;

            await setDoc(pointsRef, currentPoints);
            
            alert('Points updated successfully!');
            updatePointsForm.reset();
        } catch (error) {
            console.error("Error updating points: ", error);
            alert('Failed to update points. Please try again.');
        }
    });

    // Handle logout (if not already implemented)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            signOut(auth).then(() => {
                window.location.href = '/login.html';
            }).catch((error) => {
                console.error('Sign out error:', error);
            });
        });
    }
});

function updateChart(pointsData) {
    const maxPoints = Math.max(...Object.values(pointsData));
    
    for (const [className, points] of Object.entries(pointsData)) {
        const bar = document.querySelector(`.bar.${className.toLowerCase()}`);
        if (bar) {
            const percentage = (points / maxPoints) * 100;
            bar.style.height = `${percentage}%`;
            bar.setAttribute('data-points', points);
        }
    }
}

// Preserve any existing functionality from your original admin-points.js file here
// ...