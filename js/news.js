// news.js

import { db } from './firebase-config.js';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    loadNews();
    setupPopup();
});

async function loadNews() {
    const newsGrid = document.getElementById('news-grid');
    
    try {
        const newsQuery = query(collection(db, 'news'), orderBy('date', 'desc'), limit(20));
        const snapshot = await getDocs(newsQuery);
        
        newsGrid.innerHTML = '';
        snapshot.forEach(doc => {
            const news = doc.data();
            news.id = doc.id; // Add the document ID to the news object
            const newsElement = createNewsElement(news);
            newsGrid.appendChild(newsElement);
        });
    } catch (error) {
        console.error('Error loading news:', error);
        newsGrid.innerHTML = '<p>Error loading news. Please try again later.</p>';
    }
}

function createNewsElement(news) {
    const article = document.createElement('article');
    article.className = 'news-card';
    
    const content = `
        ${news.imageUrl ? `<img src="${news.imageUrl}" alt="${news.title}" class="news-card__image">` : ''}
        <div class="news-card__content">
            <h2 class="news-card__title">${news.title}</h2>
            <p class="news-card__excerpt">${truncateText(news.content, 100)}</p>
            <p class="news-card__date">${formatDate(news.date.toDate())}</p>
            <button class="news-card__link" data-news-id="${news.id}">Read more</button>
        </div>
    `;
    
    article.innerHTML = content;
    return article;
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function setupPopup() {
    const popup = document.getElementById('news-popup');
    const closeBtn = document.querySelector('.news-popup__close');
    const newsGrid = document.getElementById('news-grid');

    newsGrid.addEventListener('click', async function(e) {
        if (e.target.classList.contains('news-card__link')) {
            e.preventDefault();
            const newsId = e.target.getAttribute('data-news-id');
            const newsData = await getNewsById(newsId);
            if (newsData) {
                showPopup(newsData);
            }
        }
    });

    closeBtn.addEventListener('click', closePopup);
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            closePopup();
        }
    });

    // Close popup when pressing Esc key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePopup();
        }
    });
}

async function getNewsById(id) {
    try {
        const docRef = doc(db, 'news', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        return null;
    }
}

function showPopup(news) {
    const popup = document.getElementById('news-popup');
    const title = document.getElementById('popup-title');
    const image = document.getElementById('popup-image');
    const content = document.getElementById('popup-content');
    const date = document.getElementById('popup-date');

    title.textContent = news.title;
    content.textContent = news.content;
    date.textContent = formatDate(news.date.toDate());

    if (news.imageUrl) {
        image.src = news.imageUrl;
        image.style.display = 'block';
    } else {
        image.style.display = 'none';
    }

    popup.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when popup is open
}

function closePopup() {
    const popup = document.getElementById('news-popup');
    popup.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
}