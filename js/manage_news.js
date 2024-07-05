import { getFirestore, collection, addDoc } from './firebase-config.js';

const db = getFirestore();

document.getElementById('newsForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    const newsCol = collection(db, 'news');
    addDoc(newsCol, { title: title, content: content })
        .then(() => {
            alert('News posted successfully!');
        })
        .catch(error => {
            console.error('Error posting news:', error);
            alert('Failed to post news.');
        });
});
