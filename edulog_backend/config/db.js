// /config/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // replace with your database username
    password: '', // replace with your database password
    database: 'edulog' // replace with your database name
});

// Connect to MySQL Database
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});

module.exports = db;
