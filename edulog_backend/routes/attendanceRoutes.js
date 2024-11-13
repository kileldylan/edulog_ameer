const express = require('express');
const router = express.Router();
const db = require('../config/db');  // Adjust the path based on your file structure
const attendanceController = require('../controllers/attendanceController');

// Route to clock in
router.post('/clock-in', attendanceController.clockIn);

// Route to clock out
router.post('/clock-out', attendanceController.clockOut);

// Route to get attendance by student ID
router.get('/:student_id', attendanceController.getAttendance);

// Fetch all attendance records
router.get('/', (req, res) => {
    const query = 'SELECT * FROM attendance';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching attendance records:', err);
            return res.status(500).json({ error: 'Failed to fetch attendance records' });
        }
        res.json(results);
    });
});

// Get a specific attendance record by attendance_id
router.get('/:attendance_id', (req, res) => {
    const query = 'SELECT * FROM attendance WHERE attendance_id = ?';
    db.query(query, [req.params.attendance_id], (err, results) => {
        if (err) {
            console.error('Error fetching attendance record:', err);
            return res.status(500).json({ error: 'Failed to fetch attendance record' });
        }
        res.json(results[0]);
    });
});

// Add a new attendance record
router.post('/', (req, res) => {
    const { student_id, date, status, clockInTime, clockOutTime } = req.body;
    const query = 'INSERT INTO attendance (student_id, date, status, clockInTime, clockOutTime) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [student_id, date, status, clockInTime, clockOutTime], (err, result) => {
        if (err) {
            console.error('Error adding attendance record:', err);
            return res.status(500).json({ error: 'Failed to add attendance record' });
        }
        res.status(201).json({ id: result.insertId, ...req.body });
    });
});

// Update an attendance record
router.put('/:attendance_id', (req, res) => {
    const { student_id, date, status, clockInTime, clockOutTime } = req.body;
    const query = 'UPDATE attendance SET student_id = ?, date = ?, status = ?, clockInTime = ?, clockOutTime = ? WHERE attendance_id = ?';
    db.query(query, [student_id, date, status, clockInTime, clockOutTime, req.params.attendance_id], (err, result) => {
        if (err) {
            console.error('Error updating attendance record:', err);
            return res.status(500).json({ error: 'Failed to update attendance record' });
        }
        res.json({ message: 'Attendance record updated successfully' });
    });
});

// Delete an attendance record
router.delete('/:attendance_id', (req, res) => {
    const query = 'DELETE FROM attendance WHERE attendance_id = ?';
    db.query(query, [req.params.attendance_id], (err, result) => {
        if (err) {
            console.error('Error deleting attendance record:', err);
            return res.status(500).json({ error: 'Failed to delete attendance record' });
        }
        res.json({ message: 'Attendance record deleted successfully' });
    });
});

// Fetch total number of students
router.get('/stats/total-students', (req, res) => {
    const query = 'SELECT COUNT(*) AS total FROM students'; // Adjust the table and field as per your DB schema
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching total number of students:', err);
            return res.status(500).json({ error: 'Failed to fetch total students' });
        }
        res.json({ total: results[0].total });
    });
});

// Fetch attendance percentage for today
router.get('/stats/attendance-today', (req, res) => {
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const queryTotal = 'SELECT COUNT(*) AS total FROM students'; // Get total number of students
    const queryPresent = 'SELECT COUNT(*) AS present FROM attendance WHERE date = ? AND status = "Present"';

    db.query(queryTotal, (err, totalResults) => {
        if (err) {
            console.error('Error fetching total students:', err);
            return res.status(500).json({ error: 'Failed to fetch total students' });
        }

        db.query(queryPresent, [today], (err, presentResults) => {
            if (err) {
                console.error('Error fetching present students:', err);
                return res.status(500).json({ error: 'Failed to fetch present students' });
            }

            const totalStudents = totalResults[0].total;
            const presentStudents = presentResults[0].present;
            const attendancePercentage = totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0;

            res.json({ attendancePercentage: attendancePercentage.toFixed(2) });
        });
    });
});

// Fetch number of absent students today
router.get('/stats/absent-students', (req, res) => {
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const query = 'SELECT COUNT(*) AS absent FROM attendance WHERE date = ? AND status = "Absent"';

    db.query(query, [today], (err, results) => {
        if (err) {
            console.error('Error fetching absent students:', err);
            return res.status(500).json({ error: 'Failed to fetch absent students' });
        }
        res.json({ absentCount: results[0].absent });
    });
});

// Backend
router.get('/percentage', async (req, res) => {
    try {
        const query = `
            SELECT student_id, name, attendance_percentage
            FROM students
        `;
        const [results] = await db.query(query);
        res.json(results); // This should return an array
    } catch (error) {
        console.error('Error fetching attendance percentages:', error);
        res.status(500).json({ message: 'Failed to fetch attendance data' });
    }
});

module.exports = router;
