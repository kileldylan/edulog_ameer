const db = require('../config/db');

const Course = {
  // Get all courses
  getAll: (callback) => {
    const query = 'SELECT * FROM courses ORDER BY course_name ASC';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching courses:', err);
        return callback(err, null);
      }
      callback(null, results);
    });
  },

  // Get single course by ID
  getById: (course_id, callback) => {
    const query = 'SELECT * FROM courses WHERE course_id = ?';
    db.query(query, [course_id], (err, results) => {
      if (err) {
        console.error('Error fetching course:', err);
        return callback(err, null);
      }
      if (results.length === 0) {
        return callback(null, null); // No course found
      }
      callback(null, results[0]);
    });
  },

  // Create new course
  create: (courseData, callback) => {
    const { course_code, course_name, department } = courseData;
    const query = 'INSERT INTO courses (course_code, course_name, department) VALUES (?, ?, ?)';
    
    db.query(query, [course_code, course_name, department], (err, results) => {
      if (err) {
        console.error('Error creating course:', err);
        return callback(err);
      }
      callback(null, results.insertId); // Return the new course ID
    });
  },

  // Update existing course
  update: (course_id, courseData, callback) => {
    const { course_code, course_name, department } = courseData;
    const query = 'UPDATE courses SET course_code = ?, course_name = ?, department = ? WHERE course_id = ?';
    
    db.query(query, [course_code, course_name, department, course_id], (err, results) => {
      if (err) {
        console.error('Error updating course:', err);
        return callback(err);
      }
      if (results.affectedRows === 0) {
        return callback(new Error('No course found with that ID'));
      }
      callback(null);
    });
  },

  // Delete course
  delete: (course_id, callback) => {
    const query = 'DELETE FROM courses WHERE course_id = ?';
    
    db.query(query, [course_id], (err, results) => {
      if (err) {
        console.error('Error deleting course:', err);
        return callback(err);
      }
      if (results.affectedRows === 0) {
        return callback(new Error('No course found with that ID'));
      }
      callback(null);
    });
  },

  // Search courses
  search: (searchTerm, callback) => {
    const query = `
      SELECT * FROM courses 
      WHERE course_name LIKE ? 
      OR course_code LIKE ? 
      OR department LIKE ? 
      ORDER BY course_name ASC
    `;
    const searchValue = `%${searchTerm}%`;
    
    db.query(query, [searchValue, searchValue, searchValue], (err, results) => {
      if (err) {
        console.error('Error searching courses:', err);
        return callback(err, null);
      }
      callback(null, results);
    });
  },

  // Check if course code exists (for validation)
  checkCodeExists: (course_code, callback) => {
    const query = 'SELECT course_id FROM courses WHERE course_code = ?';
    
    db.query(query, [course_code], (err, results) => {
      if (err) {
        console.error('Error checking course code:', err);
        return callback(err, null);
      }
      callback(null, results.length > 0);
    });
  },

  // Get courses by department
  getByDepartment: (department, callback) => {
    const query = 'SELECT * FROM courses WHERE department = ? ORDER BY course_name ASC';
    
    db.query(query, [department], (err, results) => {
      if (err) {
        console.error('Error fetching courses by department:', err);
        return callback(err, null);
      }
      callback(null, results);
    });
  }
};

module.exports = Course;