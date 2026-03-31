const mysql = require('mysql2');

/**
 * Database connection configuration.
 * Replace 'your_password' with your actual MySQL password.
 */
const db = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'User@2004',
    database: process.env.DB_NAME || 'notes_app'
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
