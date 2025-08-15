import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, 
  Paper, CircularProgress, Button, Chip,
  Alert, Snackbar, Divider, Table, 
  TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton
} from '@mui/material';
import { 
  Class, School, Schedule, 
  CheckCircle, Cancel, Add
} from '@mui/icons-material';
import axiosInstance from '../axios/axiosInstance';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from './studentNavbar';

const CourseCard = ({ course, action, actionText, actionIcon, disabled }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">{course.course_name}</Typography>
          <Chip 
            label={course.credits + ' credits'} 
            color="info" 
            size="small"
          />
        </Box>
        
        <Typography color="text.secondary" gutterBottom>
          <School fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
          {course.department}
        </Typography>
        
        <Typography variant="body2" paragraph>
          {course.description}
        </Typography>
        
        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid item>
            <Chip 
              icon={<Class fontSize="small" />} 
              label={course.course_code} 
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Chip 
              icon={<Schedule fontSize="small" />} 
              label={`Semester ${course.semester}`} 
              variant="outlined"
            />
          </Grid>
        </Grid>
        
        {action && (
          <Button
            variant="contained"
            fullWidth
            startIcon={actionIcon}
            onClick={() => action(course.course_id)}
            disabled={disabled}
          >
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const CourseList = ({ type }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const endpoint = type === 'enrolled' 
    ? '/student/courses/enrolled' 
    : '/student/courses/available';

const fetchCourses = async () => {
  try {
    setLoading(true);
    
    // Debug: Check token before request
    const token = localStorage.getItem('token');
    console.log('Current token:', token);
    
    const response = await axiosInstance.get(endpoint);
    
    // Debug: Check response headers
    console.log('Response headers:', response.headers);
    
    setCourses(response.data.data);
    setError(null);
  } catch (err) {
    console.error('API Error:', err);
    console.log('Error response:', err.response);
    
    setError(err.response?.data?.error || 'Failed to load courses');
    
    // If 401, force logout
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login?session_expired=true');
    }
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchCourses();
  }, [type]);

  const handleEnroll = async (courseId) => {
    try {
      setActionLoading(true);
      await axiosInstance.post('/student/courses/enroll', { course_id: courseId });
      setSuccess('Successfully enrolled in course!');
      fetchCourses(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to enroll');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDrop = async (courseId) => {
    try {
      setActionLoading(true);
      await axiosInstance.delete(`/student/courses/drop/${courseId}`);
      setSuccess('Successfully dropped course!');
      fetchCourses(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to drop course');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
    <StudentNavbar />
      <Box sx={{ p: 3, mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        {type === 'enrolled' ? 'My Courses' : 'Available Courses'}
      </Typography>
      
      {error && (
        <Alert severity="error" onClose={handleCloseAlert} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" onClose={handleCloseAlert} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {courses.length > 0 ? (
        <Grid container spacing={3}>
          {courses.map(course => (
            <Grid item xs={12} md={6} key={course.course_id}>
              <CourseCard
                course={course}
                action={type === 'available' ? handleEnroll : handleDrop}
                actionText={type === 'available' ? 'Enroll' : 'Drop Course'}
                actionIcon={type === 'available' ? <Add /> : <Cancel />}
                disabled={actionLoading}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {type === 'enrolled' 
              ? 'You are not enrolled in any courses' 
              : 'No available courses found'}
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }}
            onClick={() => navigate(type === 'enrolled' 
              ? '/student/courses/available' 
              : '/student/course/enroll'
            )}
          >
            View {type === 'enrolled' ? 'Available Courses' : 'My Courses'}
          </Button>
        </Paper>
      )}
    </Box>
</>
  );
};

export default CourseList;