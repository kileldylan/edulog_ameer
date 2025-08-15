import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, 
  Paper, CircularProgress, Button, Chip,
  Alert, Snackbar
} from '@mui/material';
import { 
  Schedule, CalendarToday,
  CheckCircle, EventAvailable
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from './studentNavbar';
import axiosInstance from '../axios/axiosInstance';
import dayjs from 'dayjs';
import { getToken, removeToken } from '../axios/auth';

const SessionCard = ({ session, onClockIn, loading }) => {
  const isPastSession = dayjs(session.session_date).isBefore(dayjs(), 'day');
  const isToday = dayjs(session.session_date).isSame(dayjs(), 'day');
  
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{session.course_name}</Typography>
        <Typography color="text.secondary" gutterBottom>
          {session.teacher_name}
        </Typography>
        
        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid item>
            <Chip 
              icon={<CalendarToday fontSize="small" />} 
              label={dayjs(session.session_date).format('MMM D, YYYY')} 
            />
          </Grid>
          <Grid item>
            <Chip 
              icon={<Schedule fontSize="small" />} 
              label={`${session.start_time} - ${session.end_time}`} 
            />
          </Grid>
          <Grid item>
            <Chip 
              icon={<EventAvailable fontSize="small" />}
              label={session.attended ? "Attended" : "Not Attended"}
              color={session.attended ? "success" : "default"}
            />
          </Grid>
        </Grid>

        {loading ? (
          <Button fullWidth disabled>
            <CircularProgress size={24} />
          </Button>
        ) : isPastSession ? (
          <Button 
            variant="outlined" 
            fullWidth
            disabled
            startIcon={<CheckCircle />}
          >
            Session Ended
          </Button>
        ) : isToday && !session.attended ? (
          <Button 
            variant="contained" 
            fullWidth
            onClick={() => onClockIn(session.session_id)}
            startIcon={<EventAvailable />}
          >
            Clock In
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
};

const StudentSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clockInLoading, setClockInLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchSessions = async () => {
    try {
      setLoading(true);

      // Check if token exists before making request
      const token = getToken();
      if (!token) {
        setError('Authentication token missing. Please log in again.');
        return;
      }

      // Axios instance automatically attaches token via interceptor
      const response = await axiosInstance.get('/student/sessions');
      setSessions(response.data);
      setError(null);

    } catch (err) {
      console.error('Sessions error:', err);

      // Handle token expiration or invalid token
      if (err.response?.status === 401) {
        removeToken();
        setError('Session expired. Please log in again.');
        window.location.href = '/';
      } else {
        setError(err.response?.data?.error || 'Failed to load sessions');
      }

    } finally {
      setLoading(false);
    }
  };

  fetchSessions();
}, []);


  const handleClockIn = async (sessionId) => {
    try {
      setClockInLoading(true);
      await axiosInstance.post(`/student/sessions/${sessionId}/clock-in`);
      setSuccess('Attendance marked successfully!');
      
      // Refresh sessions after clocking in
      const response = await axiosInstance.get('/student/sessions');
      setSessions(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark attendance');
      console.error('Clock-in error:', err);
    } finally {
      setClockInLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <>
        <StudentNavbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <StudentNavbar />
      <Box sx={{ p: 3, mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Available Sessions
        </Typography>
        
        {/* Success/Error Alerts */}
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

        {sessions.length > 0 ? (
          sessions.map(session => (
            <SessionCard 
              key={session.session_id} 
              session={session} 
              onClockIn={handleClockIn}
              loading={clockInLoading}
            />
          ))
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No available sessions found
            </Typography>
            <Typography sx={{ mt: 1 }}>
              You don't have any upcoming sessions or you're not enrolled in any courses.
            </Typography>
          </Paper>
        )}
      </Box>
    </>
  );
};

export default StudentSessions;