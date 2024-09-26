// js/manage-sports.js

import { db, auth } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    const addSportGameForm = document.getElementById('add-sport-game-form');
    const logoutBtn = document.getElementById('logout-btn');

    if (addSportGameForm) {
        addSportGameForm.addEventListener('submit', handleAddSportGame);
    } else {
        console.error('Add sport game form not found');
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    } else {
        console.error('Logout button not found');
    }

    // Immediately attempt to load games
    loadSportGames();

    // Also check authentication state
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User is authenticated');
            loadSportGames();
        } else {
            console.log('User is not authenticated, redirecting to login');
            window.location.href = './login.html';
        }
    });
});

async function handleAddSportGame(e) {
    e.preventDefault();
    console.log('Handling add sport game');
    const gameName = document.getElementById('game-name').value;
    const gameDate = document.getElementById('game-date').value;
    const gameTime = document.getElementById('game-time').value;
    const gameLocation = document.getElementById('game-location').value;

    try {
        const docRef = await addDoc(collection(db, 'sports_games'), {
            name: gameName,
            date: new Date(`${gameDate}T${gameTime}`),
            location: gameLocation,
            createdAt: new Date()
        });
        console.log('Sport game added with ID: ', docRef.id);
        alert('Sport game added successfully!');
        document.getElementById('add-sport-game-form').reset();
        loadSportGames();
    } catch (error) {
        console.error('Error adding sport game:', error);
        alert('Error adding sport game. Please try again.');
    }
}

async function loadSportGames() {
    console.log('Loading sport games');
    const sportGamesList = document.getElementById('sport-games-list');
    
    if (!sportGamesList) {
        console.error('Sport games list element not found');
        return;
    }
    
    try {
        const gamesQuery = query(collection(db, 'sports_games'), orderBy('date', 'asc'));
        const snapshot = await getDocs(gamesQuery);
        
        console.log('Fetched games:', snapshot.size);
        
        sportGamesList.innerHTML = '';
        
        if (snapshot.empty) {
            sportGamesList.innerHTML = '<p>No sport games found.</p>';
            return;
        }
        
        snapshot.forEach(doc => {
            const game = doc.data();
            const gameDate = game.date.toDate();
            const gameElement = document.createElement('div');
            gameElement.className = 'sport-game-item';
            gameElement.innerHTML = `
                <h3>${game.name}</h3>
                <p>Date: ${gameDate.toLocaleDateString()}</p>
                <p>Time: ${gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p>Location: ${game.location}</p>
                <button class="delete-btn" data-id="${doc.id}">Delete</button>
            `;
            sportGamesList.appendChild(gameElement);
        });

        // Add event listeners for delete buttons
        sportGamesList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
        
        console.log('Sport games loaded successfully');
    } catch (error) {
        console.error('Error loading sport games:', error);
        sportGamesList.innerHTML = '<p>Error loading sport games. Please try again.</p>';
    }
}

async function handleDelete(e) {
    const id = e.target.getAttribute('data-id');
    console.log('Attempting to delete game with ID:', id);
    
    if (confirm('Are you sure you want to delete this sport game?')) {
        try {
            await deleteDoc(doc(db, 'sports_games', id));
            console.log('Sport game deleted successfully');
            alert('Sport game deleted successfully!');
            loadSportGames();
        } catch (error) {
            console.error('Error deleting sport game:', error);
            alert('Error deleting sport game. Please try again.');
        }
    }
}

function handleLogout(e) {
    e.preventDefault();
    console.log('Logging out');
    signOut(auth).then(() => {
        console.log('User signed out successfully');
        window.location.href = './login.html';
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}