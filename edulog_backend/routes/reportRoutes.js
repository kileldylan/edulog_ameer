const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Route to fetch filtered reports
router.get('/', (req, res) => {
  const { startDate, endDate, roleFilter, courseFilter, statusFilter, studentNameFilter } = req.query;

  let query = `
    SELECT reports.report_id, reports.date, reports.user_id, reports.user_name, reports.role, 
           reports.category, reports.amount, reports.description, 
           attendance.status, students.course, students.student_name, users.role AS user_role
    FROM reports
    LEFT JOIN attendance ON reports.user_id = attendance.user_id
    LEFT JOIN students ON reports.user_id = students.user_id
    LEFT JOIN users ON reports.user_id = users.user_id
    WHERE 1=1
  `;

  let queryParams = [];

  // Apply filters dynamically based on the query parameters
  if (startDate) {
    query += ' AND reports.date >= ?';
    queryParams.push(startDate);
  }

  if (endDate) {
    query += ' AND reports.date <= ?';
    queryParams.push(endDate);
  }

  // Dynamic role filter (can fetch from `users` table)
  if (roleFilter) {
    query += ' AND users.role = ?';
    queryParams.push(roleFilter);
  }

  // Dynamic course filter (can fetch from `students` table)
  if (courseFilter) {
    query += ' AND students.course = ?';
    queryParams.push(courseFilter);
  }

  // Dynamic status filter (fetch from `attendance` table)
  if (statusFilter) {
    query += ' AND attendance.status = ?';
    queryParams.push(statusFilter);
  }

  // Dynamic student name filter (fetch from `students` table)
  if (studentNameFilter) {
    query += ' AND students.student_name LIKE ?';
    queryParams.push('%' + studentNameFilter + '%');
  }

  // Execute the query with filters
  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching reports:', err);
      return res.status(500).json({ error: 'Failed to fetch reports' });
    }
    res.json(results);
  });
});

module.exports = router;
