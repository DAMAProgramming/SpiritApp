import { db, storage, auth } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const newsForm = document.getElementById('news-form');
    const newsList = document.getElementById('news-list');
    const logoutBtn = document.getElementById('logout-btn');

    // Initialize TinyMCE
    tinymce.init({
        selector: '#news-content',
        plugins: 'advlist autolink lists link image charmap print preview anchor',
        toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | image',
        file_picker_types: 'image',
        images_upload_handler: handleImageUpload,
        automatic_uploads: false,
        images_reuse_filename: true,
        file_picker_callback: function(callback, value, meta) {
            if (meta.filetype === 'image') {
                var input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
    
                input.onchange = function() {
                    var file = this.files[0];
                    handleImageUpload(file, callback, function(error) {
                        console.error('Image upload failed:', error);
                    });
                };
    
                input.click();
            }
        }
    });
    

    newsForm.addEventListener('submit', handleNewsSubmit);
    loadNews();

    async function handleNewsSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('news-title').value;
        const content = tinymce.get('news-content').getContent();
    
        if (!title.trim()) {
            alert('Please enter a title for the news post.');
            return;
        }
    
        // Disable the submit button to prevent multiple submissions
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
    
        try {
            // Force TinyMCE to upload any remaining images
            await tinymce.activeEditor.uploadImages();
    
            // Get the updated content after image uploads
            const updatedContent = tinymce.get('news-content').getContent();
    
            await addDoc(collection(db, 'news'), {
                title,
                content: updatedContent,
                date: new Date()
            });
    
            alert('News posted successfully!');
            e.target.reset();
            tinymce.get('news-content').setContent('');
            loadNews();
        } catch (error) {
            console.error('Error posting news:', error);
            alert('Error posting news. Please try again.');
        } finally {
            // Re-enable the submit button
            submitButton.disabled = false;
        }
    }

    async function handleImageUpload(file, success, failure) {
        try {
            const fileName = `image-${Date.now()}-${file.name}`;
            const storageRef = ref(storage, `news-images/${fileName}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            
            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                },
                (error) => {
                    failure('Image upload failed: ' + error.message);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    success(downloadURL);
                }
            );
        } catch (error) {
            failure('Image upload failed: ' + error.message);
        }
    }

    async function loadNews() {
        try {
            const newsQuery = query(collection(db, 'news'), orderBy('date', 'desc'));
            const snapshot = await getDocs(newsQuery);
            newsList.innerHTML = '';
            snapshot.forEach(doc => {
                const news = doc.data();
                const newsElement = createNewsElement(news, doc.id);
                newsList.appendChild(newsElement);
            });
        } catch (error) {
            console.error('Error loading news:', error);
            alert('Error loading news. Please check the console for details.');
        }
    }

    function createNewsElement(news, id) {
        const div = document.createElement('div');
        div.className = 'news-item';
        div.innerHTML = `
            <h3>${news.title}</h3>
            <div class="news-content"></div>
            <p class="date">${news.date.toDate().toLocaleString()}</p>
            <button class="delete-btn" data-id="${id}">Delete</button>
        `;
        // Use innerHTML to properly render the content, including GIFs
        div.querySelector('.news-content').innerHTML = news.content;
        div.querySelector('.delete-btn').addEventListener('click', () => deleteNews(id));
        return div;
    }

    async function deleteNews(id) {
        if (confirm('Are you sure you want to delete this news item?')) {
            try {
                await deleteDoc(doc(db, 'news', id));
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
            signOut(auth).then(() => {
                console.log("User signed out successfully");
                window.location.href = './index.html';
            }).catch((error) => {
                console.error('Sign out error:', error);
            });
        });
    }
});