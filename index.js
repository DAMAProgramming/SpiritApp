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
    console.log("Max points:", maxPoints);

    const classMap = {
        "Freshmen": "freshman",
        "Sophomores": "sophomore",
        "Juniors": "junior",
        "Seniors": "senior"
    };

    for (const [className, points] of Object.entries(pointsData)) {
        const cssClass = classMap[className] || className.toLowerCase();

        const bar = document.querySelector(`.bar.${cssClass}`);
        if (bar) {
            const percentage = maxPoints > 0 ? (points / maxPoints) * 100 : 0;
            console.log(`Setting height for ${className} (${cssClass}): ${percentage}%`);

            bar.style.height = `${percentage}%`;
            bar.offsetHeight;  // Trigger a reflow to ensure the height is updated
            bar.setAttribute('data-points', points);

            // Ensure a single points display
            let pointsDisplay = bar.querySelector('.points-display');
            if (!pointsDisplay) {
                pointsDisplay = document.createElement('div');
                pointsDisplay.className = 'points-display';
                bar.appendChild(pointsDisplay);
            }
            pointsDisplay.textContent = points;
        } else {
            console.error(`Bar element not found for ${className} (tried class .${cssClass})`);
        }

        // Ensure a single label
        const barContainer = bar.closest('.bar-container');
        if (barContainer) {
            let label = barContainer.querySelector('.bar-label');
            if (!label) {
                label = document.createElement('div');
                label.className = 'bar-label';
                barContainer.appendChild(label);
            }
            label.textContent = className;
        } else {
            console.warn(`Bar container not found for ${className}`);
        }
    }
}
