const db = require('../config/db');
const moment = require('moment-timezone');
const bcrypt = require('bcrypt');

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
// Add these new methods to your Student model

getStudentByUserId: (userId, callback) => {
  const query = `
    SELECT s.* FROM students s
    JOIN users u ON s.student_id = u.student_id
    WHERE u.user_id = ?
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0] || null);
  });
},

getCurrentStreak: (userId, callback) => {
  const query = `
    WITH consecutive_days AS (
      SELECT 
        session_date,
        status,
        @streak := IF(
          status = 'Present' AND DATEDIFF(session_date, @prev_date) = 1,
          @streak + 1,
          IF(status = 'Present', 1, 0)
        ) AS streak,
        @prev_date := session_date
      FROM 
        (SELECT a.session_id, s.session_date, a.status 
         FROM attendance a
         JOIN sessions s ON a.session_id = s.session_id
         JOIN users u ON a.student_id = u.student_id
         WHERE u.user_id = ?
         ORDER BY s.session_date DESC) AS student_attendance,
        (SELECT @streak := 0, @prev_date := NULL) AS vars
    )
    SELECT MAX(streak) AS current_streak FROM consecutive_days;
  `;
  db.query(query, [userId], callback);
},

getAttendanceTrend: (userId, callback) => {
  const query = `
    SELECT 
      (
        SELECT COUNT(*) 
        FROM attendance a
        JOIN sessions s ON a.session_id = s.session_id
        JOIN users u ON a.student_id = u.student_id
        WHERE u.user_id = ? 
        AND a.status = 'Present'
        AND s.session_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND CURDATE()
      ) - (
        SELECT COUNT(*) 
        FROM attendance a
        JOIN sessions s ON a.session_id = s.session_id
        JOIN users u ON a.student_id = u.student_id
        WHERE u.user_id = ? 
        AND a.status = 'Present'
        AND s.session_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 28 DAY) AND DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      ) AS trend;
  `;
  db.query(query, [userId, userId], callback);
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
 updateProfile: (student_id, { email, password }, callback) => {
    // Start transaction
    db.beginTransaction(async (err) => {
      if (err) return callback(err);

      try {
        // 1. Update student info (email)
        await new Promise((resolve, reject) => {
          db.query(
            `UPDATE students SET email = ? WHERE student_id = ?`,
            [email, student_id],
            (err) => err ? reject(err) : resolve()
          );
        });

        // 2. Update password in users table if provided
        if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await new Promise((resolve, reject) => {
            db.query(
              `UPDATE users 
               SET password = ? 
               WHERE user_id = (
                 SELECT user_id FROM students WHERE student_id = ?
               )`,
              [hashedPassword, student_id],
              (err) => err ? reject(err) : resolve()
            );
          });
        }

        // Commit transaction
        await new Promise((resolve, reject) => {
          db.commit((err) => err ? reject(err) : resolve());
        });

        callback(null, { affectedRows: 1 });
      } catch (error) {
        // Rollback on error
        await new Promise((resolve) => db.rollback(() => resolve()));
        callback(error);
      }
    });
  }
};

module.exports = Student;