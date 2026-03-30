const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- REST API Endpoints ---

/**
 * POST /add-note - Add a new note to the database
 */
app.post('/add-note', (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    const query = 'INSERT INTO notes (title, content) VALUES (?, ?)';
    db.query(query, [title, content], (err, result) => {
        if (err) {
            console.error('Error adding note: ' + err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'Note added successfully', id: result.insertId });
    });
});

/**
 * GET /notes - Fetch all notes from the database
 */
app.get('/notes', (req, res) => {
    const query = 'SELECT * FROM notes ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching notes: ' + err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});

/**
 * DELETE /delete/:id - Delete a note by its ID
 */
app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM notes WHERE id = ?';
    
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting note: ' + err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json({ message: 'Note deleted successfully' });
    });
});

// Basic Login (Optional - Simulated for beginner-friendly demonstration)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.json({ success: true, message: 'Logged in successfully' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
