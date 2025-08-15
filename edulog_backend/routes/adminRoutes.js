// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

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

module.exports = router;