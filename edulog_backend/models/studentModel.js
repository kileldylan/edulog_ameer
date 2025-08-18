const db = require('../config/db');
const moment = require('moment-timezone');

const Student = {
  
  // Get student by user ID
getById: (student_id, callback) => {
  const query = 'SELECT * FROM students WHERE student_id = ?';
  db.query(query, [student_id], (err, results) => {
    if (err) {
      console.error('Error fetching student:', err);
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(null, null); // No student found
    }
    callback(null, results[0]);
  });
},
  // Get attendance statistics
  getAttendanceStats: (student_id, callback) => {
    const query = `
      SELECT 
        COUNT(*) AS total_sessions,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late_count,
        (SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS attendance_percentage
      FROM attendance 
      WHERE student_id = ?
    `;
    db.query(query, [student_id], callback);
  },
getByCourseForStudent: (course_id, student_id, callback) => {
    const query = `
      SELECT 
        s.session_id, 
        s.session_date,
        s.start_time,
        s.end_time,
        s.location,
        c.course_id,
        c.course_name,
        c.course_code,
        t.name AS teacher_name,
        IFNULL(a.status, 'Not Recorded') AS attendance_status
      FROM sessions s
      JOIN courses c ON s.course_id = c.course_id
      JOIN teachers t ON s.teacher_id = t.teacher_id
      LEFT JOIN attendance a ON s.session_id = a.session_id AND a.student_id = ?
      WHERE s.course_id = ?
        AND s.status = 'scheduled'
        AND s.session_date >= CURDATE()
      ORDER BY s.session_date ASC, s.start_time ASC
    `;
    db.query(query, [student_id, course_id], callback);
  },
  getSessionsByStudent: (userId, callback) => {
  // First get the student_id from user_id
  const studentQuery = `
    SELECT s.student_id 
    FROM students s
    JOIN users u ON s.student_id = u.student_id
    WHERE u.user_id = ?
  `;
  db.query(studentQuery, [userId], (err, studentResults) => {
    if (err) return callback(err);
    if (studentResults.length === 0) return callback(null, []);
    
    const studentId = studentResults[0].student_id;
    
    // Now get sessions for enrolled courses
    const sessionsQuery = `
      SELECT 
        s.session_id, 
        s.session_date,
        s.start_time,
        s.end_time,
        s.location,
        c.course_id,
        c.course_name,
        c.course_code,
        t.name AS teacher_name,
        IFNULL(a.status, 'Not Recorded') AS attendance_status
      FROM sessions s
      JOIN courses c ON s.course_id = c.course_id
      JOIN teachers t ON s.teacher_id = t.teacher_id
      JOIN student_courses sc ON c.course_id = sc.course_id
      LEFT JOIN attendance a ON s.session_id = a.session_id AND a.student_id = ?
      WHERE sc.student_id = ?
        AND sc.status = 'active'
        AND s.session_date >= CURDATE()
        AND s.status = 'scheduled'
      ORDER BY s.session_date ASC, s.start_time ASC
    `;
    
    db.query(sessionsQuery, [studentId, studentId], callback);
  });
},
  // Get available sessions
  getAvailableSessions: (student_id, callback) => {
    const query = `
      SELECT s.*, c.course_name, t.name AS teacher_name
      FROM sessions s
      JOIN courses c ON s.course_id = c.course_id
      JOIN teachers t ON s.teacher_id = t.teacher_id
      JOIN student_courses sc ON c.course_id = sc.course_id
      WHERE sc.student_id = ?
      AND s.session_date >= CURDATE()
      AND s.status = 'scheduled'
      ORDER BY s.session_date, s.start_time
    `;
    db.query(query, [student_id], callback);
  },

  // In studentModel.js
  getAttendanceHistory: (studentId, page = 1, limit = 10, callback) => {
    const offset = (page - 1) * limit;
    const query = `
      SELECT 
        a.*, 
        s.session_date, 
        s.start_time, 
        s.end_time,
        c.course_name, 
        c.course_code,
        t.name AS teacher_name
      FROM attendance a
      JOIN sessions s ON a.session_id = s.session_id
      JOIN courses c ON s.course_id = c.course_id
      JOIN teachers t ON s.teacher_id = t.teacher_id
      WHERE a.student_id = ?
      ORDER BY s.session_date DESC
      LIMIT ? OFFSET ?
    `;
    
    // Handle both callback and promise styles
    if (typeof callback === 'function') {
      return db.query(query, [studentId, limit, offset], callback);
    }
    
    return new Promise((resolve, reject) => {
      db.query(query, [studentId, limit, offset], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // Clock in to session
  clockIn: (student_id, session_id, callback) => {
    const clockInTime = moment().tz('Africa/Nairobi').format('YYYY-MM-DD HH:mm:ss');
    const query = `
      INSERT INTO attendance 
      (student_id, session_id, clockInTime, status) 
      VALUES (?, ?, ?, 'Present')
      ON DUPLICATE KEY UPDATE 
      clockInTime = VALUES(clockInTime), 
      status = VALUES(status)
    `;
    db.query(query, [student_id, session_id, clockInTime], callback);
  },

  // Update profile
  updateProfile: (student_id, profileData, callback) => {
    const { email, phone, password } = profileData;
    const query = `
      UPDATE students 
      SET email = ?, phone = ?, password = ?
      WHERE student_id = ?
    `;
    db.query(query, [email, phone, password, student_id], callback);
  }
};

module.exports = Student;