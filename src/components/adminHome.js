import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Button,
  Card, CardContent, Avatar, Divider, List, ListItem, ListItemText,
  Alert
} from '@mui/material';
import { 
  People, EventAvailable, EventBusy, Class, 
  TrendingUp, Assignment, Report
} from '@mui/icons-material';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axios/axiosInstance';
import AppBarComponent from './CustomAppBar';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const DashboardCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%', boxShadow: 3, borderLeft: `4px solid ${color}` }}>
    <CardContent>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Avatar sx={{ bgcolor: `${color}20`, color: color }}>
            {icon}
          </Avatar>
        </Grid>
        <Grid item xs>
          <Typography variant="h5" fontWeight="bold">{value}</Typography>
          <Typography variant="body1">{title}</Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const AdminHome = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    departmentStats: [],
    recentLogs: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get('/admin/dashboard');
        setDashboardData(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getDepartmentChartData = () => ({
    labels: dashboardData.departmentStats.map(d => d.department),
    datasets: [{
      label: 'Students',
      data: dashboardData.departmentStats.map(d => d.student_count),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
      ],
      borderWidth: 1
    }]
  });

  const handleAttendanceManagement = () => navigate('/attendance');
  const handleGenerateReports = () => navigate('/reports');

  const toggleDrawer = () => {
  setDrawerOpen(!drawerOpen);
};

  return (
    <>
      <AppBarComponent openDrawer={drawerOpen} toggleDrawer={toggleDrawer} />
      <Box sx={{ p: 3, mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <DashboardCard 
              title="Total Students" 
              value={dashboardData.stats?.totalStudents || 0}
              icon={<People />}
              color="#3f51b5"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DashboardCard 
              title="Today's Attendance" 
              value={`${dashboardData.stats?.attendanceToday || 0}%`}
              icon={<EventAvailable />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DashboardCard 
              title="Absent Today" 
              value={dashboardData.stats?.absentStudents || 0}
              icon={<EventBusy />}
              color="#f44336"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                Students by Department
              </Typography>
              <Pie 
                data={getDepartmentChartData()} 
                options={{ maintainAspectRatio: false }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Attendance Logs
              </Typography>
              <List>
                {dashboardData.recentLogs.map((log, index) => (
                  <ListItem key={index} divider>
                    <ListItemText 
                      primary={`${log.name} - ${log.status}`}
                      secondary={`${log.course} - ${new Date(log.date).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Class />}
                  onClick={handleAttendanceManagement}
                >
                  Manage Attendance
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Report />}
                  onClick={handleGenerateReports}
                >
                  Generate Reports
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default AdminHome;