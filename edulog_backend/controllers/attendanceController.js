const Attendance = require('../models/attendanceModel');

// Clock In logic
// Clock In logic
exports.clockIn = (req, res) => {
  const { student_id } = req.body; // Removed 'status' from body

  if (!student_id) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  // Call the model to insert the clock-in record
  Attendance.clockIn(student_id, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error clocking in' });
    }
    res.status(201).json({ message: 'Clock-in successful', results });
  });
};


// Clock Out logic
exports.clockOut = (req, res) => {
  const { student_id } = req.body;

  if (!student_id) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  // Call the model to update the clock-out time
  Attendance.clockOut(student_id, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error clocking out' });
    }
    res.status(200).json({ message: 'Clock-out successful', data: results });
  });
};

// Get attendance data by student ID
exports.getAttendance = (req, res) => {
  const { student_id } = req.params;

  if (!student_id) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  Attendance.getAttendanceByStudentId(student_id, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching attendance data' });
    }
    console.log(results);
    res.status(200).json({ data: results });
  });
};

// Get all attendance records
    // Controller method with hardcoded data for testing
exports.getAllRecords = (req, res) => {
  console.log("Testing with hardcoded attendance records.");

  // Hardcoded attendance records data
  const hardcodedData = [
    {
      attendance_id: 1,
      student_id: 1001,
      date: "2024-11-06",
      status: "Present",
      clockInTime: "08:00:00",
      clockOutTime: "16:00:00",
    },
    {
      attendance_id: 2,
      student_id: 1002,
      date: "2024-11-05",
      status: "Absent",
      clockInTime: null,
      clockOutTime: null,
    },
    {
      attendance_id: 3,
      student_id: 1003,
      date: "2024-11-04",
      status: "Present",
      clockInTime: "09:00:00",
      clockOutTime: "17:00:00",
    }
  ];

  // Sending hardcoded data as the response
  res.status(200).json({ data: hardcodedData });
};



  

// Get attendance stats (present/absent counts)
exports.getAttendanceStats = (req, res) => {
  Attendance.getAttendanceStats((err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching attendance stats' });
    }
    res.status(200).json(results);
  });
};
