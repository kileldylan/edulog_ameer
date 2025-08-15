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
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { course_id } = req.body;
  const studentId = req.user.id;

  try {
    // 1. Verify student exists
    const student = await promisify(Student.getById, studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // 2. Verify course exists
    const course = await promisify(Course.getById, course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // 3. Check existing enrollment
    const [isEnrolled] = await promisify(
      StudentCourse.isEnrolled,
      studentId,
      course_id
    );

    if (isEnrolled) {
      return res.status(409).json({
        success: false,
        error: 'Already enrolled in this course'
      });
    }

    // 4. Create enrollment
    await promisify(StudentCourse.enrollStudent, studentId, course_id);

    return res.json({
      success: true,
      message: 'Successfully enrolled in course'
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        error: 'Invalid student or course reference'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to process enrollment'
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
    const result = await promisify(
      StudentCourse.updateEnrollmentStatus,
      req.user.id,
      req.params.course_id,
      'dropped'
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        error: 'Course not found or already dropped'
      });
    }

    return res.json({ 
      success: true, 
      message: 'Course dropped successfully' 
    });
  } catch (error) {
    console.error('Drop Course Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to drop course'
    });
  }
};