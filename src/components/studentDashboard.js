import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, Paper, 
  CircularProgress, Button, Avatar, Chip, Divider,
  Alert, Snackbar, Skeleton
} from '@mui/material';
import { 
  EventAvailable, EventBusy, Schedule, 
  CalendarToday, CheckCircle,
  Warning, TrendingUp, Class
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import dayjs from 'dayjs';
import StudentNavbar from './studentNavbar';
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
  Legend 
} from 'chart.js';
import axiosInstance from '../axios/axiosInstance';

// Register ChartJS components
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

// Dashboard Card Component
const DashboardCard = ({ title, value, icon, color, subtext, loading }) => (
  <Card sx={{ height: '100%', boxShadow: 3, borderLeft: `4px solid ${color}` }}>
    <CardContent>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Avatar sx={{ bgcolor: `${color}20`, color: color }}>
            {icon}
          </Avatar>
        </Grid>
        <Grid item xs>
          {loading ? (
            <Skeleton variant="text" width="60%" height={40} />
          ) : (
            <Typography variant="h5" fontWeight="bold">{value}</Typography>
          )}
          <Typography variant="body1">{title}</Typography>
          {subtext && (
            <Typography variant="caption" color="text.secondary">{subtext}</Typography>
          )}
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

// Session Card Component
const SessionCard = ({ session, onClockIn, loading }) => {
  if (loading) {
    return (
      <Card sx={{ mb: 2, boxShadow: 2 }}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={30} />
          <Skeleton variant="text" width="40%" />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Skeleton variant="rounded" width={120} height={32} />
            <Skeleton variant="rounded" width={120} height={32} />
          </Box>
          <Skeleton variant="rounded" width="100%" height={36} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  const isUpcoming = dayjs(session.session_date).isAfter(dayjs());
  const isToday = dayjs(session.session_date).isSame(dayjs(), 'day');
  
  return (
    <Card sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">{session.course_name}</Typography>
          <Chip 
            label={isToday ? "Today" : isUpcoming ? "Upcoming" : "Completed"} 
            color={isToday ? "primary" : isUpcoming ? "warning" : "success"}
            size="small"
          />
        </Box>
        
        <Typography color="text.secondary" gutterBottom>
          <Class fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
          {session.teacher_name}
        </Typography>
        
        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid item>
            <Chip 
              icon={<CalendarToday fontSize="small" />} 
              label={dayjs(session.session_date).format('MMM D, YYYY')}
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Chip 
              icon={<Schedule fontSize="small" />} 
              label={`${session.start_time} - ${session.end_time}`}
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Chip 
              icon={<CheckCircle fontSize="small" />} 
              label={session.attended ? "Attended" : "Pending"}
              color={session.attended ? "success" : "default"}
            />
          </Grid>
        </Grid>
        
        {isToday && !session.attended && (
          <Button 
            variant="contained" 
            fullWidth
            startIcon={<EventAvailable />}
            onClick={() => onClockIn(session.session_id)}
            sx={{ mt: 1 }}
          >
            Clock In Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    student: null,
    stats: null,
    upcomingSessions: null,
    attendanceHistory: null
  });
  const [loading, setLoading] = useState({
    initial: true,
    stats: true,
    sessions: true,
    history: true
  });
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const { student_id } = useParams();

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(prev => ({ ...prev, initial: true }));
      
      // Debug: Verify token exists before request
      const token = localStorage.getItem('token');
      console.log('Current token:', token);
      if (!token) throw new Error('No authentication token found');

      // Debug: Verify axios instance configuration
      console.log('Axios instance headers:', axiosInstance.defaults.headers);

      // First request
      const studentRes = await axiosInstance.get('/student/dashboard');
      console.log('Dashboard response:', studentRes.data);

      // Second request
      const historyRes = await axiosInstance.get('/student/attendance');
      console.log('Attendance response:', historyRes.data);

      setDashboardData({
        student: studentRes.data.student,
        stats: studentRes.data.stats,
        upcomingSessions: studentRes.data.upcomingSessions,
        attendanceHistory: historyRes.data
      });

    } catch (err) {
      console.error('Dashboard error:', err);
      console.log('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers
      });

      setError(err.response?.data?.error || 'Failed to load dashboard data');
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login?session_expired=true');
      }
    } finally {
      setLoading({ initial: false, stats: false, sessions: false, history: false });
    }
  };

  const handleClockIn = async (sessionId) => {
      try {
          await axiosInstance.post(`/student/sessions/${sessionId}/clock-in`);
          setSnackbar({
              open: true,
              message: 'Successfully clocked in!',
              severity: 'success'
          });
          
          // Refresh sessions data using axiosInstance
          const sessionsRes = await axiosInstance.get('/student/sessions');
          setDashboardData(prev => ({
              ...prev,
              upcomingSessions: sessionsRes.data
          }));
      } catch (err) {
          setSnackbar({
              open: true,
              message: err.response?.data?.error || 'Clock-in failed',
              severity: 'error'
          });
      }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Initial data fetch
  useEffect(() => {
    if (student_id) {
      fetchDashboardData();
    } else {
      setError('Student ID not found');
      setLoading(prev => ({ ...prev, initial: false }));
    }
  }, [student_id]);

  // Prepare chart data
  const attendanceChartData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{
      data: [
        dashboardData.stats?.present_count || 0,
        dashboardData.stats?.absent_count || 0,
        dashboardData.stats?.late_count || 0
      ],
      backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
      borderWidth: 1
    }]
  };

  const performanceChartData = {
    labels: dashboardData.attendanceHistory?.map(item => dayjs(item.date).format('MMM D')) || [],
    datasets: [{
      label: 'Attendance Performance',
      data: dashboardData.attendanceHistory?.map(item => item.score) || [],
      backgroundColor: '#3f51b5',
      borderColor: '#303f9f',
      tension: 0.3,
      fill: true
    }]
  };

  return (
    <>
      <StudentNavbar />
      <Box sx={{ p: 3, mt: 8 }}>
        {/* Welcome Section */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4,
          p: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: 1
        }}>
          {loading.initial ? (
            <>
              <Skeleton variant="circular" width={80} height={80} sx={{ mr: 3 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={40} />
                <Skeleton variant="text" width="40%" />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Skeleton variant="rounded" width={120} height={32} />
                  <Skeleton variant="rounded" width={120} height={32} />
                </Box>
              </Box>
            </>
          ) : (
            <>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mr: 3,
                bgcolor: 'primary.main',
                fontSize: '2rem'
              }}>
                {dashboardData.student?.name?.charAt(0) || '?'}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Welcome back, {dashboardData.student?.name?.split(' ')[0] || 'Student'}!
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {dashboardData.student?.department || 'Department'} • Year {dashboardData.student?.year_of_study || '0'}
                </Typography>
                <Box sx={{ display: 'flex', mt: 1 }}>
                  <Chip 
                    icon={<TrendingUp />} 
                    label={`${dashboardData.stats?.attendance_percentage || 0}% Attendance`} 
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    icon={dashboardData.stats?.attendance_trend > 0 ? <CheckCircle /> : <Warning />} 
                    label={dashboardData.stats?.attendance_trend > 0 ? 'Improving' : 'Needs improvement'} 
                    color={dashboardData.stats?.attendance_trend > 0 ? 'success' : 'warning'}
                  />
                </Box>
              </Box>
            </>
          )}
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <DashboardCard 
              title="Attendance Rate" 
              value={`${dashboardData.stats?.attendance_percentage || 0}%`}
              icon={<EventAvailable />}
              color="#4caf50"
              subtext={`${dashboardData.stats?.present_count || 0} of ${dashboardData.stats?.total_sessions || 0} sessions`}
              loading={loading.stats}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DashboardCard 
              title="Current Streak" 
              value={dashboardData.stats?.current_streak || '0'}
              icon={<CheckCircle />}
              color="#3f51b5"
              subtext="Consecutive attended sessions"
              loading={loading.stats}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DashboardCard 
              title="Missed Sessions" 
              value={dashboardData.stats?.absent_count || '0'}
              icon={<EventBusy />}
              color="#f44336"
              subtext={`${dashboardData.stats?.late_count || 0} late arrivals`}
              loading={loading.stats}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Upcoming Sessions */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Your Upcoming Sessions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {loading.sessions ? (
                <>
                  <SessionCard loading={true} />
                  <SessionCard loading={true} />
                </>
              ) : dashboardData.upcomingSessions?.length > 0 ? (
                dashboardData.upcomingSessions.slice(0, 3).map(session => (
                  <SessionCard 
                    key={session.session_id} 
                    session={session} 
                    onClockIn={handleClockIn}
                    loading={false}
                  />
                ))
              ) : (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography color="text.secondary">
                    No upcoming sessions scheduled
                  </Typography>
                </Box>
              )}
              
              {dashboardData.upcomingSessions?.length > 3 && (
                <Button 
                  fullWidth 
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/student/sessions`)}
                >
                  View All Sessions ({dashboardData.upcomingSessions.length})
                </Button>
              )}
            </Paper>
          </Grid>

          {/* Attendance Overview */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Attendance Overview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 250 }}>
                    {loading.stats ? (
                      <Skeleton variant="rounded" width="100%" height="100%" />
                    ) : (
                      <Pie 
                        data={attendanceChartData}
                        options={{
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: 'bottom' }
                          }
                        }}
                      />
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 250 }}>
                    {loading.history ? (
                      <Skeleton variant="rounded" width="100%" height="100%" />
                    ) : (
                      <Bar 
                        data={performanceChartData}
                        options={{
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100
                            }
                          }
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>
              
              <Button 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => navigate(`/student/attendance`)}
                startIcon={<EventAvailable />}
              >
                View Detailed Attendance History
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default StudentDashboard;