// games.js

import { db } from './firebase-config.js';
import { collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    loadGames();
    setupPopup();
});

async function loadGames() {
    const gamesGrid = document.getElementById('games-grid');
    
    try {
        console.log('Fetching games from Firestore...');
        const gamesQuery = query(collection(db, 'games'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(gamesQuery);
        
        if (snapshot.empty) {
            console.log('No games found in the database.');
            gamesGrid.innerHTML = '<p>No upcoming games at the moment.</p>';
            return;
        }

        console.log(`Found ${snapshot.size} games.`);
        gamesGrid.innerHTML = '';
        snapshot.forEach(doc => {
            const game = doc.data();
            game.id = doc.id;
            console.log('Game data:', game);
            const gameElement = createGameElement(game);
            gamesGrid.appendChild(gameElement);
        });
    } catch (error) {
        console.error('Error loading games:', error);
        gamesGrid.innerHTML = '<p>Error loading games. Please try again later.</p>';
    }
}

function createGameElement(game) {
    const gameElement = document.createElement('article');
    gameElement.className = 'game-card';

    const content = `
        <div class="game-card__content">
            <h2 class="game-card__title">${game.name}</h2>
            <p class="game-card__description">${truncateText(game.description, 100)}</p>
            ${game.videoUrl || game.youtubeVideoId ? '<p class="game-card__video-indicator">Video available</p>' : ''}
            <button class="game-card__link" data-game-id="${game.id}">View Details</button>
        </div>
    `;
    
    gameElement.innerHTML = content;

    // Add click event to show popup
    const viewDetailsButton = gameElement.querySelector('.game-card__link');
    viewDetailsButton.addEventListener('click', (e) => {
        e.preventDefault();
        showGamePopup(game);
    });

    return gameElement;
}

function setupPopup() {
    const popup = document.getElementById('game-popup');
    const closeBtn = document.querySelector('.game-popup__close');

    closeBtn.addEventListener('click', closeGamePopup);
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            closeGamePopup();
        }
    });

    // Close popup when pressing Esc key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeGamePopup();
        }
    });
}

function showGamePopup(game) {
    const popup = document.getElementById('game-popup');
    const title = document.getElementById('popup-title');
    const description = document.getElementById('popup-description');
    const videoContainer = document.getElementById('popup-video-container');

    title.textContent = game.name;
    description.textContent = game.description;
    
    // Clear previous video content
    videoContainer.innerHTML = '';

    // Add video or YouTube embed
    if (game.youtubeVideoId) {
        const youtubeEmbed = document.createElement('iframe');
        youtubeEmbed.src = `https://www.youtube.com/embed/${game.youtubeVideoId}`;
        youtubeEmbed.width = '100%';
        youtubeEmbed.height = '315';
        youtubeEmbed.frameBorder = '0';
        youtubeEmbed.allowFullscreen = true;
        videoContainer.appendChild(youtubeEmbed);
    } else if (game.videoUrl) {
        const video = document.createElement('video');
        video.src = game.videoUrl;
        video.controls = true;
        video.width = '100%';
        videoContainer.appendChild(video);
    }

    popup.classList.add('active');
}

function closeGamePopup() {
    const popup = document.getElementById('game-popup');
    popup.classList.remove('active');

    // Stop video playback when closing the popup
    const videoContainer = document.getElementById('popup-video-container');
    videoContainer.innerHTML = '';
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}