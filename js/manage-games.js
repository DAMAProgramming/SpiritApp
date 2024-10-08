// manage-games.js

import { db, auth, storage } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const addGameForm = document.getElementById('add-game-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Add event listeners
    addGameForm.addEventListener('submit', handleAddGame);
    logoutBtn.addEventListener('click', handleLogout);

    // Initialize Select2
    $(document).ready(function() {
        $('#event-games').select2({
            placeholder: 'Select games',
            allowClear: true
        });
    });

    // Load existing games and events
    loadGames();
});

// Function to handle adding a new game
async function handleAddGame(e) {
    e.preventDefault();
    const gameName = document.getElementById('game-name').value;
    const gameDescription = document.getElementById('game-description').value;
    const gameVideo = document.getElementById('game-video').files[0];
    const youtubeLink = document.getElementById('game-youtube-link').value;

    try {
        let videoUrl = null;
        let youtubeVideoId = null;

        // Handle video upload
        if (gameVideo) {
            videoUrl = await uploadVideo(gameVideo);
        }

        // Handle YouTube link
        if (youtubeLink) {
            youtubeVideoId = getYoutubeVideoId(youtubeLink);
        }

        await addDoc(collection(db, 'games'), {
            name: gameName,
            description: gameDescription,
            videoUrl: videoUrl,
            youtubeVideoId: youtubeVideoId,
            createdAt: new Date()
        });

        alert('Game added successfully!');
        document.getElementById('add-game-form').reset();
        loadGames();
    } catch (error) {
        console.error('Error adding game:', error);
        alert('Error adding game. Please try again.');
    }
}


// Function to upload video to Firebase Storage
async function uploadVideo(videoFile) {
    const storageRef = ref(storage, `game-videos/${Date.now()}-${videoFile.name}`);
    await uploadBytes(storageRef, videoFile);
    return await getDownloadURL(storageRef);
}

// Function to extract YouTube video ID from URL
function getYoutubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Function to load existing games
async function loadGames() {
    const gamesList = document.getElementById('games-list');
    
    try {
        const gamesQuery = query(collection(db, 'games'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(gamesQuery);
        
        gamesList.innerHTML = '';
        
        snapshot.forEach(doc => {
            const game = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `
                ${game.name} - ${truncateText(game.description, 100)}
                ${game.videoUrl ? '<span class="video-indicator">(Has Video)</span>' : ''}
                ${game.youtubeVideoId ? '<span class="youtube-indicator">(YouTube)</span>' : ''}
                <button class="delete-btn" data-id="${doc.id}" data-type="game">Delete</button>
            `;
            gamesList.appendChild(li);

            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = game.name;
        });

        // Refresh Select2 to reflect new options
        $('#event-games').trigger('change');

        // Add event listeners for delete buttons
        gamesList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    } catch (error) {
        console.error('Error loading games:', error);
        alert('Error loading games. Please try again.');
    }
}



// Function to handle delete
async function handleDelete(e) {
    const id = e.target.getAttribute('data-id');
    const type = e.target.getAttribute('data-type');
    
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
        try {
            if (type === 'game') {
                // Delete associated video if exists
                const gameDoc = await getDoc(doc(db, 'games', id));
                const gameData = gameDoc.data();
                if (gameData.videoUrl) {
                    const videoRef = ref(storage, gameData.videoUrl);
                    await deleteObject(videoRef);
                }
            }
            await deleteDoc(doc(db, `${type}s`, id));
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
            if (type === 'game') {
                loadGames();
            } else {
                loadEvents();
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
            alert(`Error deleting ${type}. Please try again.`);
        }
    }
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Function to handle logout
function handleLogout(e) {
    e.preventDefault();
    signOut(auth).then(() => {
        console.log('User signed out successfully');
        window.location.href = './login.html';
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}
