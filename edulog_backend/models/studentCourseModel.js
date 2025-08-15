const db = require('../config/db');

const StudentCourse = {
  // Enroll student in a course
  enrollStudent: (studentId, courseId, callback) => {
    const query = `
      INSERT INTO student_courses (student_id, course_id, enrollment_date, status)
      VALUES (?, ?, CURDATE(), 'active')
      ON DUPLICATE KEY UPDATE status = 'active'
    `;
    db.query(query, [studentId, courseId], callback);
  },

  // Get all courses for a student
  getStudentCourses: (studentId, callback) => {
    const query = `
      SELECT c.*, sc.enrollment_date, sc.status
      FROM student_courses sc
      JOIN courses c ON sc.course_id = c.course_id
      WHERE sc.student_id = ? AND sc.status = 'active'
    `;
    db.query(query, [studentId], callback);
  },

  // Get all available courses (not enrolled by student)
  getAvailableCourses: (studentId, callback) => {
    const query = `
      SELECT c.* 
      FROM courses c
      WHERE c.course_id NOT IN (
        SELECT course_id 
        FROM student_courses 
        WHERE student_id = ? AND status = 'active'
      )
    `;
    db.query(query, [studentId], callback);
  },

  // Update enrollment status (drop course)
  updateEnrollmentStatus: (studentId, courseId, status, callback) => {
    const query = `
      UPDATE student_courses 
      SET status = ?
      WHERE student_id = ? AND course_id = ?
    `;
    db.query(query, [status, studentId, courseId], callback);
  },

  // Check if student is enrolled in course
  isEnrolled: (studentId, courseId, callback) => {
    const query = `
      SELECT 1 FROM student_courses
      WHERE student_id = ? AND course_id = ? AND status = 'active'
    `;
    db.query(query, [studentId, courseId], callback);
  }
};

module.exports = StudentCourse;