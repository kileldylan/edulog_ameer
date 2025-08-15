const StudentCourse = require('../models/studentCourseModel');
const Student = require('../models/studentModel');
const Course = require('../models/courseModel');
const { validationResult } = require('express-validator');

// Helper function for promise-based operations
const dbOperation = (operation, ...args) => {
  return new Promise((resolve, reject) => {
    operation(...args, (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.enrollInCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { course_id } = req.body;
    const studentId = req.user.id;

    // First check if student exists
    const studentExists = await dbOperation(Student.getById, studentId);
    if (!studentExists) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Then check if course exists
    const courseExists = await dbOperation(Course.getById, course_id);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Then proceed with enrollment
    await dbOperation(StudentCourse.enrollStudent, studentId, course_id);
    
    res.json({ 
      success: true,
      message: 'Successfully enrolled in course'
    });

  } catch (error) {
    console.error('Enrollment Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message.includes('foreign key constraint') 
        ? 'Invalid student or course reference' 
        : 'Failed to enroll in course',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getStudentCourses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const courses = await dbOperation(StudentCourse.getStudentCourses, studentId);
    
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch enrolled courses'
    });
  }
};

exports.getAvailableCourses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const courses = await dbOperation(StudentCourse.getAvailableCourses, studentId);
    
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch available courses'
    });
  }
};

exports.dropCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const studentId = req.user.id;

    const result = await dbOperation(
      StudentCourse.updateEnrollmentStatus, 
      studentId, 
      course_id, 
      'dropped'
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found or already dropped'
      });
    }

    res.json({
      success: true,
      message: 'Successfully dropped course'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to drop course'
    });
  }
};