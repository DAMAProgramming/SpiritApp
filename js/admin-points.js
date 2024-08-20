// manage-points.js

import { db, auth } from './firebase-config.js';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    // Initialize event listeners
    const logoutBtn = document.getElementById('logout-btn');
    const eventSelect = document.getElementById('event-select');
    const updatePointsBtn = document.getElementById('update-points-btn');

    logoutBtn.addEventListener('click', handleLogout);
    eventSelect.addEventListener('change', handleEventSelection);
    updatePointsBtn.addEventListener('click', handlePointsUpdate);

    // Load initial data
    loadEvents();
    updateChart();
});

async function loadEvents() {
    const eventSelect = document.getElementById('event-select');
    
    try {
        const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'));
        const snapshot = await getDocs(eventsQuery);
        
        eventSelect.innerHTML = '<option value="">Choose an event</option>';
        
        snapshot.forEach(doc => {
            const event = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${event.name} (${event.date})`;
            eventSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading events:', error);
        alert('Failed to load events. Please try again.');
    }
}

async function handleEventSelection() {
    const eventId = this.value;
    const gamesList = document.getElementById('games-list');
    
    if (!eventId) {
        gamesList.innerHTML = '';
        return;
    }

    try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        const event = eventDoc.data();
        
        let gamesHTML = '';
        for (const gameId of event.games) {
            const gameDoc = await getDoc(doc(db, 'games', gameId));
            const game = gameDoc.data();
            
            gamesHTML += `
                <div class="game-item" data-game-id="${gameId}">
                    <h4>${game.name}</h4>
                    <div class="class-points">
                        <label>Freshmen:</label>
                        <input type="number" class="points-input" data-class="Freshmen" min="0">
                    </div>
                    <div class="class-points">
                        <label>Sophomores:</label>
                        <input type="number" class="points-input" data-class="Sophomores" min="0">
                    </div>
                    <div class="class-points">
                        <label>Juniors:</label>
                        <input type="number" class="points-input" data-class="Juniors" min="0">
                    </div>
                    <div class="class-points">
                        <label>Seniors:</label>
                        <input type="number" class="points-input" data-class="Seniors" min="0">
                    </div>
                </div>
            `;
        }
        
        gamesList.innerHTML = gamesHTML;
        
        // Load existing points for this event
        await loadExistingPoints(eventId);
    } catch (error) {
        console.error('Error loading games:', error);
        alert('Failed to load games. Please try again.');
    }
}

async function loadExistingPoints(eventId) {
    try {
        const eventPointsRef = doc(db, 'eventPoints', eventId);
        const eventPointsDoc = await getDoc(eventPointsRef);
        const existingEventPoints = eventPointsDoc.exists() ? eventPointsDoc.data() : {};

        const gameItems = document.querySelectorAll('.game-item');
        gameItems.forEach(gameItem => {
            const gameId = gameItem.dataset.gameId;
            const inputs = gameItem.querySelectorAll('.points-input');
            inputs.forEach(input => {
                const className = input.dataset.class;
                input.value = existingEventPoints[gameId]?.[className] || 0;
            });
        });
    } catch (error) {
        console.error('Error loading existing points:', error);
    }
}

async function handlePointsUpdate() {
    const eventId = document.getElementById('event-select').value;
    if (!eventId) {
        alert('Please select an event.');
        return;
    }

    try {
        const gameItems = document.querySelectorAll('.game-item');
        let eventPoints = {};
        let pointsToAdd = {
            Freshmen: 0,
            Sophomores: 0,
            Juniors: 0,
            Seniors: 0
        };

        // Fetch existing event points
        const eventPointsRef = doc(db, 'eventPoints', eventId);
        const eventPointsDoc = await getDoc(eventPointsRef);
        const existingEventPoints = eventPointsDoc.exists() ? eventPointsDoc.data() : {};

        // Calculate points to add and update event points
        for (const gameItem of gameItems) {
            const gameId = gameItem.dataset.gameId;
            const inputs = gameItem.querySelectorAll('.points-input');
            eventPoints[gameId] = eventPoints[gameId] || {};

            for (const input of inputs) {
                const className = input.dataset.class;
                const newPoints = parseInt(input.value) || 0;
                const oldPoints = existingEventPoints[gameId]?.[className] || 0;
                const pointsDifference = newPoints - oldPoints;

                eventPoints[gameId][className] = newPoints;
                pointsToAdd[className] += pointsDifference;
            }
        }

        // Update event points
        await setDoc(eventPointsRef, eventPoints);

        // Fetch current total points
        const totalPointsRef = doc(db, 'spiritPoints', 'classes');
        const totalPointsDoc = await getDoc(totalPointsRef);
        const currentTotalPoints = totalPointsDoc.exists() ? totalPointsDoc.data() : {
            Freshmen: 0,
            Sophomores: 0,
            Juniors: 0,
            Seniors: 0
        };

        // Calculate new total points
        const newTotalPoints = {};
        for (const className in currentTotalPoints) {
            newTotalPoints[className] = currentTotalPoints[className] + pointsToAdd[className];
        }

        // Update total points
        await updateDoc(totalPointsRef, newTotalPoints);

        alert('Points updated successfully!');
        updateChart();
    } catch (error) {
        console.error('Error updating points:', error);
        alert('Failed to update points. Please try again.');
    }
}

async function updateChart() {
    try {
        const pointsRef = doc(db, 'spiritPoints', 'classes');
        const pointsDoc = await getDoc(pointsRef);
        
        if (pointsDoc.exists()) {
            const pointsData = pointsDoc.data();
            const maxPoints = Math.max(...Object.values(pointsData));
            
            for (const [className, points] of Object.entries(pointsData)) {
                const bar = document.querySelector(`.bar.${className.toLowerCase()}`);
                if (bar) {
                    const percentage = maxPoints > 0 ? (points / maxPoints) * 100 : 0;
                    bar.style.height = `${percentage}%`;
                    
                    // Add or update the points display
                    let pointsDisplay = bar.querySelector('.points-display');
                    if (!pointsDisplay) {
                        pointsDisplay = document.createElement('div');
                        pointsDisplay.className = 'points-display';
                        bar.appendChild(pointsDisplay);
                    }
                    bar.textContent = points;
                }
            }
        }
    } catch (error) {
        console.error('Error updating chart:', error);
    }
}

function handleLogout(e) {
    e.preventDefault();
    signOut(auth).then(() => {
        console.log('User signed out successfully');
        window.location.href = './login.html';
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}