// calendar.js

import { db } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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

export async function loadEvents() {
    console.log("Loading events for", currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }));
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    console.log("Query date range:", startDateString, "to", endDateString);

    const q = query(
        collection(db, 'games'),
        where('date', '>=', startDateString),
        where('date', '<=', endDateString)
    );

    try {
        const querySnapshot = await getDocs(q);
        events = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        console.log("Events loaded:", events);
        renderCalendar();
    } catch (error) {
        console.error("Error loading events:", error);
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

function handleCalendarClick(e) {
    const clickedDay = e.target.closest('.calendar-day');
    if (!clickedDay || clickedDay.classList.contains('other-month')) return;

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

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    loadEvents();
}

function showEventPopup(events) {
    console.log("Showing event popup for events:", events);
    const popup = document.getElementById('event-popup');
    const title = document.getElementById('event-title');
    const gamesList = document.getElementById('event-games');
    
    if (!popup || !title || !gamesList) {
        console.error("Event popup elements not found");
        return;
    }

    title.textContent = 'Events for this day';
    
    gamesList.innerHTML = '';
    events.forEach(event => {
        const gameItem = document.createElement('div');
        gameItem.classList.add('game-item');
        gameItem.innerHTML = `
            <h4>${event.name}</h4>
            <p>${event.description || 'No description available.'}</p>
        `;
        gamesList.appendChild(gameItem);
    });
    
    popup.style.display = 'block';
}

function closeEventPopup() {
    const popup = document.getElementById('event-popup');
    if (popup) {
        popup.style.display = 'none';
    } else {
        console.error("Event popup not found");
    }
}