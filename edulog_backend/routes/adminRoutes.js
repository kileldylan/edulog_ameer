// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Teacher routes
router.get('/teachers', adminController.getAllTeachers);
router.post('/teachers', adminController.createTeacher);
router.put('/teachers/:teacher_id', adminController.updateTeacher);
router.delete('/teachers/:teacher_id', adminController.deleteTeacher);

// Course routes
router.get('/courses', adminController.getAllCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:course_id', adminController.updateCourse);
router.delete('/courses/:course_id', adminController.deleteCourse);

// Session routes
router.get('/sessions', adminController.getAllSessions);
router.post('/sessions', adminController.createSession);
router.put('/sessions/:session_id', adminController.updateSession);
router.delete('/sessions/:session_id', adminController.deleteSession);

router.use(verifyToken);
router.use(verifyAdmin);
router.get('/dashboard', adminController.getDashboard);
router.get('/profile', adminController.getProfile);
router.put('/profile', adminController.updateProfile);
router.get('/all-students', adminController.getAllStudents);
router.post('/create', adminController.createStudent);
router.put('/update/:student_id', adminController.updateStudent);
router.delete('/delete/:student_id', adminController.deleteStudent);

module.exports = router;