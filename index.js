// index.js
import { db } from './js/firebase-config.js';
import { doc, onSnapshot, collection, query, orderBy, limit, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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
    
    // Load news ticker
    loadNewsTicker();
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

async function loadNewsTicker() {
    const tickerContent = document.getElementById('ticker-content');
    
    try {
        // Query the spirit points
        const pointsDocRef = doc(db, 'spiritPoints', 'classes');
        const pointsSnapshot = await getDoc(pointsDocRef);

        // Query the new statistics document
        const statsDocRef = doc(db, 'spiritPoints', 'statistics');
        const statsSnapshot = await getDoc(statsDocRef);

        let tickerItems = [];

        if (pointsSnapshot.exists() && statsSnapshot.exists()) {
            const pointsData = pointsSnapshot.data();
            const statsData = statsSnapshot.data();
            const classes = Object.keys(pointsData);
            const totalPoints = Object.values(pointsData).reduce((sum, points) => sum + points, 0);
            
            for (const className of classes) {
                const points = pointsData[className];
                const stats = statsData[className];
                const announcements = getRandomAnnouncements(className, points, classes, totalPoints, pointsData, stats);
                tickerItems.push(...announcements);
            }
        }

        // Shuffle the ticker items for variety
        tickerItems = shuffleArray(tickerItems);

        // Populate the ticker
        tickerContent.innerHTML = tickerItems.map(item => `<li>${item}</li>`).join('');

        // Clone all items and append them to create a seamless loop
        tickerContent.innerHTML += tickerContent.innerHTML;

        // Start the seamless scrolling
        startSeamlessScrolling();

    } catch (error) {
        console.error('Error loading news ticker:', error);
    }
}

function getRandomAnnouncements(className, points, allClasses, totalPoints, pointsData, stats) {
    const announcements = [
        `${className} are holding strong with ${points} spirit points!`,
        `Go ${className}! They've earned ${points} spirit points so far!`,
        `${className} are showing their spirit with ${points} points!`,
        `${points} spirit points and counting for the ${className}!`,
        `The ${className} are on fire with ${points} spirit points!`
    ];

    // Add some comparative announcements
    const percentageOfTotal = ((points / totalPoints) * 100).toFixed(1);
    announcements.push(`${className} have contributed ${percentageOfTotal}% of all spirit points!`);

    const sortedClasses = allClasses.sort((a, b) => pointsData[b] - pointsData[a]);
    const rank = sortedClasses.indexOf(className) + 1;
    if (rank === 1) {
        announcements.push(`${className} are in the lead with ${points} spirit points!`);
    } else {
        announcements.push(`${className} are in ${rank}${getOrdinalSuffix(rank)} place with ${points} points!`);
    }

    // Add new announcements based on stats
    if (stats) {
        if (stats.winStreak > 0) {
            announcements.push(`${className} are on a ${stats.winStreak} event win streak!`);
        }
        announcements.push(`${className} have won ${stats.totalWins} events in total!`);
        announcements.push(`${className} last won the "${stats.lastEventWon}" event!`);
        if (stats.MVPs && stats.MVPs.length > 0) {
            const mvp = stats.MVPs[Math.floor(Math.random() * stats.MVPs.length)];
            announcements.push(`${mvp} has been a standout performer for the ${className}!`);
        }
    }

    // Select a random subset of announcements to return
    return shuffleArray(announcements).slice(0, 3);
}

function getOrdinalSuffix(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return "st";
    }
    if (j == 2 && k != 12) {
        return "nd";
    }
    if (j == 3 && k != 13) {
        return "rd";
    }
    return "th";
}

function startSeamlessScrolling() {
    const ticker = document.querySelector('.news-ticker');
    const tickerContent = document.getElementById('ticker-content');
    let scrollAmount = 0;
    const speed = 0.4;

    function scroll() {
        scrollAmount += speed;
        tickerContent.style.transform = `translateX(-${scrollAmount}px)`;

        // Reset when all items have scrolled
        if (scrollAmount >= tickerContent.scrollWidth / 2) {
            scrollAmount = 0;
        }

        requestAnimationFrame(scroll);
    }

    scroll();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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