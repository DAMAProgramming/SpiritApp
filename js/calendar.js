// calendar.js
import { db } from './firebase-config.js';
import { collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let currentDate = new Date();
let events = [];

export function initializeCalendar() {
    console.trace("Initializing Calendar"); // This will log the call stack to help trace where it's called from

    if (calendarInitialized) {
        console.log("Calendar is already initialized. Skipping...");
        return; // Prevent multiple initializations
    }

    console.log("Calendar initialized for the first time.");
    var calendarInitialized = true; // Set the flag to true after the first initialization

    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const closePopupBtn = document.querySelector('.close-popup');
    const calendarEl = document.getElementById('calendar');

    if (!prevMonthBtn || !nextMonthBtn || !closePopupBtn || !calendarEl) {
        console.error("Required calendar elements not found");
        return;
    }

    // Remove existing event listeners to prevent duplication
    prevMonthBtn.removeEventListener('click', handlePrevMonth);
    nextMonthBtn.removeEventListener('click', handleNextMonth);

    // Attach event listeners with separate functions
    prevMonthBtn.addEventListener('click', handlePrevMonth);
    nextMonthBtn.addEventListener('click', handleNextMonth);
    closePopupBtn.addEventListener('click', closeEventPopup);

    calendarEl.addEventListener('click', handleCalendarClick);

    loadEvents();
}



function handleNextMonth() {
    console.trace('Next month button clicked'); // Debugging log
    changeMonth(1);  // Should correctly go to the next month
}

function handlePrevMonth() {
    console.trace('Previous month button clicked'); // Debugging log
    changeMonth(-1);  // Should correctly go to the previous month
}

function handleCalendarClick(e) {
    const clickedDay = e.target.closest('.calendar-day');
    if (!clickedDay || clickedDay.classList.contains('other-month') || clickedDay.classList.contains('day-name')) {
        console.error("Clicked day element not found");
        return;
    }

    const clickedDate = clickedDay.getAttribute('data-date');

    if (clickedDay.classList.contains('event')) {
        const dayEvents = events.filter(event => event.date === clickedDate);
        showEventPopup(dayEvents);
    }
}

export async function loadEvents() {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    try {
        const eventsCollection = collection(db, 'events');
        const q = query(
            eventsCollection,
            where('date', '>=', startDateString),
            where('date', '<=', endDateString)
        );

        const querySnapshot = await getDocs(q);
        events = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

        renderCalendar();
    } catch (error) {
        console.error("Error loading events:", error);
    }
}

function renderCalendar() {
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
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const dayNameEl = document.createElement('div');
        dayNameEl.classList.add('calendar-day', 'day-name');
        dayNameEl.textContent = day;
        calendarEl.appendChild(dayNameEl);
    });
    
    for (let i = 0; i < firstDay.getDay(); i++) {
        calendarEl.appendChild(createDayElement('', true));
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayEl = createDayElement(i);
        const currentDateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        const dayEvents = events.filter(event => event.date === currentDateString);
        
        if (dayEvents.length > 0) {
            dayEl.classList.add('event');
            dayEl.setAttribute('data-date', currentDateString);
        }
        
        calendarEl.appendChild(dayEl);
    }
    
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
    console.log(`Current month before change: ${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`);
    
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
    
    console.log(`Current month after change: ${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`);
    
    loadEvents();
}


async function showEventPopup(events) {
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
    
    const uniqueGameIds = new Set();

    const eventNamesSection = document.createElement('div');
    eventNamesSection.innerHTML = '<h3>Event Names:</h3>';
    gamesList.appendChild(eventNamesSection);

    for (const event of events) {
        const eventItem = document.createElement('div');
        eventItem.classList.add('event-item');
        eventItem.innerHTML = `<p>${event.name}</p>`;
        eventNamesSection.appendChild(eventItem);

        event.games.forEach(gameId => uniqueGameIds.add(gameId));
    }

    const gamesSection = document.createElement('div');
    gamesSection.innerHTML = '<h3>Games in Events:</h3>';
    gamesList.appendChild(gamesSection);

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

export { handleCalendarClick, showEventPopup, closeEventPopup };