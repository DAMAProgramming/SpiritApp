import { db } from './firebase-config.js';

// admin-dashboard.js (and other admin page JS files)

import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signOut(auth).then(() => {
            // Sign-out successful.
            console.log('User signed out');
            window.location.href = '/login.html'; // Redirect to login page
        }).catch((error) => {
            // An error happened.
            console.error('Sign out error:', error);
        });
    });
});

const storage = firebase.storage();

document.addEventListener('DOMContentLoaded', () => {
    const newsForm = document.getElementById('news-form');
    const newsList = document.getElementById('news-list');

    newsForm.addEventListener('submit', handleNewsSubmit);
    loadNews();

    async function handleNewsSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('news-title').value;
        const content = document.getElementById('news-content').value;
        const imageFile = document.getElementById('news-image').files[0];

        try {
            let imageUrl = null;
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            await db.collection('news').add({
                title,
                content,
                imageUrl,
                date: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert('News posted successfully!');
            newsForm.reset();
            loadNews();
        } catch (error) {
            console.error('Error posting news:', error);
            alert('Error posting news. Please try again.');
        }
    }

    async function uploadImage(file) {
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`news-images/${Date.now()}-${file.name}`);
        await fileRef.put(file);
        return await fileRef.getDownloadURL();
    }

    async function loadNews() {
        try {
            const snapshot = await db.collection('news').orderBy('date', 'desc').limit(10).get();
            newsList.innerHTML = '';
            snapshot.forEach(doc => {
                const news = doc.data();
                const newsElement = createNewsElement(news, doc.id);
                newsList.appendChild(newsElement);
            });
        } catch (error) {
            console.error('Error loading news:', error);
        }
    }

    function createNewsElement(news, id) {
        const div = document.createElement('div');
        div.className = 'news-item';
        div.innerHTML = `
            <h3>${news.title}</h3>
            <p>${news.content}</p>
            ${news.imageUrl ? `<img src="${news.imageUrl}" alt="${news.title}">` : ''}
            <p class="date">${news.date ? news.date.toDate().toLocaleString() : 'Date unknown'}</p>
            <button class="delete-btn" data-id="${id}">Delete</button>
        `;
        div.querySelector('.delete-btn').addEventListener('click', () => deleteNews(id));
        return div;
    }

    async function deleteNews(id) {
        if (confirm('Are you sure you want to delete this news item?')) {
            try {
                await db.collection('news').doc(id).delete();
                alert('News deleted successfully!');
                loadNews();
            } catch (error) {
                console.error('Error deleting news:', error);
                alert('Error deleting news. Please try again.');
            }
        }
    }
});

