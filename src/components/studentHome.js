import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Switch,
  Divider,
  Snackbar,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from 'axios';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

const DashboardContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2rem',
  backgroundColor: '#f4f6f8',
  minHeight: '100vh',
});


const SwipeButton = styled(Switch)(({ theme }) => ({
  width: '60px',
  height: '34px',
  padding: '0',
  '& .MuiSwitch-switchBase': {
    padding: '6px',
    '&.Mui-checked': {
      transform: 'translateX(26px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.success.main,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    width: '22px',
    height: '22px',
  },
  '& .MuiSwitch-track': {
    borderRadius: 10,
    backgroundColor: theme.palette.error.main,
  },
}));

const OverviewCard = ({ title, count, icon, color }) => (
  <Card sx={{ minWidth: 250, m: 1, backgroundColor: color, color: 'white' }}>
    <CardContent>
      <Grid container spacing={2} alignItems="center">
        <Grid item>{icon}</Grid>
        <Grid item>
          <Typography variant="h5" fontWeight="bold">
            {count}
          </Typography>
          <Typography variant="subtitle1">{title}</Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const StudentHome = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [swipeDrawer, setSwipeDrawer] = useState(false);
  //const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [studentName, setStudentName] = useState('');
  const navigate = useNavigate();
  const [attendanceStats, setAttendanceStats] = useState({
    present: 15,
    absent: 2,
    late: 1,
  });
  const [snackbar, setSnackbar] = useState({
    message: '',
    severity: 'success',
    open: false,
  });

  // Function to fetch dynamic data for the cards and records
  const fetchAttendanceData = async (student_id) => {
    try {
      const statsResponse = await axios.get(`http://localhost:5000/api/attendance/${student_id}`);
      setAttendanceStats(statsResponse.data);

    } catch (error) {
      setSnackbar({
        message: 'Failed to fetch attendance data',
        severity: 'error',
        open: true,
      });
    }
  };

  // Fetch department-wise stats for the chart
  const fetchDepartmentStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students/stats/department-wise');
      setDepartmentStats(response.data);
    } catch (error) {
      console.error('Failed to fetch department stats', error);
    }
  };

  const fetchStudentName = async (student_id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/students/${student_id}`);
      setStudentName(response.data.name);
    } catch (error) {
      console.error('Failed to fetch student name', error);
    }
  };
// useEffect to handle fetching of student_id and attendance stats
useEffect(() => {
    const student_id = localStorage.getItem('student_id'); // Retrieve student_id from localStorage
    console.log("Retrieved student_id:", student_id); // Log to check value
    if (student_id) {
        fetchAttendanceData(student_id); // Call fetchAttendanceStats with student_id
        fetchDepartmentStats();
        fetchStudentName(student_id);
    } else {
        setSnackbar({
            message: 'Error fetching student ID',
            severity: 'error',
            open: true,
        });
        console.error("Student ID not found in localStorage.");
    }
}, []); // Empty dependency array to run on initial render




const handleClockInOut = async () => {
    const student_id = localStorage.getItem('student_id');
    const status = isClockedIn ? 'Absent' : 'Present'; // Set the correct status here
    console.log("Retrieved student_id from localStorage:", student_id, status);
    if (!student_id) {
        setSnackbar({
            message: 'Student ID is missing',
            severity: 'error',
            open: true,
        });
        console.error("No student ID found in local storage.");
        return;
    }

    const today = new Date().toISOString().split('T')[0]; // Ensure the date is in the correct format (YYYY-MM-DD)
    
    if (!today) {
        setSnackbar({
            message: 'Unable to fetch current date',
            severity: 'error',
            open: true,
        });
        console.error("No valid date found.");
        return; // Exit if the date is invalid
    }

    const apiUrl = isClockedIn
        ? 'http://localhost:5000/api/attendance/clock-out'
        : 'http://localhost:5000/api/attendance/clock-in';

    console.log("Attempting clock-in/out with student_id:", student_id, "on date:", today, "using API:", apiUrl);

    try {
        const status = isClockedIn ? 'clocked-out' : 'clocked-in';
        const response = await axios.post(apiUrl, { student_id, status});
        console.log("Clock-in/out response:", response);

        if (response.status === 200 || response.status === 201) {
            setSnackbar({
                message: isClockedIn ? 'Clocked out successfully' : 'Clocked in successfully',
                severity: 'success',
                open: true,
            });
            setIsClockedIn(!isClockedIn);
            localStorage.setItem('isClockedIn', JSON.stringify(!isClockedIn)); // Save clock-in status
            fetchAttendanceData(student_id); // Refresh attendance data// Ensure student_id is passed correctly here
        } else {
            throw new Error('Unexpected response from server');
        }
        
    } catch (error) {
        console.error("Error during clock-in/out:", error);
        setSnackbar({
            message: error.response?.data?.message || 'Error updating attendance status',
            severity: 'error',
            open: true,
        });
    }
};

  return (
    <DashboardContainer>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Student Portal
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/studentProfile')}>
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Paper elevation={3} sx={{ p: 3, width: '100%', maxWidth: 1200 }}>
      <Typography variant="h6" mb={2}>
          Welcome, {studentName}
        </Typography>
        <Typography variant="h6" mb={2}>
          Overview
        </Typography>
        <Grid container justifyContent="space-between">
  {attendanceStats ? (
    <>
      <OverviewCard
        title="Days Present"
        count={attendanceStats.present || 0}
        icon={<CheckCircleOutlineIcon fontSize="large" />}
        color="#66bb6a"
      />
      <OverviewCard
        title="Days Absent"
        count={attendanceStats.absent || 0}
        icon={<CancelOutlinedIcon fontSize="large" />}
        color="#ef5350"
      />
      <OverviewCard
        title="Days Late"
        count={attendanceStats.late || 0}
        icon={<CheckCircleOutlineIcon fontSize="large" />}
        color="#ffca28"
      />
      </>
      ) : (
        <Typography variant="body1">Loading attendance data...</Typography>
      )}
      </Grid>


        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" mb={2}>
          Attendance Insights
        </Typography>
        <Box display="flex" justifyContent="center">
          <SwipeButton checked={isClockedIn} onChange={handleClockInOut} />
          <Typography variant="subtitle1" sx={{ ml: 1 }}>
            {isClockedIn ? 'Clocked In' : 'Clocked Out'}
          </Typography>
        </Box>

        <SwipeableDrawer
          anchor="bottom"
          open={swipeDrawer}
          onClose={() => setSwipeDrawer(false)}
          onOpen={() => setSwipeDrawer(true)}
        >
          <Box p={2} textAlign="center">
            <Typography variant="h6">
              Swipe to {isClockedIn ? 'Clock Out' : 'Clock In'}
            </Typography>
            <SwipeButton
              checked={isClockedIn}
              onChange={() => {
                handleClockInOut();
                setSwipeDrawer(false);
              }}
            />
          </Box>
        </SwipeableDrawer>
      </Paper>

      {/* Department-wise Stats (Chart) */}
      <Typography variant="h6" mb={2}>Department-wise Attendance Stats</Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <Bar
            data={{
              labels: departmentStats.map((stat) => stat.department),
              datasets: [
                {
                  label: 'Student Count',
                  data: departmentStats.map((stat) => stat.student_count),
                  backgroundColor: '#3f51b5',
                },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </DashboardContainer>
  );
};

export default StudentHome;
