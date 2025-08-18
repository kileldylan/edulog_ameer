import React, { useState, useEffect} from 'react';
import {
    Box, Button, TextField, Typography, Dialog, DialogActions,
    DialogContent, DialogTitle, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton,
    MenuItem, Tooltip, Snackbar, Alert
} from '@mui/material';
import { Add, Edit, Delete, Download } from '@mui/icons-material';
import axios from 'axios';
import AppBarComponent from './CustomAppBar';
import axiosInstance from '../axios/axiosInstance';
import { useNavigate } from 'react-router-dom';

const departments = ['Arts', 'Business','Commerce', 'Computer Science', 'Engineering', 'Health', 'Science',  'Social Science'];
const years = ['1', '2', '3', '4'];

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [filters, setFilters] = useState({ department: '', yearOfStudy: '' });
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [newStudent, setNewStudent] = useState({});
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
    try {
        const response = await axiosInstance.get('/student/all-students', {
        });

        if (response.data.success && Array.isArray(response.data.data)) {
        setStudents(response.data.data);
        } else {
        console.error('Unexpected response format:', response.data);
        setStudents([]);
        // Show error to user
        setError('Failed to load students. Invalid data format.');
        }
    } catch (error) {
        console.error('Error fetching students:', {
        message: error.message,
        response: error.response?.data,
        code: error.code
        });
        
        setStudents([]);
        
        // Handle different error cases
        if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
            setError('Session expired. Please login again.');
            localStorage.removeItem('token');
            navigate('/login');
        } else {
            setError(error.response.data.error || 'Failed to fetch students');
        }
        } else if (error.request) {
        // Request was made but no response
        setError('Network error. Please check your connection.');
        } else {
        // Other errors
        setError('Failed to fetch students. Please try again.');
        }
    }
    };

    const handleOpenDialog = (student = null) => {
        setOpenDialog(true);
        if (student) {
            setNewStudent(student);
            setIsEditMode(true);
        } else {
            resetNewStudent();
            setIsEditMode(false);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        resetNewStudent();
    };

    const resetNewStudent = () => {
        setNewStudent({
            student_id: '',
            name: '',
            email: '',
            course: '',
            department: '',
            year_of_study: '',
            total_classes: 0,
            classes_attended: 0,
        });
    };

    const handleSaveStudent = async () => {
        try {
            let response;
            if (isEditMode) {
                response = await axios.put(`http://localhost:5000/api/students/${newStudent.student_id}`, newStudent);
            } else {
                response = await axios.post('http://localhost:5000/api/students', newStudent);
            }

            // Check if the response is successful
            if (response.status === 200 || response.status === 201) {
                // Show success message
                setSnackbarMessage(isEditMode ? 'Student updated successfully!' : 'Student added successfully!');
                setSnackbarSeverity('success');

                // Reload the page to fetch updated info
                window.location.reload(); 
            } else {
                console.error('Unexpected API response after save:', response.data);
                setSnackbarMessage('Failed to save student. Please try again.');
                setSnackbarSeverity('error');
            }
        } catch (error) {
            console.error('Error saving student:', error);
            setSnackbarMessage('Error saving student. Please try again.');
            setSnackbarSeverity('error');
        } finally {
            setSnackbarOpen(true);
            handleCloseDialog();
        }
    };

    const handleDeleteStudent = async (student_id) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            try {
                const response = await axios.delete(`http://localhost:5000/api/students/${student_id}`);
                if (response.status === 200) {
                    fetchStudents();
                    setSnackbarMessage('Student deleted successfully!');
                    setSnackbarSeverity('success');
                } else {
                    setSnackbarMessage('Failed to delete student. Please try again.');
                    setSnackbarSeverity('error');
                }
            } catch (error) {
                console.error('Error deleting student:', error);
                setSnackbarMessage('Error deleting student. Please try again.');
                setSnackbarSeverity('error');
            }
            setSnackbarOpen(true);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewStudent((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value); // Update search query state
    };

    const applyFilters = () => {
        if (!Array.isArray(students)) return [];
        return students.filter((student) =>
            (filters.department ? student.department === filters.department : true) &&
            (filters.yearOfStudy ? student.year_of_study === filters.yearOfStudy : true) &&
            (searchQuery ? 
                student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) 
                : true) // Filter by name or student ID
        );
    };

    const exportData = () => {
        const filteredData = applyFilters();
        const csvContent = [
            ["Student ID", "Name", "Email", "Course", "Department", "Year of Study", "Total Classes", "Classes Attended"],
            ...filteredData.map(student => [
                student.student_id,
                student.name,
                student.email,
                student.course,
                student.department,
                student.year_of_study,
                student.total_classes,
                student.classes_attended
            ])
        ]
            .map(row => row.join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students_data.csv';
        a.click();
    };
  
    const toggleDrawer = () => {
      setDrawerOpen(!drawerOpen);
    };

    return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <AppBarComponent openDrawer={drawerOpen} toggleDrawer={toggleDrawer} />

    <Box sx={{ p: 10 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Student Management</Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    label="Search by Name or ID"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    sx={{ minWidth: 250 }}
                />
                <TextField
                    select
                    label="Department"
                    name="department"
                    value={filters.department}
                    onChange={handleFilterChange}
                    sx={{ minWidth: 150 }}
                >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    label="Year of Study"
                    name="yearOfStudy"
                    value={filters.yearOfStudy}
                    onChange={handleFilterChange}
                    sx={{ minWidth: 150 }}
                >
                    <MenuItem value="">All Years</MenuItem>
                    {years.map((year) => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                </TextField>
                <Tooltip title="Export Data">
                    <Button onClick={exportData} variant="contained" color="primary" startIcon={<Download />}>
                        Export
                    </Button>
                </Tooltip>
                <Tooltip title="Add Student">
                    <Button onClick={() => handleOpenDialog()} variant="contained" color="secondary" startIcon={<Add />}>
                        Add Student
                    </Button>
                </Tooltip>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Course</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Year of Study</TableCell>
                            <TableCell>Total Classes</TableCell>
                            <TableCell>Classes Attended</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {applyFilters().length > 0 ? (
                            applyFilters().map((student) => (
                                <TableRow key={student.student_id}>
                                    <TableCell>{student.student_id}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell>{student.course}</TableCell>
                                    <TableCell>{student.department}</TableCell>
                                    <TableCell>{student.year_of_study}</TableCell>
                                    <TableCell>{student.total_classes}</TableCell>
                                    <TableCell>{student.classes_attended}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenDialog(student)} color="primary">
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteStudent(student.student_id)} color="secondary">
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} align="center">No students found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{isEditMode ? 'Edit Student' : 'Add Student'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Student ID"
                        name="student_id"
                        value={newStudent.student_id}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        disabled={isEditMode}
                    />
                    <TextField
                        margin="dense"
                        label="Name"
                        name="name"
                        value={newStudent.name}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        name="email"
                        value={newStudent.email}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                    />
                    <TextField
                        margin="dense"
                        label="Course"
                        name="course"
                        value={newStudent.course}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                    />
                    <TextField
                        margin="dense"
                        label="Department"
                        name="department"
                        value={newStudent.department}
                        onChange={handleChange}
                        select
                        fullWidth
                        variant="outlined"
                    >
                        {departments.map((dept) => (
                            <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Year of Study"
                        name="year_of_study"
                        value={newStudent.year_of_study}
                        onChange={handleChange}
                        select
                        fullWidth
                        variant="outlined"
                    >
                        {years.map((year) => (
                            <MenuItem key={year} value={year}>{year}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Total Classes"
                        name="total_classes"
                        value={newStudent.total_classes}
                        onChange={handleChange}
                        type="number"
                        fullWidth
                        variant="outlined"
                    />
                    <TextField
                        margin="dense"
                        label="Classes Attended"
                        name="classes_attended"
                        value={newStudent.classes_attended}
                        onChange={handleChange}
                        type="number"
                        fullWidth
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
                    <Button onClick={handleSaveStudent} color="primary">{isEditMode ? 'Update' : 'Add'}</Button>
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
        </div>
    );
};

export default StudentManagement;
