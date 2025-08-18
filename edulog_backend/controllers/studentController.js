const Student = require('../models/studentModel');
const { validationResult } = require('express-validator');

// Helper function for promise-based database operations
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
    const students = await promisify(Student.getAllStudents);
    
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
// Get dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get all data in parallel
    const [student, stats, sessions] = await Promise.all([
      promisify(Student.getById, studentId),
      promisify(Student.getAttendanceStats, studentId),
      promisify(Student.getSessionsByStudent, studentId)
    ]);

    if (!student) {
      return res.status(404).json({ 
        success: false,
        error: 'Student not found' 
      });
    }

    // Calculate additional stats
    const attendancePercentage = stats[0]?.total_sessions > 0 
      ? Math.round((stats[0].present_count / stats[0].total_sessions) * 100)
      : 0;

    // Format response
    res.json({
      success: true,
      data: {
        student: {
          id: student.student_id,
          name: student.name,
          email: student.email,
          department: student.department,
          year_of_study: student.year_of_study
        },
        stats: {
          ...stats[0],
          attendance_percentage: attendancePercentage,
          current_streak: 0, // You'll need to implement this
          attendance_trend: 0 // You'll need to implement this
        },
        upcomingSessions: sessions.slice(0, 3).map(session => ({
          ...session,
          attended: session.attendance_status === 'Present'
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to load dashboard data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getStudentSessions = async (req, res) => {
  try {
    const sessions = await promisify(Student.getAvailableSessions, req.user.id);
    
    // Format the sessions data for the frontend
    const formattedSessions = sessions.map(session => ({
      ...session,
      attended: session.attendance_status === 'Present',
      teacher_name: session.teacher_name || 'Not Assigned'
    }));

    res.json({
      success: true,
      data: formattedSessions
    });
  } catch (error) {
    console.error('Sessions Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch available sessions',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getStudentSessionsByCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const student_id = req.user.id; // From authenticated user
    
    const sessions = await new Promise((resolve, reject) => {
      Student.getByCourseForStudent(course_id, student_id, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    // Format sessions for frontend
    const formattedSessions = sessions.map(session => ({
      ...session,
      attended: session.attendance_status === 'Present',
      teacher_name: session.teacher_name || 'Not Assigned'
    }));

    res.json({
      success: true,
      data: formattedSessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student sessions',
      details: error.message
    });
  }
};

// Get available sessions
exports.getAvailableSessions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const sessions = await dbOperation(Student.getAvailableSessions, studentId);
    
    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Sessions Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch available sessions',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

//attendance history
exports.getAttendanceHistory = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    console.log(`Fetching attendance for student ${studentId}, page ${page}`); // Debug log

    const history = await dbOperation(
      Student.getAttendanceHistory, 
      studentId,
      parseInt(page),
      parseInt(limit)
    );

    console.log(`Found ${history.length} attendance records`); // Debug log

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Attendance History Error Details:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch attendance history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Clock in to session
exports.clockInToSession = async (req, res) => {
  try {
    const { session_id } = req.params;
    const studentId = req.user.id;

    if (!session_id) {
      return res.status(400).json({ 
        success: false,
        error: 'session_id is required' 
      });
    }

    const result = await dbOperation(Student.clockIn, studentId, session_id);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or already attended'
      });
    }

    res.json({ 
      success: true,
      message: 'Attendance marked successfully',
      data: {
        sessionId: session_id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Clock In Error:', error);
    
    if (error.message.includes('already attended')) {
      return res.status(409).json({
        success: false,
        error: 'You have already attended this session'
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Failed to mark attendance',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const studentId = req.user.id;
    const updateData = req.body;

    // Prevent updating certain fields
    delete updateData.id;
    delete updateData.role;
    delete updateData.student_id;

    const result = await dbOperation(Student.updateProfile, studentId, updateData);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Get updated student data
    const updatedStudent = await dbOperation(Student.getById, studentId);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Email or phone number already in use'
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Failed to update profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await dbOperation(Student.getById, studentId);

    if (!student) {
      return res.status(404).json({ 
        success: false,
        error: 'Student not found' 
      });
    }

    // Remove sensitive data
    const { password, reset_token, ...profileData } = student;

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};