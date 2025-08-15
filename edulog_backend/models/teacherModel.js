const db = require('../config/db');

const Teacher = {
  getAll: (callback) => {
    db.query('SELECT * FROM teachers ORDER BY name ASC', callback);
  },

  getById: (teacher_id, callback) => {
    db.query('SELECT * FROM teachers WHERE teacher_id = ?', [teacher_id], callback);
  },

  create: (teacherData, callback) => {
    const { name, email, department } = teacherData;
    db.query(
      'INSERT INTO teachers (name, email, department) VALUES (?, ?, ?)',
      [name, email, department],
      callback
    );
  },

  update: (teacher_id, teacherData, callback) => {
    const { name, email, department } = teacherData;
    db.query(
      'UPDATE teachers SET name = ?, email = ?, department = ? WHERE teacher_id = ?',
      [name, email, department, teacher_id],
      callback
    );
  },

  delete: (teacher_id, callback) => {
    db.query('DELETE FROM teachers WHERE teacher_id = ?', [teacher_id], callback);
  },

  search: (searchTerm, callback) => {
    db.query(
      'SELECT * FROM teachers WHERE name LIKE ? OR email LIKE ? OR department LIKE ?',
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`],
      callback
    );
  }
};

module.exports = Teacher;