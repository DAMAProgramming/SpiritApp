import { doc, setDoc } from './firebase-config.js';
import { getAuth, onAuthStateChanged } from './firebase-config.js';

const db = getFirestore();
const auth = getAuth();

onAuthStateChanged(auth, user => {
    if (user) {
        // Check if the user is an admin
        const adminRef = doc(db, 'admins', user.uid);
        getDoc(adminRef).then(docSnap => {
            if (docSnap.exists() && docSnap.data().isAdmin) {
                // User is admin, allow access to the page
                console.log('Access granted. User is an admin.');
            } else {
                // Not an admin, redirect or show an error
                alert('Access Denied. You are not an admin.');
                window.location.href = '/login.html'; // Redirect to login page or home page
            }
        });
    } else {
        // No user is signed in
        alert('Please login to access this page.');
        window.location.href = '/login.html';
    }
});

document.getElementById('pointsForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const teamName = document.getElementById('teamName').value;
    const points = parseInt(document.getElementById('points').value, 10);

    const pointsRef = doc(db, 'points', teamName);
    setDoc(pointsRef, { teamName: teamName, points: points }, { merge: true })
        .then(() => {
            alert('Points updated successfully!');
        })
        .catch(error => {
            console.error('Error updating points:', error);
            alert('Failed to update points.');
        });
});
