// Import the necessary modules to set up the server
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');  // Import express-session
require('dotenv').config()

const app = express();

// Middleware to enable CORS (Cross-Origin Resource Sharing)
app.use(cors());
app.use(bodyParser.json()); // Middleware to process the body of requests in JSON

// Set up session middleware
app.use(session({
    secret: 'your_secret_here', // Secret key for session signing
    resave: false,              // Don't resave sessions if they haven't been modified
    saveUninitialized: true,    // Save session even if it is new (but empty)
    cookie: { secure: false }   // Set `secure: true` for HTTPS in production
}));

// Configure the connection to the MySQL database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Adjust as needed
    password: '', // Insert password if applicable
    database: 'prestaqui' // Database name
});

// Connect to the database and display success or error message
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the MySQL database!');
});

// Route to register users
app.post('/register', async (req, res) => {
    const { name_, phone_, cep_, state_, city_, address_, neighbornhood_,
        avatar_path_, description_ } = req.body; // Get email and password from the request body

    const hashedPassword = await bcrypt.hash(password, 10); // Encrypt the password for security

    // Check if the user already exists
    db.query('SELECT name_ FROM users WHERE  = ?', [email], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            return res.status(400).send('User already exists');
        }

        // Insert the new user into the database
        db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err, result) => {
            if (err) throw err;
            res.send('User registered successfully');
        });
    });
});

// Route to login users
app.post('/login', async (req, res) => {
    const { email, password } = req.body; // Get email and password from the request body

    // Query the user in the database
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
        if (err) throw err;

        // Check if the user exists and if the password is correct
        if (result.length === 0 || !(await bcrypt.compare(password, result[0].password))) {
            return res.status(400).send('Invalid email or password');
        }

        // Save user email in the session
        req.session.user = { email }; // Store user email in the session
        res.send('Logged in successfully!');
    });
});

// Middleware to check if the user is authenticated via session
const authenticateSession = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }
    next(); // Proceed if the user is authenticated
};

// Route to get the logged-in user's data
app.get('/user', authenticateSession, (req, res) => {
    const { email } = req.session.user;

    // Query the user's email based on the email stored in the session
    db.query('SELECT email FROM users WHERE email = ?', [email], (err, result) => {
        if (err) throw err;

        if (result.length === 0) {
            return res.status(404).send('User not found');
        }

        res.json(result[0]); // Return the user's data
    });
});

// Route to update the user's information
app.put('/user', authenticateSession, async (req, res) => {
    const { newEmail, newPassword } = req.body;  // Get the new email and new password
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Encrypt the new password

    // Update the user's email and password
    db.query('UPDATE users SET email = ?, password = ? WHERE email = ?', [newEmail, hashedPassword, req.session.user.email], (err, result) => {
        if (err) throw err;

        // Check if the update was successful
        if (result.affectedRows === 0) {
            return res.status(404).send('User not found');
        }

        // Update session data after email change
        req.session.user.email = newEmail; // Update session email to new email

        res.send('User updated successfully');
    });
});

// Route to delete the user
app.delete('/user', authenticateSession, (req, res) => {
    // Delete the user based on the email from the session
    db.query('DELETE FROM users WHERE email = ?', [req.session.user.email], (err, result) => {
        if (err) throw err;

        if (result.affectedRows === 0) {
            return res.status(404).send('User not found');
        }

        // Destroy the session after user deletion
        req.session.destroy((err) => {
            if (err) throw err;
            res.send('User deleted and session destroyed');
        });
    });
});

// Route to logout the user
app.post('/logout', authenticateSession, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        res.send('Logged out successfully');
    });
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
