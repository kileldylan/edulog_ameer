const db = require('../config/db');

const Admin = {
  getDashboardStats: (callback) => {
    // Get all stats in parallel
    Promise.all([
      // Total students
      new Promise((resolve) => {
        db.query('SELECT COUNT(*) AS total FROM students', (err, results) => {
          if (err) throw err;
          resolve(results[0].total);
        });
      }),
      // Today's attendance percentage (FIXED)
      new Promise((resolve) => {
        db.query(`
          SELECT 
            COUNT(DISTINCT a.student_id) AS present_count,
            (SELECT COUNT(*) FROM students) AS total_count
          FROM attendance a
          WHERE DATE(a.date) = CURDATE()
          AND a.status = 'Present'
        `, (err, results) => {
          if (err) throw err;
          const percentage = results[0].total_count > 0 
            ? Math.round((results[0].present_count / results[0].total_count) * 100)
            : 0;
          resolve(percentage);
        });
      }),
      // Absent students today (FIXED)
      new Promise((resolve) => {
        db.query(`
          SELECT COUNT(*) AS absent_count
          FROM students s
          WHERE s.student_id NOT IN (
            SELECT a.student_id 
            FROM attendance a
            WHERE DATE(a.date) = CURDATE()
            AND a.status = 'Present'
          )
        `, (err, results) => {
          if (err) throw err;
          resolve(results[0].absent_count);
        });
      }),
      // Department stats
      new Promise((resolve) => {
        db.query(`
          SELECT department, COUNT(*) AS student_count 
          FROM students 
          GROUP BY department
        `, (err, results) => {
          if (err) throw err;
          resolve(results);
        });
      }),
      // Recent attendance logs (FIXED)
      new Promise((resolve) => {
        db.query(`
          SELECT s.name, a.status, a.date, c.course_name
          FROM attendance a
          JOIN students s ON a.student_id = s.student_id
          LEFT JOIN student_courses sc ON s.student_id = sc.student_id
          LEFT JOIN courses c ON sc.course_id = c.course_id
          WHERE DATE(a.date) = CURDATE()
          ORDER BY a.date DESC, a.clockInTime DESC
          LIMIT 5
        `, (err, results) => {
          if (err) throw err;
          resolve(results);
        });
      })
    ])
    .then(([totalStudents, attendanceToday, absentStudents, departmentStats, recentLogs]) => {
      callback(null, {
        totalStudents,
        attendanceToday,
        absentStudents,
        departmentStats,
        recentLogs
      });
    })
    .catch(err => callback(err));
  }
};

module.exports = Admin;