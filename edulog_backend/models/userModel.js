const db = require('../config/db');

const User = {
    findByUsername: (username, callback) => {
        const query = 'SELECT student_id, username, password, role FROM users WHERE username = ?';
        db.query(query, [username], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    createUser: (student_id, username, email, role, password, callback) => {
        // Prepare the insert statement and values
        const query = 'INSERT INTO users (username, email, role, password' + 
                      (student_id ? ', student_id' : '') + 
                      ') VALUES (?, ?, ?, ?' + 
                      (student_id ? ', ?' : '') + 
                      ')';
        
        const values = [username, email, role, password];
        if (student_id) {
            values.push(student_id); // Only add student_id if it's provided
        }

        db.query(query, values, (err) => {
            if (err) {
                console.error('Database insertion error:', err); // Log the error
                return callback(err);
            }
            callback(null);
        });
    }
};

module.exports = User;
