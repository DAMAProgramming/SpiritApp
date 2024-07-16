// Initialize Firebase (make sure firebase-config.js is loaded before this script)
import { db } from './firebase-config.js';

// Function to update spirit points in the chart
function updateSpiritPointsChart() {
    db.collection("spiritPoints").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const className = doc.id.toLowerCase();
            const bar = document.querySelector(`.bar.${className}`);
            if (bar) {
                bar.style.height = `${data.points / 10}%`;
                bar.setAttribute('data-points', data.points);
            }
        });
    }).catch((error) => {
        console.error("Error getting spirit points: ", error);
    });
}

// Function to update points in Firestore
function updatePoints(className, points) {
    return db.collection("spiritPoints").doc(className).set({
        points: points
    }, { merge: true });
}

// Event listener for form submission
document.getElementById('update-points-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const className = document.getElementById('class-select').value;
    const points = parseInt(document.getElementById('points-input').value);

    updatePoints(className, points)
        .then(() => {
            console.log("Points updated successfully");
            updateSpiritPointsChart();
            alert("Points updated successfully!");
        })
        .catch((error) => {
            console.error("Error updating points: ", error);
            alert("Error updating points. Please try again.");
        });
});

// Load current points when the page loads
document.addEventListener('DOMContentLoaded', updateSpiritPointsChart);