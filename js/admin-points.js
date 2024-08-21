import { db, auth } from './firebase-config.js';
import { collection, getDocs, query, orderBy, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

let eventsData = [];
let lineChart;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    checkBarGraphStructure();
    loadEvents();
    setupEventListeners();
    updateChart();
    initResizer();
});

function checkBarGraphStructure() {
    console.log('Checking bar graph structure');
    const chartContainer = document.querySelector('.chart-container');
    if (!chartContainer) {
        console.error('Chart container not found');
        return;
    }

    const chart = chartContainer.querySelector('.chart');
    if (!chart) {
        console.error('Chart element not found');
        return;
    }

    const barContainers = chart.querySelectorAll('.bar-container');
    console.log(`Found ${barContainers.length} bar containers`);

    barContainers.forEach((container, index) => {
        const barWrapper = container.querySelector('.bar-wrapper');
        const bar = container.querySelector('.bar');
        const barLabel = container.querySelector('.bar-label');

        console.log(`Bar ${index + 1}:`);
        console.log(`  Bar wrapper: ${barWrapper ? 'Found' : 'Not found'}`);
        console.log(`  Bar: ${bar ? 'Found' : 'Not found'}`);
        console.log(`  Bar label: ${barLabel ? 'Found' : 'Not found'}`);

        if (bar) {
            console.log(`  Bar class: ${bar.className}`);
            console.log(`  Bar current height: ${bar.style.height}`);
        }
    });
}

function setupEventListeners() {
    console.log('Setting up event listeners');
    const eventSelect = document.getElementById('event-select');
    const updatePointsBtn = document.getElementById('update-points-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (eventSelect) {
        eventSelect.addEventListener('change', handleEventSelection);
    } else {
        console.error('Event select element not found');
    }

    if (updatePointsBtn) {
        updatePointsBtn.addEventListener('click', handlePointsUpdate);
    } else {
        console.error('Update points button not found');
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    } else {
        console.error('Logout button not found');
    }
}

async function loadEvents() {
    console.log('Loading events');
    const eventSelect = document.getElementById('event-select');
    
    try {
        const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'));
        const snapshot = await getDocs(eventsQuery);
        
        console.log(`Found ${snapshot.size} events`);
        
        eventSelect.innerHTML = '<option value="">Choose an event</option>';
        
        eventsData = [];
        snapshot.forEach(doc => {
            const event = doc.data();
            eventsData.push({ id: doc.id, ...event });
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${event.name} (${event.date})`;
            eventSelect.appendChild(option);
        });

        console.log('Events loaded successfully');
        updateLineGraph();
    } catch (error) {
        console.error('Error loading events:', error);
        alert('Failed to load events. Please try again.');
    }
}

async function handleEventSelection() {
    console.log('Event selected:', this.value);
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
    console.log('Loading existing points for event:', eventId);
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
    console.log('Updating points');
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

        console.log('Points updated successfully');
        alert('Points updated successfully!');
        updateChart();
        updateLineGraph();
    } catch (error) {
        console.error('Error updating points:', error);
        alert('Failed to update points. Please try again.');
    }
}

async function updateChart() {
    console.log('Updating chart');
    try {
        const pointsRef = doc(db, 'spiritPoints', 'classes');
        const pointsDoc = await getDoc(pointsRef);
        
        if (pointsDoc.exists()) {
            const pointsData = pointsDoc.data();
            console.log('Points data:', pointsData);
            const maxPoints = Math.max(...Object.values(pointsData));
            console.log('Max points:', maxPoints);
            
            for (const [className, points] of Object.entries(pointsData)) {
                const bar = document.querySelector(`.bar.${className.toLowerCase()}`);
                console.log(`Updating bar for ${className}`);
                if (bar) {
                    const percentage = maxPoints > 0 ? (points / maxPoints) * 100 : 0;
                    console.log(`${className} percentage: ${percentage}%`);
                    bar.style.height = `${percentage}%`;
                    
                    // Add or update the points display
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
        } else {
            console.error('No spirit points document found');
        }
    } catch (error) {
        console.error('Error updating chart:', error);
    }
}

async function updateLineGraph() {
    console.log('Updating line graph');
    try {
        const { labels, datasets } = await getChartData();
        const ctx = document.getElementById('event-history').getContext('2d');
        
        if (lineChart) {
            lineChart.destroy();
        }

        lineChart = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Cumulative Points' }
                    },
                    x: {
                        title: { display: true, text: 'Events' }
                    }
                },
                plugins: {
                    title: { display: true, text: 'Cumulative Points Over Time' },
                    tooltip: { mode: 'index', intersect: false },
                    legend: { position: 'bottom' }
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false }
            }
        });
    } catch (error) {
        console.error('Error updating line graph:', error);
    }
}

async function getChartData() {
    console.log('Getting chart data');
    const classes = ['Freshmen', 'Sophomores', 'Juniors', 'Seniors'];
    const datasets = classes.map(className => ({
        label: className,
        data: [],
        fill: false,
        borderColor: getClassColor(className),
        tension: 0.1
    }));

    let cumulativePoints = { Freshmen: 0, Sophomores: 0, Juniors: 0, Seniors: 0 };
    const labels = [];

    for (const event of eventsData) {
        const eventPointsDoc = await getDoc(doc(db, 'eventPoints', event.id));
        const eventPoints = eventPointsDoc.exists() ? eventPointsDoc.data() : {};
        
        for (const className in cumulativePoints) {
            let eventTotalPoints = 0;
            for (const gameId in eventPoints) {
                eventTotalPoints += eventPoints[gameId][className] || 0;
            }
            cumulativePoints[className] += eventTotalPoints;
        }

        labels.push(event.name);
        classes.forEach((className, index) => {
            datasets[index].data.push(cumulativePoints[className]);
        });
    }

    return { labels, datasets };
}

function getClassColor(className) {
    switch(className) {
        case 'Freshmen': return '#f0f0f0';
        case 'Sophomores': return '#333333';
        case 'Juniors': return '#ffe81c';
        case 'Seniors': return '#4dc905';
        default: return '#000000';
    }
}

function initResizer() {
    console.log('Initializing resizer');
    const container = document.querySelector('.manage-points-container');
    const chartSection = document.querySelector('.chart-section');
    const pointsSection = document.querySelector('.points-management-section');
    const resizer = document.querySelector('.resizer');
    
    if (!container || !chartSection || !pointsSection || !resizer) {
        console.error('One or more required elements for resizer not found');
        return;
    }

    let isResizing = false;

    resizer.addEventListener('mousedown', initResize, false);

    function initResize(e) {
        console.log('Resize initiated');
        isResizing = true;
        document.addEventListener('mousemove', resize, false);
        document.addEventListener('mouseup', stopResize, false);
        resizer.classList.add('active');
    }

    function resize(e) {
        if (!isResizing) return;

        const containerRect = container.getBoundingClientRect();
        if (window.innerWidth > 960) {
            // Horizontal resizing for larger screens
            const newX = e.clientX - containerRect.left;
            const containerWidth = containerRect.width;

            // Ensure the chart section doesn't get smaller than 30% of the container width
            const minChartWidth = containerWidth * 0.3;
            // Ensure the points section doesn't get smaller than 200px
            const minPointsWidth = 200;

            if (newX > minChartWidth && newX < (containerWidth - minPointsWidth)) {
                chartSection.style.flex = `0 0 ${newX}px`;
                pointsSection.style.width = `${containerWidth - newX}px`;
            }
        } else {
            // Vertical resizing for smaller screens
            const newY = e.clientY - containerRect.top;
            const containerHeight = containerRect.height;

            // Ensure both sections have at least 20% of the container height
            const minHeight = containerHeight * 0.2;

            if (newY > minHeight && newY < (containerHeight - minHeight)) {
                chartSection.style.height = `${newY}px`;
                pointsSection.style.height = `${containerHeight - newY}px`;
            }
        }
    }

    function stopResize() {
        console.log('Resize stopped');
        isResizing = false;
        document.removeEventListener('mousemove', resize, false);
        document.removeEventListener('mouseup', stopResize, false);
        resizer.classList.remove('active');
    }
}

function handleLogout(e) {
    e.preventDefault();
    console.log('Logout initiated');
    signOut(auth).then(() => {
        console.log('User signed out successfully');
        window.location.href = './login.html';
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}

// Export functions that need to be accessed from other files
export { 
    loadEvents, 
    handleEventSelection, 
    handlePointsUpdate, 
    updateChart, 
    updateLineGraph
};