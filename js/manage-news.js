import { db, storage, auth } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const newsForm = document.getElementById('news-form');
    const newsList = document.getElementById('news-list');
    const logoutBtn = document.getElementById('logout-btn');

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
                const imageRef = ref(storage, `news-images/${Date.now()}-${imageFile.name}`);
                await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(imageRef);
            }

            await addDoc(collection(db, 'news'), {
                title,
                content,
                imageUrl,
                date: new Date()
            });

            alert('News posted successfully!');
            newsForm.reset();
            loadNews();
        } catch (error) {
            console.error('Error posting news:', error);
            alert('Error posting news. Please try again.');
        }
    }

    async function loadNews() {
        try {
            console.log("Starting to load news");
            const newsQuery = query(collection(db, 'news'), orderBy('date', 'desc'));
            console.log("Query created");
            const snapshot = await getDocs(newsQuery);
            console.log("Snapshot received", snapshot);
            newsList.innerHTML = '';
            snapshot.forEach(doc => {
                console.log("Processing doc:", doc.id);
                const news = doc.data();
                const newsElement = createNewsElement(news, doc.id);
                newsList.appendChild(newsElement);
            });
        } catch (error) {
            console.error('Error loading news:', error);
            console.error('Error details:', error.code, error.message);
            alert('Error loading news. Please check the console for details.');
        }
    }

    function createNewsElement(news, id) {
        const div = document.createElement('div');
        div.className = 'news-item';
        div.innerHTML = `
            <h3>${news.title}</h3>
            <p>${news.content}</p>
            ${news.imageUrl ? `<img src="${news.imageUrl}" alt="${news.title}" style="max-width: 100%; height: auto;">` : ''}
            <p class="date">${news.date.toDate().toLocaleString()}</p>
            <button class="delete-btn" data-id="${id}">Delete</button>
        `;
        div.querySelector('.delete-btn').addEventListener('click', () => deleteNews(id, news.imageUrl));
        return div;
    }

    async function deleteNews(id, imageUrl) {
        if (confirm('Are you sure you want to delete this news item?')) {
            try {
                await deleteDoc(doc(db, 'news', id));
                if (imageUrl) {
                    const imageRef = ref(storage, imageUrl);
                    await deleteObject(imageRef);
                }
                alert('News deleted successfully!');
                loadNews();
            } catch (error) {
                console.error('Error deleting news:', error);
                alert('Error deleting news. Please try again.');
            }
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Logout button clicked");
            signOut(auth).then(() => {
                console.log("User signed out successfully");
                window.location.href = './index.html';
            }).catch((error) => {
                console.error('Sign out error:', error);
            });
        });
    }
});