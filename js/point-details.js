// point-details.js

import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let eventsData = [];

document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    loadEventHistory();

    const eventSelect = document.getElementById('event-select');
    eventSelect.addEventListener('change', function() {
        updateChart(this.value);
    });
});

async function loadEvents() {
    const eventSelect = document.getElementById('event-select');
    
    try {
        // Query events ordered by date in descending order
        const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'));
        const snapshot = await getDocs(eventsQuery);
        
        eventsData = [];
        snapshot.forEach(doc => {
            const event = doc.data();
            eventsData.push({ id: doc.id, ...event });
        });

        // Reverse eventsData array to have oldest first for cumulative calculations
        eventsData.reverse();

        // Clear existing options
        eventSelect.innerHTML = '<option value="all">All Events</option>';

        // Add event options in reverse order (latest first)
        for (let i = eventsData.length - 1; i >= 0; i--) {
            const event = eventsData[i];
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.name} (${event.date})`;
            eventSelect.appendChild(option);
        }

        // Initial chart load with all events
        updateChart('all');
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

async function updateChart(selectedEventId) {
    const chartContainer = document.querySelector('.chart-container');
    chartContainer.innerHTML = ''; // Clear previous chart

    const classes = ['Freshmen', 'Sophomores', 'Juniors', 'Seniors'];
    let cumulativePoints = {
        Freshmen: 0,
        Sophomores: 0,
        Juniors: 0,
        Seniors: 0
    };

    try {
        for (const event of eventsData) {
            const eventPointsDoc = await getDoc(doc(db, 'eventPoints', event.id));
            const eventPoints = eventPointsDoc.exists() ? eventPointsDoc.data() : {};
            
            classes.forEach(className => {
                cumulativePoints[className] += eventPoints[className] || 0;
            });

            if (event.id === selectedEventId) break;
        }

        if (selectedEventId === 'all') {
            // We've already calculated all points, so we can proceed
        } else if (!eventsData.some(event => event.id === selectedEventId)) {
            throw new Error('Selected event not found');
        }

        const maxPoints = Math.max(...Object.values(cumulativePoints));

        const chart = document.createElement('div');
        chart.className = 'chart';
        
        classes.forEach(className => {
            const points = cumulativePoints[className];
            const percentage = maxPoints > 0 ? (points / maxPoints) * 100 : 0;

            const barContainer = document.createElement('div');
            barContainer.className = 'bar-container';

            const barWrapper = document.createElement('div');
            barWrapper.className = 'bar-wrapper';

            const bar = document.createElement('div');
            bar.className = `bar ${className.toLowerCase()}`;
            bar.style.height = `${percentage}%`;

            const pointsDisplay = document.createElement('div');
            pointsDisplay.className = 'points-display';
            pointsDisplay.textContent = points;

            bar.appendChild(pointsDisplay);
            barWrapper.appendChild(bar);
            barContainer.appendChild(barWrapper);

            const barLabel = document.createElement('div');
            barLabel.className = 'bar-label';
            barLabel.textContent = className;
            barContainer.appendChild(barLabel);

            chart.appendChild(barContainer);
        });

        chartContainer.appendChild(chart);
        updateEventDetails(selectedEventId, cumulativePoints);
    } catch (error) {
        console.error('Error updating chart:', error);
        chartContainer.innerHTML = '<p>Error updating chart. Please try again.</p>';
    }
}

function updateEventDetails(selectedEventId, pointsData) {
    const eventDetails = document.getElementById('event-details');
    
    if (selectedEventId === 'all') {
        eventDetails.innerHTML = '<p>Showing total points from all events.</p>';
    } else {
        const selectedEvent = eventsData.find(event => event.id === selectedEventId);
        let detailsHTML = `<h4>Cumulative Points up to "${selectedEvent.name}" (${selectedEvent.date}):</h4>`;
        detailsHTML += '<ul>';
        for (const className in pointsData) {
            detailsHTML += `<li>${className}: ${pointsData[className]}</li>`;
        }
        detailsHTML += '</ul>';

        eventDetails.innerHTML = detailsHTML;
    }
}

async function loadEventHistory() {
    const eventHistory = document.getElementById('event-history');
    
    try {
        let historyHTML = '<table><tr><th>Event</th><th>Date</th><th>Freshmen</th><th>Sophomores</th><th>Juniors</th><th>Seniors</th></tr>';
        
        let cumulativePoints = {
            Freshmen: 0,
            Sophomores: 0,
            Juniors: 0,
            Seniors: 0
        };

        for (const event of eventsData) {
            const eventPointsDoc = await getDoc(doc(db, 'eventPoints', event.id));
            const eventPoints = eventPointsDoc.exists() ? eventPointsDoc.data() : {};
            
            for (const className in cumulativePoints) {
                cumulativePoints[className] += eventPoints[className] || 0;
            }

            historyHTML += `
                <tr>
                    <td>${event.name}</td>
                    <td>${event.date}</td>
                    <td>${cumulativePoints.Freshmen}</td>
                    <td>${cumulativePoints.Sophomores}</td>
                    <td>${cumulativePoints.Juniors}</td>
                    <td>${cumulativePoints.Seniors}</td>
                </tr>
            `;
        }
        
        historyHTML += '</table>';
        eventHistory.innerHTML = historyHTML;
    } catch (error) {
        console.error('Error loading event history:', error);
        eventHistory.innerHTML = '<p>Error loading event history.</p>';
    }
}