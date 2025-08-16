const StudentCourse = require('../models/studentCourseModel');
const Student = require('../models/studentModel');
const Course = require('../models/courseModel');
const { validationResult } = require('express-validator');

// Universal promisify function
const promisify = (method, ...args) => {
  return new Promise((resolve, reject) => {
    method(...args, (err, result) => {
      if (err) {
        console.error('Database Error:', {
          method: method.name || 'anonymous',
          error: err.message,
          stack: err.stack
        });
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.enrollInCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    // 1. Get student via user_id
    const student = await promisify(Student.getById, req.user.id);
    if (!student) {
      return res.status(404).json({ 
        success: false,
        error: 'Student profile not found' 
      });
    }

    // 2. Verify course exists
    const course = await promisify(Course.getById, req.body.course_id);
    if (!course) {
      return res.status(404).json({ 
        success: false,
        error: 'Course not found' 
      });
    }

    // 3. Check existing enrollment
    const [enrollment] = await promisify(
      StudentCourse.isEnrolled, 
      student.student_id, 
      req.body.course_id
    );

    if (enrollment) {
      return res.status(409).json({ 
        success: false,
        error: 'Already enrolled in this course' 
      });
    }

    // 4. Create enrollment
    await promisify(
      StudentCourse.enrollStudent, 
      student.student_id,  // Use student_id from students table
      req.body.course_id
    );

    return res.json({ 
      success: true,
      message: 'Enrollment successful',
      studentId: student.student_id  // Return for debugging
    });

  } catch (error) {
    console.error('Enrollment Error:', error);
    return res.status(500).json({ 
      success: false,
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Enrollment failed'
    });
  }
};

exports.getStudentCourses = async (req, res) => {
  try {
    const courses = await promisify(
      StudentCourse.getStudentCourses, 
      req.user.id
    );
    return res.json({ 
      success: true, 
      data: courses 
    });
  } catch (error) {
    console.error('Get Student Courses Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch enrolled courses'
    });
  }
};

exports.getAvailableCourses = async (req, res) => {
  try {
    const courses = await promisify(
      StudentCourse.getAvailableCourses, 
      req.user.id
    );
    return res.json({ 
      success: true, 
      data: courses 
    });
  } catch (error) {
    console.error('Get Available Courses Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch available courses'
    });
  }
};

exports.dropCourse = async (req, res) => {
  try {
    // 1. Get student via user_id
    const student = await promisify(Student.getById, req.user.id);
    if (!student) {
      return res.status(404).json({ 
        success: false,
        error: 'Student profile not found' 
      });
    }

    // 2. Verify enrollment exists
    const [enrollment] = await promisify(
      StudentCourse.isEnrolled,
      student.student_id,
      req.params.course_id
    );

    if (!enrollment) {
      return res.status(404).json({ 
        success: false,
        error: 'Enrollment record not found' 
      });
    }

    // 3. Update status
    const result = await promisify(
      StudentCourse.updateEnrollmentStatus,
      student.student_id,
      req.params.course_id,
      'dropped'
    );

    return res.json({ 
      success: true,
      message: 'Course dropped successfully',
      affectedRows: result.affectedRows  // For debugging
    });

  } catch (error) {
    console.error('Drop Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to drop course'
    });
  }
};