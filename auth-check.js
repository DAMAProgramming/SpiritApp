// auth-check.js

import { auth, db } from './js/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

async function checkAuth(requireAdmin = false) {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (requireAdmin) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().isAdmin) {
            resolve(user);
          } else {
            reject('User is not an admin');
          }
        } else {
          resolve(user);
        }
      } else {
        reject('User not authenticated');
      }
    });
  });
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  const isAdminPage = window.location.pathname.includes('admin') || 
                      window.location.pathname.includes('manage');
  
  checkAuth(isAdminPage)
    .then((user) => {
      console.log('User is authenticated:', user.email);
      // You can add any additional setup for authenticated users here
    })
    .catch((error) => {
      console.error('Authentication failed:', error);
      alert('You do not have permission to access this page.');
      window.location.href = './login.html';
    });
});

export { checkAuth };