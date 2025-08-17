const db = require('../config/db');

const User = {
  // Updated findByUsername to always return an array
  findByUsername: (username, callback) => {
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
      if (err) return callback(err);
      // Ensure we always return an array, even if empty
      callback(null, results);
    });
  },

  // ... keep your other methods the same ...
  createStudentRecord: (studentData, callback) => {
    const { name, email, department, course_id, year_of_study } = studentData;
    const query = `
      INSERT INTO students (name, email, department, course_id, year_of_study)
      VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [name, email, department, course_id, year_of_study], callback);
  },

  createUser: (userData, callback) => {
    const { username, email, role, password, student_id } = userData;
    const query = `
      INSERT INTO users (username, email, role, password, student_id)
      VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [username, email, role, password, student_id || null], callback);
  }
};

module.exports = User;