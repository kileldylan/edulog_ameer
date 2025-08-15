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

// Get dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [student, stats, sessions] = await Promise.all([
      dbOperation(Student.getById, studentId),
      dbOperation(Student.getAttendanceStats, studentId),
      dbOperation(Student.getAvailableSessions, studentId)
    ]);

    if (!student) {
      return res.status(404).json({ 
        success: false,
        error: 'Student not found' 
      });
    }

    res.json({
      success: true,
      data: {
        student,
        stats: stats[0] || {
          total_sessions: 0,
          present_count: 0,
          absent_count: 0,
          late_count: 0,
          attendance_percentage: 0,
          current_streak: 0,
          attendance_trend: 0
        },
        upcomingSessions: sessions.slice(0, 3)
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

// Get attendance history
exports.getAttendanceHistory = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const history = await dbOperation(
      Student.getAttendanceHistory, 
      studentId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Attendance History Error:', error);
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