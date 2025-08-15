import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, 
  CircularProgress, Chip, Avatar
} from '@mui/material';
import { 
  CheckCircle, Cancel, WatchLater,
  School
} from '@mui/icons-material';
import axios from 'axios';
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttendance = async (student_id) => {
      try {
              setLoading(true);

      // Check if token exists before making request
      const token = getToken();
      if (!token) {
        setError('Authentication token missing. Please log in again.');
        return;
      }

      // Axios instance automatically attaches token via interceptor
      const response = await axiosInstance.get('student/attendance');
        setAttendance(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load attendance history');
        console.error('Attendance history error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) {
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
        
        <TableContainer component={Paper}>
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
      </Box>
    </>
  );
};

export default AttendanceHistory;