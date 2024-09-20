// js/manage-sports.js

import { db, auth } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    const addSportGameForm = document.getElementById('add-sport-game-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Initialize date picker
    flatpickr("#game-date", {
        dateFormat: "Y-m-d",
    });

    // Initialize time picker
    flatpickr("#game-time", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
    });

    addSportGameForm.addEventListener('submit', handleAddSportGame);
    logoutBtn.addEventListener('click', handleLogout);

    loadSportGames();
});

async function handleAddSportGame(e) {
    e.preventDefault();
    const gameName = document.getElementById('game-name').value;
    const gameDate = document.getElementById('game-date').value;
    const gameTime = document.getElementById('game-time').value;
    const gameLocation = document.getElementById('game-location').value;

    try {
        await addDoc(collection(db, 'sports_games'), {
            name: gameName,
            date: new Date(`${gameDate} ${gameTime}`),
            location: gameLocation,
            createdAt: new Date()
        });

        alert('Sport game added successfully!');
        document.getElementById('add-sport-game-form').reset();
        loadSportGames();
    } catch (error) {
        console.error('Error adding sport game:', error);
        alert('Error adding sport game. Please try again.');
    }
}

async function loadSportGames() {
    const sportGamesList = document.getElementById('sport-games-list');
    
    try {
        const gamesQuery = query(collection(db, 'sports_games'), orderBy('date', 'asc'));
        const snapshot = await getDocs(gamesQuery);
        
        sportGamesList.innerHTML = '';
        
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
    } catch (error) {
        console.error('Error loading sport games:', error);
        alert('Error loading sport games. Please try again.');
    }
}

async function handleDelete(e) {
    const id = e.target.getAttribute('data-id');
    
    if (confirm('Are you sure you want to delete this sport game?')) {
        try {
            await deleteDoc(doc(db, 'sports_games', id));
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
    signOut(auth).then(() => {
        console.log('User signed out successfully');
        window.location.href = './login.html';
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}