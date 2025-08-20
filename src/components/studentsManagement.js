import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Dialog, DialogActions,
  DialogContent, DialogTitle, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  MenuItem, Snackbar, Alert, FormControl, InputLabel, Select
} from '@mui/material';
import { Add, Edit, Delete, Download } from '@mui/icons-material';
import axiosInstance from '../axios/axiosInstance';
import AppBarComponent from './CustomAppBar';
import { useNavigate } from 'react-router-dom';

const departments = ['Arts', 'Business', 'Commerce', 'Computer Science', 'Engineering', 'Health', 'Science', 'Social Science'];
const years = [1, 2, 3, 4];

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ department: '', yearOfStudy: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    course_id: '',
    department: '',
    year_of_study: 1
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get('/admin/all-students');
      // Access the nested 'data' property from the response
      setStudents(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching students:', error.response || error);
      setError('Failed to load students: ' + (error.response?.data?.error || error.message));
      setStudents([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/admin/courses');
      // Ensure courses is an array
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching courses:', error.response || error);
      setError('Failed to load courses: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleOpenDialog = (student = null) => {
    setOpenDialog(true);
    if (student) {
      setNewStudent(student);
      setIsEditMode(true);
    } else {
      setNewStudent({
        name: '',
        email: '',
        course_id: '',
        department: '',
        year_of_study: 1
      });
      setIsEditMode(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveStudent = async () => {
    try {
      if (isEditMode) {
        await axiosInstance.put(`/admin/update/${newStudent.student_id}`, newStudent);
        setSnackbarMessage('Student updated successfully!');
      } else {
        await axiosInstance.post('/admin/create', newStudent); // Fixed endpoint
        setSnackbarMessage('Student added successfully!');
      }
      setSnackbarSeverity('success');
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error.response || error);
      setSnackbarMessage(error.response?.data?.error || 'Error saving student');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      handleCloseDialog();
    }
  };

  const handleDeleteStudent = async (student_id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await axiosInstance.delete(`/admin/delete/${student_id}`);
        setSnackbarMessage('Student deleted successfully!');
        setSnackbarSeverity('success');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error.response || error);
        setSnackbarMessage(error.response?.data?.error || 'Error deleting student');
        setSnackbarSeverity('error');
      }
      setSnackbarOpen(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const applyFilters = () => {
    return students.filter(student =>
      (filters.department ? student.department === filters.department : true) &&
      (filters.yearOfStudy ? student.year_of_study === filters.yearOfStudy : true) &&
      (searchQuery ?
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_id.toString().includes(searchQuery)
        : true)
    );
  };

  const exportData = () => {
    const filteredData = applyFilters();
    const csvContent = [
      ["Student ID", "Name", "Email", "Course", "Department", "Year of Study"],
      ...filteredData.map(student => [
        student.student_id,
        student.name,
        student.email,
        student.course_name,
        student.department,
        student.year_of_study
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBarComponent openDrawer={drawerOpen} toggleDrawer={toggleDrawer} />
      <Box sx={{ p: 10 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Student Management</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Search by Name or ID"
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                label="Department"
              >
                <MenuItem value="">All</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select
                name="yearOfStudy"
                value={filters.yearOfStudy}
                onChange={handleFilterChange}
                label="Year"
              >
                <MenuItem value="">All</MenuItem>
                {years.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ mr: 2 }}
            >
              Add Student
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={exportData}
            >
              Export to CSV
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

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
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applyFilters().map((student) => (
                <TableRow key={student.student_id}>
                  <TableCell>{student.student_id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.course_name}</TableCell>
                  <TableCell>{student.department}</TableCell>
                  <TableCell>{student.year_of_study}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(student)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteStudent(student.student_id)} color="secondary">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{isEditMode ? 'Edit Student' : 'Add Student'}</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Name"
              name="name"
              value={newStudent.name}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Email"
              name="email"
              type="email"
              value={newStudent.email}
              onChange={handleChange}
              fullWidth
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Course</InputLabel>
              <Select
                name="course_id"
                value={newStudent.course_id}
                onChange={handleChange}
                label="Course"
                required
              >
                {courses.map((course) => (
                  <MenuItem key={course.course_id} value={course.course_id}>
                    {course.course_name} ({course.course_code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                value={newStudent.department}
                onChange={handleChange}
                label="Department"
                required
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Year of Study</InputLabel>
              <Select
                name="year_of_study"
                value={newStudent.year_of_study}
                onChange={handleChange}
                label="Year of Study"
                required
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveStudent} variant="contained">
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
          <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
        </Snackbar>
      </Box>
    </div>
  );
};

export default StudentManagement;