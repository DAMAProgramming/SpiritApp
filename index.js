// index.js
import { db } from './js/firebase-config.js';
import { doc, onSnapshot, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");

    // Mobile menu toggle functionality
    const menu = document.querySelector('#mobile-menu');
    const menuLinks = document.querySelector('.navbar__menu');
    if (menu && menuLinks) {
        menu.addEventListener('click', function() {
            menu.classList.toggle('is-active');
            menuLinks.classList.toggle('active');
        });
    }

    // Real-time point updates
    console.log("Setting up real-time listener");
    const pointsDoc = doc(db, 'spiritPoints', 'classes');
    onSnapshot(pointsDoc, (doc) => {
        console.log("Snapshot received");
        if (doc.exists()) {
            console.log("Document data:", doc.data());
            updateChart(doc.data());
        } else {
            console.log("No spirit points data found!");
        }
    }, (error) => {
        console.error("Error fetching spirit points:", error);
    });

    // Load news
    loadNews();
});

function updateChart(pointsData) {
    console.log("Updating chart with data:", pointsData);

    const maxPoints = Math.max(...Object.values(pointsData));
    console.log("Max points:", maxPoints);

    const classMap = {
        "Freshmen": "freshman",
        "Sophomores": "sophomore",
        "Juniors": "junior",
        "Seniors": "senior"
    };

    for (const [className, points] of Object.entries(pointsData)) {
        const cssClass = classMap[className] || className.toLowerCase();

        const bar = document.querySelector(`.bar.${cssClass}`);
        if (bar) {
            const percentage = maxPoints > 0 ? (points / maxPoints) * 100 : 0;
            console.log(`Setting height for ${className} (${cssClass}): ${percentage}%`);

            bar.style.height = `${percentage}%`;
            bar.offsetHeight;  // Trigger a reflow to ensure the height is updated
            bar.setAttribute('data-points', points);

            // Ensure a single points display
            let pointsDisplay = bar.querySelector('.points-display');
            if (!pointsDisplay) {
                pointsDisplay = document.createElement('div');
                pointsDisplay.className = 'points-display';
                bar.appendChild(pointsDisplay);
            }
            pointsDisplay.textContent = points;
        } else {
            console.error(`Bar element not found for ${className} (tried class .${cssClass})`);
        }

        // Ensure a single label
        const barContainer = bar.closest('.bar-container');
        if (barContainer) {
            let label = barContainer.querySelector('.bar-label');
            if (!label) {
                label = document.createElement('div');
                label.className = 'bar-label';
                barContainer.appendChild(label);
            }
            label.textContent = className;
        } else {
            console.warn(`Bar container not found for ${className}`);
        }
    }
}

async function loadNews() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;

    try {
        const newsQuery = query(collection(db, 'news'), orderBy('date', 'desc'), limit(5));
        const snapshot = await getDocs(newsQuery);
        
        newsContainer.innerHTML = '';
        snapshot.forEach(doc => {
            const news = doc.data();
            const newsElement = createNewsElement(news);
            newsContainer.appendChild(newsElement);
        });
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

function createNewsElement(news) {
    const div = document.createElement('div');
    div.className = 'news-item';
    div.innerHTML = `
        <h3>${news.title}</h3>
        <p>${news.content}</p>
        ${news.imageUrl ? `<img src="${news.imageUrl}" alt="${news.title}" style="max-width: 100%; height: auto;">` : ''}
        <p class="date">${news.date.toDate().toLocaleString()}</p>
    `;
    return div;
}