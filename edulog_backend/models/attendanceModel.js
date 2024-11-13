const db = require('../config/db');
const moment = require('moment-timezone');

const Attendance = {
  // Insert attendance (Clock In)
  clockIn: (student_id, callback) => {
    const date = new Date().toISOString().split('T')[0]; // Get only the date part (YYYY-MM-DD)
    const clockInTime = moment().tz('Africa/Nairobi').format('YYYY-MM-DD HH:mm:ss'); // Set time to EAT
    const status = 'Present';

    const query = 'INSERT INTO attendance (student_id, date, status, clockInTime) VALUES (?, ?, ?, ?)';
    db.query(query, [student_id, date, status, clockInTime], (err, results) => {
      if (err) {
        console.error('Error inserting attendance record:', err);
        return callback(err);
      }
      callback(null, results);
    });
  },

  // Update attendance (Clock Out)
  // Update attendance (Clock Out)
    clockOut: (student_id, callback) => {
      const clockOutTime = moment().tz('Africa/Nairobi').format('YYYY-MM-DD HH:mm:ss'); // Set time to EAT

      // Update the status to "Absent" when clocking out
      const status = 'Absent';

      const query = 'UPDATE attendance SET clockOutTime = ?, status = ? WHERE student_id = ? AND clockOutTime IS NULL';
      db.query(query, [clockOutTime, status, student_id], (err, results) => {
        if (err) {
          console.error('Error updating clock-out record:', err);
          return callback(err);
        }
        callback(null, results);
      });
    },

  // Fetch attendance by student_id
  getAttendanceByStudentId: (student_id, callback) => {
    const query = 'SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC';
    db.query(query, [student_id], (err, results) => {
      if (err) {
        console.error('Error fetching attendance:', err);
        return callback(err);
      }
      callback(null, results);
    });
  },

  // Fetch all records
  getAllRecords: (callback) => {
    const query = `SELECT attendance_id, student_id , date,  status, clockInTime, clockOutTime
    FROM attendance`;
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching attendance records:', err);
        return callback(err);
      }
      console.log('Fetched attendance records:', results); // Add this log
      callback(null, results);
    });
  }
,  

  // Attendance stats (present/absent counts)
  getAttendanceStats: (callback) => {
    const query = `
      SELECT 
        COUNT(CASE WHEN status = 'Present' THEN 1 END) AS present,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) AS absent
      FROM attendance
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching attendance stats:', err);
        return callback(err);
      }
      callback(null, results[0]);
    });
  },
};

module.exports = Attendance;
