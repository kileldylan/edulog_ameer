import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  CircularProgress, Chip, Avatar, Button, Grid
} from '@mui/material';
import { 
  CheckCircle, Cancel, WatchLater,
  School, NavigateBefore, NavigateNext
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from './studentNavbar';
import axiosInstance from '../axios/axiosInstance';
import { getToken, removeToken } from '../axios/auth';

const statusIcons = {
  Present: <CheckCircle color="success" />,
  Absent: <Cancel color="error" />,
  Late: <WatchLater color="warning" />
};

const statusColors = {
  Present: 'success',
  Absent: 'error',
  Late: 'warning'
};

const AttendanceHistory = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const navigate = useNavigate();

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token missing');
      }

      const response = await axiosInstance.get(
        `/student/attendance?page=${pagination.page}&limit=${pagination.limit}`
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Invalid response format');
      }

      setAttendance(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0
      }));

    } catch (err) {
      console.error('Attendance fetch error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });

      setError(err.response?.data?.error || 
               err.message || 
               'Failed to load attendance history');
      
      if (err.response?.status === 401) {
        removeToken();
        navigate('/login?session_expired=true');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [pagination.page, pagination.limit]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  if (loading && pagination.page === 1) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <>
      <StudentNavbar />
      <Box sx={{ p: 3, mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Attendance History
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.length > 0 ? (
                attendance.map((record) => (
                  <TableRow key={`${record.session_id}-${record.clock_in}`}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#3f51b5', mr: 2 }}>
                          <School />
                        </Avatar>
                        <div>
                          <Typography>{record.course_name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {record.course_code}
                          </Typography>
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(record.session_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {record.start_time} - {record.end_time}
                    </TableCell>
                    <TableCell>{record.teacher_name}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        icon={statusIcons[record.status]}
                        label={record.status}
                        color={statusColors[record.status]}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No attendance records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Controls */}
        <Grid container justifyContent="center" spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<NavigateBefore />}
              disabled={pagination.page <= 1 || loading}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
          </Grid>
          <Grid item>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              endIcon={<NavigateNext />}
              disabled={
                pagination.page >= Math.ceil(pagination.total / pagination.limit) || 
                loading
              }
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default AttendanceHistory;