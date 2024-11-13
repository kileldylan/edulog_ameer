import React, { useState, useEffect } from 'react';
import {
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
  Container,
  Grid,
  Paper,
  Button
} from '@mui/material';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import AppBarComponent from './CustomAppBar';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend
);

const AdminHome = ({ onLogout }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [attendanceToday, setAttendanceToday] = useState(0);
  const [absentStudents, setAbsentStudents] = useState(0);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    const fetchData = async () => {
      try {
        const totalStudentsResponse = await axios.get(`http://localhost:5000/api/attendance/stats/total-students`);
        const attendanceTodayResponse = await axios.get(`http://localhost:5000/api/attendance/stats/attendance-today`);
        const absentStudentsResponse = await axios.get(`http://localhost:5000/api/attendance/stats/absent-students`);
        const departmentStatsResponse = await axios.get(`http://localhost:5000/api/students/stats/department-wise`);
        const attendancePercentageResponse = await axios.get(`http://localhost:5000/api/attendance/percentage`);

        setTotalStudents(totalStudentsResponse.data.total);
        setAttendanceToday(attendanceTodayResponse.data.attendancePercentage);
        setAbsentStudents(absentStudentsResponse.data.absentCount);
        setDepartmentStats(departmentStatsResponse.data);
        setAttendanceData(Array.isArray(attendancePercentageResponse.data) ? attendancePercentageResponse.data : []);  // Ensure data is an array
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const getDepartmentChartData = () => {
    const labels = departmentStats.map(stat => stat.department);
    const data = departmentStats.map(stat => stat.student_count);

    return {
      labels,
      datasets: [
        {
          label: 'Students per Department',
          data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
          hoverOffset: 4,
        },
      ],
    };
  };

  // New function to get attendance percentage chart data
  const getAttendancePercentageChartData = () => {
    // Check if attendanceData is an array and contains valid data
    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Attendance Percentage',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };
    }

    const labels = attendanceData.map(record => record.name); // Or record.student_id
    const data = attendanceData.map(record => record.attendance_percentage);

    return {
      labels,
      datasets: [
        {
          label: 'Attendance Percentage',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const handleNavigation = (path) => {
    setDrawerOpen(false);
    navigate(path);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleAttendanceManagement = () => {
    navigate('/attendance'); // Redirect to login page
  };

  const handleGenerateReports = () => {
    navigate('/reports');
  };

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <AppBarComponent toggleDrawer={toggleDrawer} />
        <CssBaseline />
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <List>
            <ListItem button onClick={() => handleNavigation('/adminHome')}>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation('/attendance')}>
              <ListItemText primary="Attendance Records" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation('/studentsManagement')}>
              <ListItemText primary="Students" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation('/reports')}>
              <ListItemText primary="Reports" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation('/calendarPage')}>
              <ListItemText primary="Calendar" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation('/')}>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Drawer>

        <Container style={{ marginTop: '80px' }}>
          <Typography variant="h4" gutterBottom>
            Welcome, {username}!
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
                <Typography variant="h6">Total Students</Typography>
                <Typography variant="h4">{totalStudents}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
                <Typography variant="h6">Total Attendance Today</Typography>
                <Typography variant="h4">{attendanceToday}%</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
                <Typography variant="h6">Absent Students Today</Typography>
                <Typography variant="h4">{absentStudents}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              style={{
                padding: '20px',
                height: '650px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6">Department-wise Attendance</Typography>
              <div style={{ width: '100%', height: '100%' , flex: 1 }}>
                <Pie data={getDepartmentChartData()} options={{ responsive: true }} />
              </div>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              style={{
                padding: '20px',
                height: '650px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6">Attendance Percentage by Student</Typography>
              <div style={{ width: '100%', height: '100%' , flex: 1 }}>
                <Bar data={getAttendancePercentageChartData()} options={{ responsive: true }} />
              </div>
            </Paper>
          </Grid>

            {/* Detailed Records and Logs */}
          <Grid item xs={12} md={6}> 
          <Paper elevation={3} style={{ padding: '20px' , height: '200px' }}>
            <Typography variant="h6">Recent Attendance Logs</Typography>
            <List>
              <ListItem>
                <ListItemText primary="John Doe - Present" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Jane Smith - Absent" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Tom Brown - Present" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}> 
          <Paper elevation={3} style={{ padding: '20px' , height: '200px' }}>
            <Typography variant="h6">Manage Students and Attendance by Course</Typography>
            <Typography variant="body1">
              Access detailed records of each student and manage attendance on a course-by-course basis.
            </Typography>
            <Button
            onClick={handleAttendanceManagement}
            variant="contained"
            color="primary"
            style={{ marginTop: '10px' }}
          >
            Manage Attendance
            </Button>
            <Button
      variant="contained"
      color="secondary"
      style={{ marginTop: '10px', marginLeft: '10px' }}
      onClick={handleGenerateReports}
    >
      Generate Reports
    </Button>
                </Paper>
          </Grid>
          {/* Upcoming Events and Reminders */}
          <Grid item xs={12}>
              <Paper elevation={3} style={{ padding: '20px' }}>
                <Typography variant="h6">Upcoming Events</Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Parent-Teacher Meeting on Nov 10" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="School Sports Day on Nov 15" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </div>
    </>
  );
};

export default AdminHome;
