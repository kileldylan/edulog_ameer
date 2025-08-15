// server.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const studentsRoutes = require('./routes/studentsRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const profileRoutes = require('./routes/profileRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());
// Routes
app.use('/api', authRoutes);
app.use('/api/student', studentsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/profileRoutes', profileRoutes);
app.use('/api/reportRoutes', reportRoutes);
app.use('/api/admin', adminRoutes);


// Start Server
try {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
} catch (error) {
    console.error('Error starting server:', error);
}
