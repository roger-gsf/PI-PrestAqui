require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'prestaqui'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the MySQL database!');
});

// Register route
app.post('/register', async (req, res) => {
    const { email, password_, name_, phone, cep, state_, city, neighborhood, address_line, complement, avatar_path, description_, user_type } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password_, 10);

        db.query('SELECT email FROM users WHERE email = ?', [email], (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                return res.status(400).send('This email is already registered');
            }

            db.query(
                `INSERT INTO users (email, password_, name_, phone, cep, state_, city, neighborhood, address_line, complement, avatar_path, description_, user_type)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [email, hashedPassword, name_, phone, cep, state_, city, neighborhood, address_line, complement, avatar_path, description_, user_type],
                (err) => {
                    if (err) throw err;
                    res.send('User registered successfully!');
                }
            );
        });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

// Login route
app.post('/login', (req, res) => {
    const { email, password_ } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
        if (err) throw err;

        if (result.length === 0 || !(await bcrypt.compare(password_, result[0].password_))) {
            return res.status(400).send('Invalid email or password');
        }

        req.session.user = { id: result[0].id, email };
        res.send('Logged in successfully!');
    });
});

// Middleware for session authentication
const authenticateSession = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }
    next();
};

// Get user details
app.get('/user', authenticateSession, (req, res) => {
    const { id } = req.session.user;

    db.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
        if (err) throw err;

        if (result.length === 0) {
            return res.status(404).send('User not found');
        }
        res.json(result[0]);
    });
});

// Update user details
app.put('/user', authenticateSession, async (req, res) => {
    const { newEmail, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { id } = req.session.user;

    db.query('UPDATE users SET email = ?, password_ = ? WHERE id = ?', [newEmail, hashedPassword, id], (err, result) => {
        if (err) throw err;

        if (result.affectedRows === 0) {
            return res.status(404).send('User not found');
        }

        req.session.user.email = newEmail;
        res.send('User updated successfully');
    });
});

// Delete user
app.delete('/user', authenticateSession, (req, res) => {
    const { id } = req.session.user;

    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
        if (err) throw err;

        if (result.affectedRows === 0) {
            return res.status(404).send('User not found');
        }

        req.session.destroy((err) => {
            if (err) throw err;
            res.send('User deleted and session destroyed');
        });
    });
});

// Logout route
app.post('/logout', authenticateSession, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        res.send('Logged out successfully');
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
