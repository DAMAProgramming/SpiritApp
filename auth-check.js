import { getAuth, onAuthStateChanged } from './js/firebase-config';

const auth = getAuth();

function checkAuth() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        reject('User not authenticated');
      }
    });
  });
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuth()
    .then((user) => {
      console.log('User is authenticated:', user.email);
      // You can add any additional setup for authenticated users here
    })
    .catch((error) => {
      console.error('Authentication failed:', error);
      alert('Please log in to access this page.');
      window.location.href = '/SpiritApp/login.html';
    });
});

// Export the checkAuth function for use in other scripts if needed
export { checkAuth };