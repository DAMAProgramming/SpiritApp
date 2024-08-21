// Import necessary Firebase modules
import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let eventsData = [];
let lineChart;

document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    
    const eventSelect = document.getElementById('event-select');
    if (eventSelect) {
        eventSelect.addEventListener('change', function() {
            updateCharts(this.value);
        });
    } else {
        console.error("Element with id 'event-select' not found");
    }
});

async function loadEvents() {
    const eventSelect = document.getElementById('event-select');
    if (!eventSelect) {
        console.error("Element with id 'event-select' not found");
        return;
    }
    
    try {
        const eventsQuery = query(collection(db, 'events'), orderBy('date', 'asc'));
        const snapshot = await getDocs(eventsQuery);
        
        eventsData = [];
        snapshot.forEach(doc => {
            const event = doc.data();
            eventsData.push({ id: doc.id, ...event });
        });

        eventSelect.innerHTML = '<option value="all">All Events</option>';
        eventsData.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.name} (${event.date})`;
            eventSelect.appendChild(option);
        });

        updateCharts('all');
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

async function updateCharts(selectedEventId) {
    try {
        const { labels, datasets } = await getChartData(selectedEventId);
        updateBarChart(datasets);
        updateLineGraph(labels, datasets);
        updateEventDetails(selectedEventId, Object.fromEntries(datasets.map((ds, i) => [ds.label, ds.data[ds.data.length - 1]])));
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

async function getChartData(selectedEventId) {
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

        if (event.id === selectedEventId) break;
    }

    return { labels, datasets };
}

function updateBarChart(datasets) {
    const chartContainer = document.querySelector('.chart-container .chart');
    if (!chartContainer) {
        console.error("Chart container not found");
        return;
    }

    chartContainer.innerHTML = ''; // Clear existing content

    const maxPoints = Math.max(...datasets.map(ds => ds.data[ds.data.length - 1]));

    datasets.forEach((dataset, index) => {
        const points = dataset.data[dataset.data.length - 1];
        const percentage = maxPoints > 0 ? (points / maxPoints) * 100 : 0;

        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';

        const barWrapper = document.createElement('div');
        barWrapper.className = 'bar-wrapper';

        const bar = document.createElement('div');
        bar.className = `bar ${dataset.label.toLowerCase()}`;
        bar.style.height = `${percentage}%`;

        const pointsDisplay = document.createElement('div');
        pointsDisplay.className = 'points-display';
        pointsDisplay.textContent = points;

        bar.appendChild(pointsDisplay);
        barWrapper.appendChild(bar);
        barContainer.appendChild(barWrapper);

        const barLabel = document.createElement('div');
        barLabel.className = 'bar-label';
        barLabel.textContent = dataset.label;
        barContainer.appendChild(barLabel);

        chartContainer.appendChild(barContainer);
    });
}

function updateLineGraph(labels, datasets) {
    const canvas = document.getElementById('event-history');
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        console.error("Canvas element 'event-history' not found or is not a canvas");
        return;
    }

    const ctx = canvas.getContext('2d');
    
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