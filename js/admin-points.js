import { db, auth } from './firebase-config.js';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

let currentEventId = null;
let currentGameId = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    const updatePointsForm = document.getElementById('update-points-form');
    const logoutBtn = document.getElementById('logout-btn');
    const classSelect = document.getElementById('class-select');

    if (updatePointsForm) {
        updatePointsForm.addEventListener('submit', handlePointsUpdate);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (classSelect) {
        classSelect.addEventListener('change', loadCurrentGamePoints);
    }

    // Load events
    loadEvents();

    // Load and display current statistics
    loadCurrentStats();
    updateChart(); // Initial chart update
});

async function loadEvents() {
    const eventList = document.getElementById('event-list');
    
    try {
        const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(eventsQuery);
        
        eventList.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const event = doc.data();
            const li = document.createElement('li');
            li.className = 'event-item';
            li.textContent = `${event.name} (${event.date})`;
            li.addEventListener('click', () => {
                document.querySelectorAll('.event-item').forEach(item => item.classList.remove('selected'));
                li.classList.add('selected');
                loadGames(doc.id);
            });
            eventList.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading events:", error);
        alert('Failed to load events. Please try again.');
    }
}

async function loadGames(eventId) {
    currentEventId = eventId;
    const gameList = document.getElementById('game-list');
    const gameListContainer = document.querySelector('.game-list');
    
    try {
        const gamesQuery = query(collection(db, 'events', eventId, 'games'), orderBy('date', 'asc'));
        const querySnapshot = await getDocs(gamesQuery);
        
        gameList.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const game = doc.data();
            const li = document.createElement('li');
            li.className = 'game-item';
            li.textContent = `${game.name} (${game.date})`;
            li.addEventListener('click', () => {
                document.querySelectorAll('.game-item').forEach(item => item.classList.remove('selected'));
                li.classList.add('selected');
                showPointForm(doc.id);
            });
            gameList.appendChild(li);
        });

        gameListContainer.classList.remove('hidden');
        document.querySelector('.point-form').classList.add('hidden');
    } catch (error) {
        console.error("Error loading games:", error);
        alert('Failed to load games. Please try again.');
    }
}

function showPointForm(gameId) {
    currentGameId = gameId;
    document.querySelector('.point-form').classList.remove('hidden');
    loadCurrentGamePoints();
}

async function loadCurrentGamePoints() {
    if (!currentEventId || !currentGameId) return;

    const classSelect = document.getElementById('class-select');
    const pointsInput = document.getElementById('points-input');
    const selectedClass = classSelect.value;

    try {
        const gamePointsRef = doc(db, 'events', currentEventId, 'games', currentGameId, 'points', selectedClass);
        const gamePointsDoc = await getDoc(gamePointsRef);
        
        if (gamePointsDoc.exists()) {
            pointsInput.value = gamePointsDoc.data().points || 0;
        } else {
            pointsInput.value = 0;
        }
    } catch (error) {
        console.error("Error fetching game points:", error);
        alert('Failed to fetch game points. Please try again.');
    }
}

async function handlePointsUpdate(e) {
    e.preventDefault();
    console.log("Updating points");
    
    if (!currentEventId || !currentGameId) {
        alert('Please select an event and a game.');
        return;
    }

    const selectedClass = document.getElementById('class-select').value;
    const points = parseInt(document.getElementById('points-input').value);

    try {
        // Update game-specific points
        const gamePointsRef = doc(db, 'events', currentEventId, 'games', currentGameId, 'points', selectedClass);
        await setDoc(gamePointsRef, { points: points });

        // Update event total points
        const eventPointsRef = doc(db, 'events', currentEventId, 'points', selectedClass);
        const eventPointsDoc = await getDoc(eventPointsRef);
        const currentEventPoints = eventPointsDoc.exists() ? eventPointsDoc.data().points : 0;
        await setDoc(eventPointsRef, { points: currentEventPoints + points });

        // Update total points across all events
        const totalPointsRef = doc(db, 'spiritPoints', 'classes');
        const totalPointsDoc = await getDoc(totalPointsRef);
        const currentTotalPoints = totalPointsDoc.data() || {};
        const updatedTotalPoints = {
            ...currentTotalPoints,
            [selectedClass]: (currentTotalPoints[selectedClass] || 0) + points
        };
        await setDoc(totalPointsRef, updatedTotalPoints);
        
        console.log("Points updated successfully");
        alert('Points updated successfully!');
        loadCurrentStats(); // Reload stats after update
        updateChart(); // Update the chart
    } catch (error) {
        console.error("Error updating points: ", error);
        alert('Failed to update points. Please try again.');
    }
}

async function loadCurrentStats() {
    const currentStatsDiv = document.getElementById('current-stats');
    const selectedClass = document.getElementById('class-select').value;
    
    try {
        const pointsRef = doc(db, 'spiritPoints', 'classes');
        const statsRef = doc(db, 'spiritPoints', 'statistics');
        
        const [pointsDoc, statsDoc] = await Promise.all([
            getDoc(pointsRef),
            getDoc(statsRef)
        ]);

        const pointsData = pointsDoc.exists() ? pointsDoc.data() : {};
        const statsData = statsDoc.exists() ? statsDoc.data() : {};

        let statsHTML = '';
        const classesToShow = ['Freshmen', 'Sophomores', 'Juniors', 'Seniors'];

        for (const className of classesToShow) {
            const classStats = statsData[className] || {};
            statsHTML += `
                <div class="class-stats">
                    <h3>${className}</h3>
                    <p>Current Points: ${pointsData[className] || 0}</p>
                    <p>Win Streak: ${classStats.winStreak || 0}</p>
                    <p>Total Wins: ${classStats.totalWins || 0}</p>
                    <p>Last Event Won: ${classStats.lastEventWon || 'N/A'}</p>
                    <p>MVPs: ${(classStats.MVPs || []).join(', ') || 'None'}</p>
                </div>
            `;
        }

        currentStatsDiv.innerHTML = statsHTML;

        // Populate the form fields for the selected class
        const classStats = statsData[selectedClass] || {};
        document.getElementById('points-input').value = pointsData[selectedClass] || 0;
    } catch (error) {
        console.error("Error loading current stats: ", error);
        currentStatsDiv.innerHTML = '<p>Error loading statistics. Please try again later.</p>';
    }
}

async function updateChart() {
    console.log("Updating chart");
    
    try {
        const pointsRef = doc(db, 'spiritPoints', 'classes');
        const pointsDoc = await getDoc(pointsRef);
        
        if (pointsDoc.exists()) {
            const pointsData = pointsDoc.data();
            console.log("Points data:", pointsData);
            
            const maxPoints = Math.max(...Object.values(pointsData));
            
            for (const [className, points] of Object.entries(pointsData)) {
                const bar = document.querySelector(`.bar.${className.toLowerCase()}`);
                if (bar) {
                    const percentage = maxPoints > 0 ? (points / maxPoints) * 100 : 0;
                    bar.style.height = `${percentage}%`;
                    
                    // Update or create points display
                    let pointsDisplay = bar.querySelector('.points-display');
                    if (!pointsDisplay) {
                        pointsDisplay = document.createElement('div');
                        pointsDisplay.className = 'points-display';
                        bar.appendChild(pointsDisplay);
                    }
                    pointsDisplay.textContent = points;
                }
            }
        } else {
            console.log("No points data found");
        }
    } catch (error) {
        console.error("Error updating chart:", error);
    }
}

function handleLogout(e) {
    e.preventDefault();
    console.log("Logout button clicked");
    signOut(auth).then(() => {
        console.log("User signed out successfully");
        window.location.href = '/login.html';
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}