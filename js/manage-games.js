// manage-games.js

import { db, auth } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const addGameForm = document.getElementById('add-game-form');
    const gamesList = document.getElementById('games-list');
    const logoutBtn = document.getElementById('logout-btn');

    addGameForm.addEventListener('submit', handleGameSubmit);
    loadGames();

    async function handleGameSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('game-name').value;
        const date = document.getElementById('game-date').value;
        const description = document.getElementById('game-description').value;

        try {
            await addDoc(collection(db, 'games'), {
                name,
                date,
                description,
                createdAt: new Date()
            });

            alert('Game added successfully!');
            addGameForm.reset();
            loadGames();
        } catch (error) {
            console.error('Error adding game:', error);
            alert('Error adding game. Please try again.');
        }
    }

    async function loadGames() {
        try {
            const gamesQuery = query(collection(db, 'games'), orderBy('date', 'desc'));
            const snapshot = await getDocs(gamesQuery);
            gamesList.innerHTML = '';
            snapshot.forEach(doc => {
                const game = doc.data();
                const gameElement = createGameElement(game, doc.id);
                gamesList.appendChild(gameElement);
            });
        } catch (error) {
            console.error('Error loading games:', error);
            gamesList.innerHTML = '<p>Error loading games. Please try again.</p>';
        }
    }

    function createGameElement(game, id) {
        const div = document.createElement('div');
        div.className = 'game-item';
        div.innerHTML = `
            <h3>${game.name}</h3>
            <p>Date: ${game.date}</p>
            <p>${game.description}</p>
            <button class="delete-btn" data-id="${id}">Delete</button>
        `;
        div.querySelector('.delete-btn').addEventListener('click', () => deleteGame(id));
        return div;
    }

    async function deleteGame(id) {
        if (confirm('Are you sure you want to delete this game?')) {
            try {
                await deleteDoc(doc(db, 'games', id));
                alert('Game deleted successfully!');
                loadGames();
            } catch (error) {
                console.error('Error deleting game:', error);
                alert('Error deleting game. Please try again.');
            }
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            signOut(auth).then(() => {
                window.location.href = './index.html';
            }).catch((error) => {
                console.error('Sign out error:', error);
            });
        });
    }
});