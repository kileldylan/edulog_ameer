const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
// Login handler
// Login handler - updated to handle the array response
exports.login = async (req, res) => {
  const { username, password } = req.body;

  console.log("Login attempt:", { username, password });

  try {
    // Using promisify instead of callback
    const results = await promisify(User.findByUsername, username);
    
    if (!results || results.length === 0) {
      console.log("User not found:", username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    console.log("User found:", user);

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log("Password match successful for user:", username);

    // Create JWT token
    const token = jwt.sign(
      { id: user.student_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      role: user.role,
      student_id: user.student_id
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register handler
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, role, password, name, department, course_id, year_of_study } = req.body;

  try {
    // 1. Validate required fields
    if (!username || !email || !role || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (role === 'student' && (!name || !department || !course_id)) {
      return res.status(400).json({ message: 'Student information required.' });
    }

    // 2. Check if username exists (updated destructuring)
    const userExists = await promisify(User.findByUsername, username);
    if (userExists) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let studentId = null;
    
    // 4. Handle student registration
    if (role === 'student') {
      const studentResult = await promisify(User.createStudentRecord, {
        name,
        email,
        department,
        course_id,
        year_of_study: year_of_study || 1
      });
      studentId = studentResult.insertId;
    }

    // 5. Create user account
    await promisify(User.createUser, {
      username,
      email,
      role,
      password: hashedPassword,
      student_id: studentId
    });

    res.status(201).json({ 
      success: true,
      message: 'Registration successful'
    });

  } catch (err) {
    console.error('Registration error:', err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        message: err.sqlMessage.includes('email') 
          ? 'Email already exists' 
          : 'Username already exists'
      });
    }
    
    res.status(500).json({ 
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};