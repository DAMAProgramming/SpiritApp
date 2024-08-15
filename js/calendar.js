// calendar.js
import { db } from './firebase-config.js';
import { collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let currentDate = new Date();
let events = [];

export function initializeCalendar() {
    console.log("Initializing calendar");
    const calendarContainer = document.getElementById('calendar-container');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const closePopupBtn = document.querySelector('.close-popup');
    const calendarEl = document.getElementById('calendar');

    if (!calendarContainer || !prevMonthBtn || !nextMonthBtn || !closePopupBtn || !calendarEl) {
        console.error("Required calendar elements not found");
        return;
    }

    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));
    closePopupBtn.addEventListener('click', closeEventPopup);

    // Use event delegation for calendar day clicks
    calendarEl.addEventListener('click', handleCalendarClick);

    loadEvents();
}

function handleCalendarClick(e) {
    const clickedDay = e.target.closest('.calendar-day');
    if (!clickedDay || clickedDay.classList.contains('other-month') || clickedDay.classList.contains('day-name')) return;

    const clickedDate = clickedDay.getAttribute('data-date');
    console.log("Clicked on date:", clickedDate);

    if (clickedDay.classList.contains('event')) {
        const dayEvents = events.filter(event => event.date === clickedDate);
        console.log("Events for clicked date:", dayEvents);
        showEventPopup(dayEvents);
    } else {
        console.log("No events for this date");
    }
}

export async function loadEvents() {
    console.log("Loading events for", currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }));
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    console.log("Query date range:", startDateString, "to", endDateString);

    try {
        const eventsCollection = collection(db, 'events');
        console.log("Events collection reference:", eventsCollection);

        const q = query(
            eventsCollection,
            where('date', '>=', startDateString),
            where('date', '<=', endDateString)
        );
        console.log("Query:", q);

        const querySnapshot = await getDocs(q);
        console.log("Query snapshot:", querySnapshot);
        console.log("Query snapshot size:", querySnapshot.size);

        events = querySnapshot.docs.map(doc => {
            const data = doc.data();
            console.log("Document data:", data);
            return {id: doc.id, ...data};
        });

        console.log("Events loaded:", events);

        renderCalendar();
    } catch (error) {
        console.error("Error loading events:", error);
        console.error("Error details:", error.code, error.message);
    }
}

function renderCalendar() {
    console.log("Rendering calendar");
    const calendarEl = document.getElementById('calendar');
    const currentMonthYearEl = document.getElementById('current-month-year');
    
    if (!calendarEl || !currentMonthYearEl) {
        console.error("Calendar elements not found");
        return;
    }

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    currentMonthYearEl.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`;
    
    calendarEl.innerHTML = '';
    
    // Add day name headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const dayNameEl = document.createElement('div');
        dayNameEl.classList.add('calendar-day', 'day-name');
        dayNameEl.textContent = day;
        calendarEl.appendChild(dayNameEl);
    });
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        calendarEl.appendChild(createDayElement('', true));
    }
    
    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayEl = createDayElement(i);
        const currentDateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        const dayEvents = events.filter(event => event.date === currentDateString);
        
        if (dayEvents.length > 0) {
            console.log(`Events found for ${currentDateString}:`, dayEvents);
            dayEl.classList.add('event');
            dayEl.setAttribute('data-date', currentDateString);
        }
        
        calendarEl.appendChild(dayEl);
    }
    
    // Add empty cells for days after the last day of the month
    const cellsToAdd = 42 - (firstDay.getDay() + lastDay.getDate());
    for (let i = 0; i < cellsToAdd; i++) {
        calendarEl.appendChild(createDayElement('', true));
    }
}

function createDayElement(day, isOtherMonth = false) {
    const dayEl = document.createElement('div');
    dayEl.classList.add('calendar-day');
    if (isOtherMonth) {
        dayEl.classList.add('other-month');
    }
    dayEl.textContent = day;
    return dayEl;
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    loadEvents();
}

async function showEventPopup(events) {
    console.log("Showing event popup for events:", events);
    const popup = document.getElementById('event-popup');
    const popupContent = popup.querySelector('.event-popup-content');
    const title = document.getElementById('event-title');
    const gamesList = document.getElementById('event-games');
    
    if (!popup || !popupContent || !title || !gamesList) {
        console.error("Event popup elements not found");
        return;
    }

    title.textContent = 'Events for this day';
    
    gamesList.innerHTML = '';
    
    // Create a set to store unique game IDs
    const uniqueGameIds = new Set();

    // Add event names section
    const eventNamesSection = document.createElement('div');
    eventNamesSection.innerHTML = '<h3>Event Names:</h3>';
    gamesList.appendChild(eventNamesSection);

    for (const event of events) {
        const eventItem = document.createElement('div');
        eventItem.classList.add('event-item');
        eventItem.innerHTML = `<p>${event.name}</p>`;
        eventNamesSection.appendChild(eventItem);

        // Add game IDs to the set
        event.games.forEach(gameId => uniqueGameIds.add(gameId));
    }

    // Add games section
    const gamesSection = document.createElement('div');
    gamesSection.innerHTML = '<h3>Games in Events:</h3>';
    gamesList.appendChild(gamesSection);

    // Fetch and display game details
    for (const gameId of uniqueGameIds) {
        try {
            const gameDoc = await getDoc(doc(db, 'games', gameId));
            if (gameDoc.exists()) {
                const gameData = gameDoc.data();
                const gameItem = document.createElement('div');
                gameItem.classList.add('game-item');
                gameItem.innerHTML = `<p>${gameData.name}</p>`;
                gamesSection.appendChild(gameItem);
            }
        } catch (error) {
            console.error('Error fetching game details:', error);
        }
    }

    // Add "View All Games" button
    const viewAllGamesBtn = document.createElement('button');
    viewAllGamesBtn.textContent = 'View All Games';
    viewAllGamesBtn.classList.add('view-all-games-btn');
    viewAllGamesBtn.addEventListener('click', () => {
        window.location.href = './games.html';
    });
    gamesList.appendChild(viewAllGamesBtn);
    
    popup.style.display = 'flex';
    requestAnimationFrame(() => {
        popup.classList.add('active');
    });
}

function closeEventPopup() {
    const popup = document.getElementById('event-popup');
    if (popup) {
        popup.classList.remove('active');
        popup.addEventListener('transitionend', function handler(e) {
            if (e.propertyName === 'background-color') {
                popup.style.display = 'none';
                popup.removeEventListener('transitionend', handler);
            }
        });
    } else {
        console.error("Event popup not found");
    }
}

// Make sure to export any functions that need to be accessed from other files
export { handleCalendarClick, showEventPopup, closeEventPopup };