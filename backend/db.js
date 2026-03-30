const mysql = require('mysql2');

/**
 * Database connection configuration.
 * Replace 'your_password' with your actual MySQL password.
 */
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'User@2004', // Enter your MySQL root password here
    database: 'notes_app'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.message);
        return;
    }
    console.log('Connected to MySQL Database: notes_app');
});

module.exports = db;
