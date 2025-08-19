const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ 
      success: false,
      error: 'Authorization token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        error: 'Invalid or expired token'
      });
    }
    
    // Standardized user object
    req.user = {
      id: decoded.id,
      student_id: decoded.student_id || decoded.id, // Handle both cases
      teacher_id: decoded.teacher_id || null, // For teachers
      admin_id: decoded.admin_id || null, // For admins
      role: decoded.role
    };
    
    next();
  });
};

const verifyStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      success: false,
      error: 'Student access required'
    });
  }
  next();
};

const verifyTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ 
      success: false,
      error: 'Teacher access required'
    });
  }
  next();
};

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

module.exports = {
  verifyToken,
  verifyStudent,
  verifyTeacher,
  verifyAdmin
};