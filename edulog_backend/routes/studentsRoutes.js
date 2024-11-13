// routes/studentRoutes.js
const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Fetch all students
router.get('/', (req, res) => {
    const query = 'SELECT student_id, name, email, course, department, year_of_study, total_classes, classes_attended, attendance_percentage FROM students';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching students:', err);
            return res.status(500).json({ error: 'Failed to fetch students' });
        }
        res.json(results);
    });
});

// Get a specific student by student_id
router.get('/:student_id', (req, res) => {
    const query = 'SELECT * FROM students WHERE student_id = ?';
    db.query(query, [req.params.student_id], (err, results) => {
        if (err) {
            console.error('Error fetching student:', err);
            return res.status(500).json({ error: 'Failed to fetch student' });
        }
        res.json(results[0]);
    });
});

// Add a new student
router.post('/', (req, res) => {
    const { student_id, name, email, course, department, year_of_study, total_classes, classes_attended } = req.body;
    const query = 'INSERT INTO students (student_id, name, email, course, department, year_of_study, total_classes, classes_attended) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [student_id, name, email, course, department, year_of_study, total_classes, classes_attended], (err, result) => {
        if (err) {
            console.error('Error adding student:', err);
            return res.status(500).json({ error: 'Failed to add student' });
        }
        res.status(201).json({ id: result.insertId, ...req.body });
    });
});

// Update a student
router.put('/:student_id', (req, res) => {
    const { name, email, course, department, year_of_study, total_classes, classes_attended } = req.body;
    const query = 'UPDATE students SET name = ?, email = ?, course = ?, department = ?, year_of_study = ?, total_classes = ?, classes_attended = ? WHERE student_id = ?';
    db.query(query, [name, email, course, department, year_of_study, total_classes, classes_attended, req.params.student_id], (err, result) => {
        if (err) {
            console.error('Error updating student:', err);
            return res.status(500).json({ error: 'Failed to update student' });
        }
        res.json({ message: 'Student updated successfully' });
    });
});

// Delete a student
router.delete('/:student_id', (req, res) => {
    const query = 'DELETE FROM students WHERE student_id = ?';
    db.query(query, [req.params.student_id], (err, result) => {
        if (err) {
            console.error('Error deleting student:', err);
            return res.status(500).json({ error: 'Failed to delete student' });
        }
        res.json({ message: 'Student deleted successfully' });
    });
});

router.get('/stats/department-wise', (req, res) => {
    const query = `
        SELECT department, COUNT(*) AS student_count
        FROM students
        GROUP BY department
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching department-wise stats:', err);
            return res.status(500).json({ error: 'Failed to fetch department-wise stats' });
        }
        res.json(results); // Send aggregated results
    });
});

module.exports = router;
