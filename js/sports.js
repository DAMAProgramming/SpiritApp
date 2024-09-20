// js/sports.js

import { db } from './firebase-config.js';
import { collection, query, getDocs, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let currentDate = new Date();
let events = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
});

function initializeCalendar() {
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const closePopupBtn = document.querySelector('.close-popup');
    const calendarEl = document.getElementById('calendar');

    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));
    closePopupBtn.addEventListener('click', closeEventPopup);

    calendarEl.addEventListener('click', handleCalendarClick);

    loadEvents();
}

async function loadEvents() {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    try {
        const eventsCollection = collection(db, 'sports_games');
        const q = query(
            eventsCollection,
            where('date', '>=', startDate),
            where('date', '<=', endDate)
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
        
        const dayEvents = events.filter(event => {
            const eventDate = event.date.toDate();
            return eventDate.toDateString() === new Date(currentDateString).toDateString();
        });
        
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
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
    loadEvents();
}

function handleCalendarClick(e) {
    const clickedDay = e.target.closest('.calendar-day');
    if (!clickedDay || clickedDay.classList.contains('other-month') || clickedDay.classList.contains('day-name')) {
        return;
    }

    const clickedDate = clickedDay.getAttribute('data-date');

    if (clickedDay.classList.contains('event')) {
        const dayEvents = events.filter(event => {
            const eventDate = event.date.toDate();
            return eventDate.toDateString() === new Date(clickedDate).toDateString();
        });
        showEventPopup(dayEvents);
    }
}

function showEventPopup(events) {
    const popup = document.getElementById('event-popup');
    const title = document.getElementById('event-title');
    const gamesList = document.getElementById('event-games');
    
    title.textContent = 'Sports Events for this day';
    
    gamesList.innerHTML = '';
    
    events.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.classList.add('event-item');
        eventItem.innerHTML = `
            <h4>${event.name}</h4>
            <p>Time: ${event.date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p>Location: ${event.location}</p>
        `;
        gamesList.appendChild(eventItem);
    });
    
    popup.classList.add('active');
}

function closeEventPopup() {
    const popup = document.getElementById('event-popup');
    popup.classList.remove('active');
}