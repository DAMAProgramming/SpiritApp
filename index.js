// Initialize Firebase (make sure firebase-config.js is loaded before this script)
import { db } from './js/firebase-config';

// Function to update spirit points
function updateSpiritPoints() {
    db.collection("spiritPoints").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const className = doc.id.toLowerCase();
            const bar = document.querySelector(`.bar.${className}`);
            if (bar) {
                bar.style.height = `${data.points / 10}%`;
                bar.setAttribute('data-points', data.points);
            }
        });
    }).catch((error) => {
        console.error("Error getting spirit points: ", error);
    });
}

// Function to load and display news
function loadNews() {
    const newsContainer = document.getElementById('news-container');
    db.collection("news").orderBy("date", "desc").limit(5).get().then((querySnapshot) => {
        newsContainer.innerHTML = ''; // Clear existing news
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.innerHTML = `
                <h3>${data.title}</h3>
                <p>${data.content}</p>
                <small>${data.date.toDate().toLocaleDateString()}</small>
            `;
            newsContainer.appendChild(newsItem);
        });
    }).catch((error) => {
        console.error("Error getting news: ", error);
    });
}

// Function to load and display upcoming events
function loadEvents() {
    const eventsContainer = document.getElementById('events-container');
    db.collection("events").where("date", ">=", new Date()).orderBy("date").limit(3).get().then((querySnapshot) => {
        eventsContainer.innerHTML = ''; // Clear existing events
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            eventItem.innerHTML = `
                <h3>${data.title}</h3>
                <p>${data.description}</p>
                <small>${data.date.toDate().toLocaleString()}</small>
            `;
            eventsContainer.appendChild(eventItem);
        });
    }).catch((error) => {
        console.error("Error getting events: ", error);
    });
}

// Call functions when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateSpiritPoints();
    loadNews();
    loadEvents();
});

// Optionally, set up real-time listeners for updates
// db.collection("spiritPoints").onSnapshot((snapshot) => {
//     snapshot.docChanges().forEach((change) => {
//         if (change.type === "modified") {
//             updateSpiritPoints();
//         }
//     });
// });

// Similar listeners can be set up for news and events if real-time updates are desired