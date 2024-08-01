// calendar.js

import { db } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let currentDate = new Date();
let events = [];

function initializeCalendar() {
    console.log("Initializing calendar");
    const calendarContainer = document.getElementById('calendar-container');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const closePopupBtn = document.querySelector('.close-popup');

    if (!calendarContainer) {
        console.error("Calendar container not found");
        return;
    }

    if (!prevMonthBtn || !nextMonthBtn) {
        console.error("Month navigation buttons not found");
        return;
    }

    if (!closePopupBtn) {
        console.error("Close popup button not found");
        return;
    }

    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));
    closePopupBtn.addEventListener('click', closeEventPopup);

    // Initialize the calendar with the current month
    initCalendar();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing calendar");
    initializeCalendar();
});

async function initCalendar() {
    console.log("Loading events and rendering calendar");
    await loadEvents();
    renderCalendar();
}

async function loadEvents() {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const q = query(
        collection(db, 'games'),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        where('date', '<=', endDate.toISOString().split('T')[0])
    );

    try {
        const querySnapshot = await getDocs(q);
        events = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        console.log("Events loaded:", events);
    } catch (error) {
        console.error("Error loading events:", error);
    }
}

function renderCalendar() {
    console.log("Rendering calendar");
    const calendarEl = document.getElementById('calendar');
    const currentMonthYearEl = document.getElementById('current-month-year');
    
    if (!calendarEl) {
        console.error("Calendar element not found");
        return;
    }

    if (!currentMonthYearEl) {
        console.error("Current month/year element not found");
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
            dayEl.classList.add('event');
            dayEl.addEventListener('click', () => showEventPopup(dayEvents));
        }
        
        calendarEl.appendChild(dayEl);
    }
    
    // Add empty cells for days after the last day of the month
    const cellsToAdd = 42 - (firstDay.getDay() + lastDay.getDate()); // 42 is 6 rows * 7 days
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

async function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    await loadEvents();
    renderCalendar();
}

function showEventPopup(events) {
    const popup = document.getElementById('event-popup');
    const title = document.getElementById('event-title');
    const date = document.getElementById('event-date');
    const gamesList = document.getElementById('event-games');
    
    if (!popup || !title || !date || !gamesList) {
        console.error("Event popup elements not found");
        return;
    }

    title.textContent = 'Events for this day';
    date.textContent = events[0].date;
    
    gamesList.innerHTML = '';
    events.forEach(event => {
        const gameItem = document.createElement('div');
        gameItem.classList.add('game-item');
        gameItem.innerHTML = `
            <h4>${event.name}</h4>
            <p>${event.description}</p>
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