// Import the necessary modules to set up the server
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const SECRET_KEY = 'your_secret_here'; // Replace with a secure secret for generating JWT tokens

// Middleware to enable CORS (Cross-Origin Resource Sharing)
app.use(cors());
app.use(bodyParser.json()); // Middleware to process the body of requests in JSON

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
    const { email, password } = req.body; // Get email and password from the request body
    const hashedPassword = await bcrypt.hash(password, 10); // Encrypt the password for security

    // Check if the user already exists
    db.query('SELECT email FROM users WHERE email = ?', [email], (err, result) => {
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

        // Generate the JWT token
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' }); // Set token expiration to 1 hour
        res.json({ token }); // Return the token to the client
    });
});

// Middleware to verify the JWT token in requests
const authenticateToken = (req, res, next) => {
    // Extract the token from the authorization header
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) return res.sendStatus(401); // Return 401 if there is no token

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403); // Return 403 if the token is invalid or expired
        req.user = user; // Store the user's email in the req object for future use
        next(); // Proceed to the next function
    });
};

// Route to get the logged-in user's data
app.get('/user', authenticateToken, (req, res) => {
    // Query the user's email based on the email stored in the token
    db.query('SELECT email FROM users WHERE email = ?', [req.user.email], (err, result) => {
        if (err) throw err;

        if (result.length === 0) {
            return res.status(404).send('User not found');
        }

        res.json(result[0]); // Return the user's data
    });
});

// Route to update the user's information
app.put('/user', authenticateToken, async (req, res) => {
    const { newEmail, newPassword } = req.body;  // Get the new email and new password
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Encrypt the new password

    // Update the user's email and password
    db.query('UPDATE users SET email = ?, password = ? WHERE email = ?', [newEmail, hashedPassword, req.user.email], (err, result) => {
        if (err) throw err;

        // Check if the update was successful
        if (result.affectedRows === 0) {
            return res.status(404).send('User not found');
        }

        res.send('User updated successfully');
    });
});

// Route to delete the user
app.delete('/user', authenticateToken, (req, res) => {
    // Delete the user based on the email from the token
    db.query('DELETE FROM users WHERE email = ?', [req.user.email], (err, result) => {
        if (err) throw err;

        if (result.affectedRows === 0) {
            return res.status(404).send('User not found');
        }

        res.send('User deleted successfully');
    });
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
