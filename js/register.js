import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
const auth = getAuth();
createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });


document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Handle successful registration
            alert('Registration successful!');
            window.location.href = '/login.html'; // Redirect to login page after registration
        })
        .catch((error) => {
            // Handle errors during registration
            alert("Error: " + error.message);
        });
});
