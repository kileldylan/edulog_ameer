import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, IconButton, Button, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, 
  Snackbar, Alert, MenuItem, Select, FormControl, InputLabel,
  Grid, Chip
} from '@mui/material';
import { Add, Edit, Delete} from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';
import AppBarComponent from './CustomAppBar';

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchTeachers();
    fetchCourses();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/sessions');
      setSessions(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch sessions', 'error');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleOpenDialog = (session = null) => {
    setCurrentSession(session || {
      course_code: '',
      teacher_email: '',
      session_date: moment().format('YYYY-MM-DD'),
      start_time: '09:00',
      end_time: '10:00',
      location: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentSession(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentSession(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (currentSession.session_id) {
        await axios.put(`http://localhost:5000/api/admin/sessions/${currentSession.session_id}`, currentSession);
        showSnackbar('Session updated successfully', 'success');
      } else {
        await axios.post('http://localhost:5000/api/admin/sessions', currentSession);
        showSnackbar('Session created successfully', 'success');
      }
      fetchSessions();
      handleCloseDialog();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Error saving session', 'error');
    }
  };

  const handleDelete = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/sessions/${sessionId}`);
        showSnackbar('Session deleted successfully', 'success');
        fetchSessions();
      } catch (error) {
        showSnackbar('Error deleting session', 'error');
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'ongoing': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
    <AppBarComponent openDrawer={drawerOpen} toggleDrawer={toggleDrawer} />
    <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>

      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Session Management</Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Session
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Session ID</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.session_id}>
                  <TableCell>{session.session_id}</TableCell>
                  <TableCell>{session.course_name} ({session.course_code})</TableCell>
                  <TableCell>{session.teacher_name}</TableCell>
                  <TableCell>
                    {moment(session.session_date).format('MMM D, YYYY')}<br />
                    {session.start_time} - {session.end_time}
                  </TableCell>
                  <TableCell>{session.location}</TableCell>
                  <TableCell>
                    <Chip 
                      label={session.status} 
                      color={getStatusColor(session.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(session)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(session.session_id)} color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Session Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {currentSession?.session_id ? 'Edit Session' : 'Create New Session'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Course</InputLabel>
                  <Select
                    name="course_code"
                    value={currentSession?.course_code || ''}
                    onChange={handleChange}
                    label="Course"
                    required
                  >
                    {courses.map(course => (
                      <MenuItem key={course.course_id} value={course.course_code}>
                        {course.course_name} ({course.course_code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Teacher</InputLabel>
                  <Select
                    name="teacher_email"
                    value={currentSession?.teacher_email || ''}
                    onChange={handleChange}
                    label="Teacher"
                    required
                  >
                    {teachers.map(teacher => (
                      <MenuItem key={teacher.teacher_id} value={teacher.email}>
                        {teacher.name} ({teacher.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Date"
                  type="date"
                  name="session_date"
                  value={currentSession?.session_date || ''}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Start Time"
                  type="time"
                  name="start_time"
                  value={currentSession?.start_time || ''}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="End Time"
                  type="time"
                  name="end_time"
                  value={currentSession?.end_time || ''}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Location"
                  name="location"
                  value={currentSession?.location || ''}
                  onChange={handleChange}
                />
              </Grid>

              {currentSession?.session_id && (
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={currentSession?.status || 'scheduled'}
                      onChange={handleChange}
                      label="Status"
                    >
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                      <MenuItem value="ongoing">Ongoing</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {currentSession?.session_id ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
    </>
  );
};

export default SessionManagement;