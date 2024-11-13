import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Correct import
import { Box, Typography, Drawer, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List, ListItem, ListItemText, Paper, IconButton, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import AppBarComponent from './CustomAppBar';

const AttendanceManagement = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentAttendance, setCurrentAttendance] = useState(null);
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        fetchAttendanceRecords();
    }, []);

    const fetchAttendanceRecords = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/attendance`);
            if (Array.isArray(response.data)) {
                setAttendanceRecords(response.data);
            } else {
                console.error('Expected an array but got:', response.data);
                setAttendanceRecords([]);
            }
        } catch (error) {
            console.error('Error fetching attendance records:', error);
            setAttendanceRecords([]);
        }
    };

    const handleDeleteAttendance = async (attendance_id) => {
        if (window.confirm("Are you sure you want to delete this attendance record?")) {
            try {
                const response = await axios.delete(`http://localhost:5000/api/attendance/${attendance_id}`);
                if (response.status === 200) {
                    fetchAttendanceRecords();
                    setSnackbarMessage('Attendance record deleted successfully!');
                    setSnackbarSeverity('success');
                } else {
                    setSnackbarMessage('Failed to delete attendance record. Please try again.');
                    setSnackbarSeverity('error');
                }
            } catch (error) {
                console.error('Error deleting attendance record:', error);
                setSnackbarMessage('Error deleting attendance record. Please try again.');
                setSnackbarSeverity('error');
            }
            setSnackbarOpen(true);
        }
    };

    const handleEditAttendance = (attendance) => {
        setCurrentAttendance(attendance);
        setEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            const response = await axios.put(`http://localhost:5000/api/attendance/${currentAttendance.attendance_id}`, currentAttendance);
            if (response.status === 200) {
                fetchAttendanceRecords();
                setSnackbarMessage('Attendance record updated successfully!');
                setSnackbarSeverity('success');
            } else {
                setSnackbarMessage('Failed to update attendance record. Please try again.');
                setSnackbarSeverity('error');
            }
            setSnackbarOpen(true);
            setEditDialogOpen(false);
        } catch (error) {
            console.error('Error updating attendance record:', error);
            setSnackbarMessage('Error updating attendance record. Please try again.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentAttendance((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleNavigation = (path) => {
      setDrawerOpen(false);
      navigate(path);
    };

    const toggleDrawer = () => {
      setDrawerOpen(!drawerOpen);
    };

    return (
      <>
      <AppBarComponent toggleDrawer={toggleDrawer}/>
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
        <Box sx={{ p: 10 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Attendance Records</Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Attendance ID</TableCell>
                            <TableCell>Student ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Clock-In Time</TableCell>
                            <TableCell>Clock-Out Time</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {attendanceRecords.length > 0 ? (
                            attendanceRecords.map((attendance) => (
                                <TableRow key={attendance.attendance_id}>
                                    <TableCell>{attendance.attendance_id}</TableCell>
                                    <TableCell>{attendance.student_id}</TableCell>
                                    <TableCell>{attendance.date}</TableCell>
                                    <TableCell>{attendance.status}</TableCell>
                                    <TableCell>{attendance.clockInTime}</TableCell>
                                    <TableCell>{attendance.clockOutTime}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEditAttendance(attendance)} color="primary">
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteAttendance(attendance.attendance_id)} color="secondary">
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No attendance records found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Edit Attendance</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Student ID"
                        name="student_id"
                        value={currentAttendance?.student_id || ''}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Date"
                        name="date"
                        type="date"
                        value={currentAttendance?.date || ''}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Status"
                        name="status"
                        value={currentAttendance?.status || ''}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Clock-In Time"
                        name="clockInTime"
                        value={currentAttendance?.clockInTime || ''}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Clock-Out Time"
                        name="clockOutTime"
                        value={currentAttendance?.clockOutTime || ''}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} color="secondary">Cancel</Button>
                    <Button onClick={handleSaveEdit} color="primary">Save</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
        </>
    );
};

export default AttendanceManagement;
