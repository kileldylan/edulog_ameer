const db = require('../config/db');
const moment = require('moment-timezone');

const Session = {
  generateSessionId: (course_code) => {
    const datePart = moment().format('YYYYMMDD');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `${course_code}-${datePart}-${randomPart}`;
  },

  create: (sessionData, callback) => {
    const sessionId = Session.generateSessionId(sessionData.course_code);
    
    db.query(
      `INSERT INTO sessions (session_id, course_id, teacher_id, session_date, start_time, end_time, location, status)
       SELECT ?, c.course_id, t.teacher_id, ?, ?, ?, ?, ?
       FROM courses c, teachers t
       WHERE c.course_code = ? AND t.email = ?`,
      [
        sessionId,
        sessionData.session_date,
        sessionData.start_time,
        sessionData.end_time,
        sessionData.location || 'TBD',
        'scheduled',
        sessionData.course_code,
        sessionData.teacher_email
      ],
      (err, result) => {
        if (err) return callback(err);
        callback(null, { ...sessionData, session_id: sessionId });
      }
    );
  },

  getAll: (callback) => {
    db.query(
      `SELECT s.*, c.course_code, c.course_name, t.name AS teacher_name, t.email AS teacher_email
       FROM sessions s
       JOIN courses c ON s.course_id = c.course_id
       JOIN teachers t ON s.teacher_id = t.teacher_id
       ORDER BY s.session_date DESC, s.start_time DESC`,
      callback
    );
  },

  getById: (session_id, callback) => {
    db.query(
      `SELECT s.*, c.course_code, c.course_name, t.name AS teacher_name, t.email AS teacher_email
       FROM sessions s
       JOIN courses c ON s.course_id = c.course_id
       JOIN teachers t ON s.teacher_id = t.teacher_id
       WHERE s.session_id = ?`,
      [session_id],
      callback
    );
  },

  update: (session_id, sessionData, callback) => {
    db.query(
      `UPDATE sessions s
       JOIN courses c ON c.course_code = ?
       JOIN teachers t ON t.email = ?
       SET s.session_date = ?, s.start_time = ?, s.end_time = ?, s.location = ?, s.status = ?
       WHERE s.session_id = ?`,
      [
        sessionData.course_code,
        sessionData.teacher_email,
        sessionData.session_date,
        sessionData.start_time,
        sessionData.end_time,
        sessionData.location,
        sessionData.status,
        session_id
      ],
      callback
    );
  },

  delete: (session_id, callback) => {
    db.query('DELETE FROM sessions WHERE session_id = ?', [session_id], callback);
  },

  getByTeacher: (teacher_id, callback) => {
    db.query(
      `SELECT s.*, c.course_name 
       FROM sessions s
       JOIN courses c ON s.course_id = c.course_id
       WHERE s.teacher_id = ?
       ORDER BY s.session_date DESC`,
      [teacher_id],
      callback
    );
  },

  getByCourse: (course_id, callback) => {
    db.query(
      `SELECT s.*, t.name AS teacher_name 
       FROM sessions s
       JOIN teachers t ON s.teacher_id = t.teacher_id
       WHERE s.course_id = ?
       ORDER BY s.session_date DESC`,
      [course_id],
      callback
    );
  }
};

module.exports = Session;