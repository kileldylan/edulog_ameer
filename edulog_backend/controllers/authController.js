const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login handler
exports.login = async (req, res) => {
    const { username, password } = req.body;

    console.log("Login attempt:", { username, password }); // Log incoming login attempt

    User.findByUsername(username, (err, results) => {
        if (err) {
            console.error("Database error during user lookup:", err);
            return res.status(500).json({ message: 'Server error' });
        }
        
        if (results.length === 0) {
            console.log("User not found:", username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        console.log("User found:", user);

        // Compare password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error("Error during password comparison:", err);
                return res.status(500).json({ message: 'Server error' });
            }
            
            if (!isMatch) {
                console.log("Password mismatch for user:", username);
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Password matches; generate JWT token
            console.log("Password match successful for user:", username);
            const token = jwt.sign({ id: user.student_id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

            // Send the response with token, role, and student_id
            res.json({
                token,
                role: user.role,
                student_id: user.student_id // Add student_id here
            });
        });
    });
};

// Register handler
exports.register = async (req, res) => {
    const { student_id, username, email, role, password } = req.body;

    // Log received data for debugging
    console.log('Registration attempt:', { student_id, username, email, role });

    // Basic validation
    if (!username || !email || !role || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if username already exists
        User.findByUsername(username, (err, results) => {
            if (err) {
                console.error('Database error during username lookup:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            if (results.length > 0) {
                console.log("Username already taken:", username);
                return res.status(409).json({ message: 'Username already exists.' });
            }

            // Create user in the database
            User.createUser(student_id, username, email, role, hashedPassword, (err) => {
                if (err) {
                    console.error('Database error during user creation:', err); // Log the error
                    return res.status(500).json({ message: 'Server error' });
                }
                console.log('User created successfully'); // Log success
                res.status(201).json({ message: 'User created successfully', success: true });
            });
        });
    } catch (err) {
        console.error('Error hashing password:', err); // Log any hashing errors
        res.status(500).json({ message: 'Server error' });
    }
};
