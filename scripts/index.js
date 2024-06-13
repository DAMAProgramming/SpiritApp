// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
         
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDAq_D4yEAneEvJr1_h3LKgCUtvjB9sIEM",
    authDomain: "shhs-spirit-app.firebaseapp.com",
    projectId: "shhs-spirit-app",
    storageBucket: "shhs-spirit-app.appspot.com",
    messagingSenderId: "139266596241",
    appId: "1:139266596241:web:3f7290e437eae8754e8e30",
    measurementId: "G-SZYE35NNQ1"
};
            
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

function register() {
    // Get all our input fields
    email = document.getElementById('email').value
    password = document.getElementById('password').value
    username = document.getElementById('username').value

    // Validate input fields
    if (validate_email(email) == false || validate_password(password) == false) {
        alert('Email or Password do not meet requirements!')
        return
    }

    if (validate_field(username) == false) {
        alert('Username does not meet guidelines!')
        return
    }
}

function validate_email(email) {
    expression = /^[^@]+@\w+(\.\w+)+\w$/
    if (expression.test(email) == true) {
        // Email is good
        return true
    } else {
        // Email is bad
        return false
    }
}

function validate_password(password) {
    // Firebase only accepts lengths greater than 6
    if (password < 6) {
        return false
    } else {
        return true
    }
}

function validate_field(field) {
    if (field == null) {
        return false
    } else {
        return true
    }
}  

//Move on with Auth
auth.createUserWithEmailAndPassword(email, pasword)
.then(function(){

    var user = auth.currentUser

    //Add this user to Firebase Database
    var datbase_ref = database.ref()

    //Create User data
    var user_data = {
        email : email,
        username : username,
        password : password,
        last_login : Date.now()
    }

    database_ref.child("users/" + user.uid).set(user_data)




    alert("User Created")

})
.catch(function(error) {
    // Firebase will use this to alert of its errors
    var error_code = error.error_code
    var error_message = error.message

    alert(error_messages)
})