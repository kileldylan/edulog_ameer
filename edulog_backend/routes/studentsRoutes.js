const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const studentCourseController = require('../controllers/studentCourseController')
const { verifyToken, verifyStudent } = require('../middleware/authMiddleware');
const { check } = require('express-validator');

router.get('/courses/all', studentCourseController.getAllCoursesPublic);

// All routes now protected
router.use(verifyToken);
router.use(verifyStudent);

// Dashboard - no need for student_id in URL
router.get('/dashboard', studentController.getDashboard);

// Sessions
router.get('/sessions', studentController.getAvailableSessions);
router.get('/sessions/:students', studentController.getStudentSessions);
router.post('/sessions/:session_id/clock-in', studentController.clockInToSession);

// Attendance
router.get('/attendance', studentController.getAttendanceHistory);
router.get('/courses/enrolled', studentCourseController.getStudentCourses);

// Get available courses (not enrolled)
router.get('/courses/available', studentCourseController.getAvailableCourses);
router.get('/sessions/course/:course_id', studentController.getStudentSessionsByCourse);
// Enroll in course
router.post('/courses/enroll', [
  check('course_id').isInt().withMessage('Valid course ID required')
], studentCourseController.enrollInCourse);

// Drop course
router.delete('/courses/drop/:course_id', studentCourseController.dropCourse);

// Profile
router.put('/profile', [
  check('email').isEmail().withMessage('Valid email required'),
  check('phone').isMobilePhone().withMessage('Valid phone number required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], studentController.updateProfile);

module.exports = router;