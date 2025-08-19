const Teacher = require('../models/teacherModel');
const Course = require('../models/courseModel');
const Session = require('../models/sessionModel');
const { validationResult } = require('express-validator');
const Admin = require('../models/adminModel');


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

exports.getAllStudents = async (req, res) => {
  try {
    const students = await promisify(Admin.getAllStudents);
    
    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
exports.getDashboard = async (req, res) => {
  try {
    const dashboardData = await new Promise((resolve, reject) => {
      Admin.getDashboardStats((err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents: dashboardData.totalStudents,
          attendanceToday: dashboardData.attendanceToday,
          absentStudents: dashboardData.absentStudents
        },
        departmentStats: dashboardData.departmentStats,
        recentLogs: dashboardData.recentLogs.map(log => ({
          name: log.name,
          status: log.status,
          date: log.session_date,
          course: log.course_name
        }))
      }
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Teacher Controllers
exports.getAllTeachers = async (req, res) => {
  try {
    Teacher.getAll((err, teachers) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(teachers);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    Teacher.getById(req.params.teacher_id, (err, teacher) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
      res.json(teacher);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTeacher = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    Teacher.create(req.body, (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Teacher created successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTeacher = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    Teacher.update(req.params.teacher_id, req.body, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Teacher updated successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    Teacher.delete(req.params.teacher_id, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Teacher deleted successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Course Controllers
exports.getAllCourses = async (req, res) => {
  try {
    Course.getAll((err, courses) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(courses);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    Course.getById(req.params.course_id, (err, course) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!course) return res.status(404).json({ error: 'Course not found' });
      res.json(course);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    Course.create(req.body, (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Course code already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Course created successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    Course.update(req.params.course_id, req.body, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Course updated successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    Course.delete(req.params.course_id, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Course deleted successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Session Controllers
exports.getAllSessions = async (req, res) => {
  try {
    Session.getAll((err, sessions) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(sessions);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    Session.getById(req.params.session_id, (err, session) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!session || session.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json(session[0]);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSession = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    Session.create(req.body, (err, session) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ 
        message: 'Session created successfully',
        session 
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSession = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    Session.update(req.params.session_id, req.body, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Session updated successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    Session.delete(req.params.session_id, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Session deleted successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const profile = await Admin.getProfile(adminId);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load profile'
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { email, password } = req.body;

    // Validate email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Validate password if provided
    if (password && password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }

    await Admin.updateProfile(adminId, { email, password });
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update Error:', error);
    
    if (error.message.includes('Duplicate entry')) {
      return res.status(400).json({
        success: false,
        error: 'Email already in use'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update profile'
    });
  }
};