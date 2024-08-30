import { db } from './firebase-config.js';
import { collection, query, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar2');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        events: fetchEvents,
        eventClick: function(info) {
            alert('Game: ' + info.event.title);
        }
    });

    calendar.render();
});

async function fetchEvents(fetchInfo, successCallback, failureCallback) {
    try {
        const gamesRef = collection(db, 'sports_games');
        const querySnapshot = await getDocs(gamesRef);
        
        const events = querySnapshot.docs.map(doc => {
            const game = doc.data();
            return {
                id: doc.id,
                title: game.name,
                start: game.date.toDate(),
                allDay: false
            };
        });

        successCallback(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        failureCallback(error);
    }
}