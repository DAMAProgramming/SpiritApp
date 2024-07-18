// admin-points.js

import { db, auth } from './firebase-config.js';
import { doc, setDoc, getDoc, onSnapshot, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is signed in:", user.uid);
            setupEventListeners();
            loadEvents();
            loadEventHistory();
        } else {
            console.log("No user is signed in");
            window.location.href = '/login.html';
        }
    });
});

function setupEventListeners() {
    const updatePointsForm = document.getElementById('update-points-form');
    const addEventForm = document.getElementById('add-event-form');
    const logoutBtn = document.getElementById('logout-btn');
    const eventSelect = document.getElementById('event-select');

    if (!updatePointsForm || !addEventForm || !logoutBtn || !eventSelect) {
        console.error("One or more required elements not found!");
        return;
    }

    // Listen for real-time updates to the points
    const pointsDoc = doc(db, 'spiritPoints', 'classes');
    onSnapshot(pointsDoc, (doc) => {
        if (doc.exists()) {
            console.log("Total points data:", doc.data());
            updateChart(doc.data());
        } else {
            console.log("No total spirit points data found!");
        }
    }, (error) => {
        console.error("Error fetching total spirit points:", error);
    });

    // Handle new event form submission
    addEventForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const eventName = document.getElementById('event-name').value;
        const eventDate = document.getElementById('event-date').value;

        try {
            await addDoc(collection(db, 'events'), {
                name: eventName,
                date: eventDate,
                createdAt: new Date()
            });
            console.log("Event added successfully");
            alert('Event added successfully!');
            addEventForm.reset();
            loadEvents(); // Reload events to update the dropdown
        } catch (error) {
            console.error("Error adding event: ", error);
            alert('Failed to add event. Please try again.');
        }
    });

    // Handle point update form submission
    updatePointsForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const selectedEvent = eventSelect.value;
        const selectedClass = document.getElementById('class-select').value;
        const points = parseInt(document.getElementById('points-input').value);

        if (!selectedEvent) {
            alert('Please select an event.');
            return;
        }

        console.log(`Updating points for ${selectedClass} in event ${selectedEvent}: ${points}`);

        try {
            // Update event-specific points
            const eventPointsRef = doc(db, 'eventPoints', selectedEvent);
            const eventPointsSnapshot = await getDoc(eventPointsRef);
            let eventPoints = eventPointsSnapshot.exists() ? eventPointsSnapshot.data() : {};
            eventPoints[selectedClass] = (eventPoints[selectedClass] || 0) + points;
            await setDoc(eventPointsRef, eventPoints);

            // Update total points
            const totalPointsRef = doc(db, 'spiritPoints', 'classes');
            const totalPointsSnapshot = await getDoc(totalPointsRef);
            let totalPoints = totalPointsSnapshot.exists() ? totalPointsSnapshot.data() : {};
            totalPoints[selectedClass] = (totalPoints[selectedClass] || 0) + points;
            await setDoc(totalPointsRef, totalPoints);
            
            console.log("Points updated successfully");
            alert('Points updated successfully!');
            updatePointsForm.reset();
            loadEventHistory();
        } catch (error) {
            console.error("Error updating points: ", error);
            alert('Failed to update points. Please try again.');
        }
    });

    // Handle logout
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signOut(auth).then(() => {
            console.log("User signed out successfully");
            window.location.href = './index.html';
        }).catch((error) => {
            console.error('Sign out error:', error);
        });
    });
}

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

async function loadEvents() {
    const eventSelect = document.getElementById('event-select');
    if (!eventSelect) return;

    try {
        const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'));
        const snapshot = await getDocs(eventsQuery);
        
        eventSelect.innerHTML = '<option value="">Select an event</option>';
        snapshot.forEach(doc => {
            const event = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${event.name} (${event.date})`;
            eventSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

async function loadEventHistory() {
    const eventHistory = document.getElementById('event-history');
    if (!eventHistory) return;

    try {
        const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'));
        const eventsSnapshot = await getDocs(eventsQuery);
        
        let historyHTML = '<table><tr><th>Event</th><th>Date</th><th>Freshmen</th><th>Sophomores</th><th>Juniors</th><th>Seniors</th></tr>';
        
        for (const eventDoc of eventsSnapshot.docs) {
            const event = eventDoc.data();
            const eventPointsDoc = await getDoc(doc(db, 'eventPoints', eventDoc.id));
            const eventPoints = eventPointsDoc.exists() ? eventPointsDoc.data() : {};
            
            historyHTML += `
                <tr>
                    <td>${event.name}</td>
                    <td>${event.date}</td>
                    <td>${eventPoints.Freshmen || 0}</td>
                    <td>${eventPoints.Sophomores || 0}</td>
                    <td>${eventPoints.Juniors || 0}</td>
                    <td>${eventPoints.Seniors || 0}</td>
                </tr>
            `;
        }
        
        historyHTML += '</table>';
        eventHistory.innerHTML = historyHTML;
    } catch (error) {
        console.error('Error loading event history:', error);
    }
}