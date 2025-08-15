import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, IconButton, Button, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, 
  Snackbar, Alert, Grid
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import AppBarComponent from './CustomAppBar';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/courses');
      setCourses(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch courses', 'error');
    }
  };

  const handleOpenDialog = (course = null) => {
    setCurrentCourse(course || {
      course_code: '',
      course_name: '',
      department: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCourse(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (currentCourse.course_id) {
        await axios.put(`http://localhost:5000/api/admin/courses/${currentCourse.course_id}`, currentCourse);
        showSnackbar('Course updated successfully', 'success');
      } else {
        await axios.post('http://localhost:5000/api/admin/courses', currentCourse);
        showSnackbar('Course created successfully', 'success');
      }
      fetchCourses();
      handleCloseDialog();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Error saving course', 'error');
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/courses/${courseId}`);
        showSnackbar('Course deleted successfully', 'success');
        fetchCourses();
      } catch (error) {
        showSnackbar('Error deleting course', 'error');
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

  return (
    <>
      <AppBarComponent openDrawer={drawerOpen} toggleDrawer={toggleDrawer} />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Course Management</Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Course
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course Code</TableCell>
                <TableCell>Course Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.course_id}>
                  <TableCell>{course.course_code}</TableCell>
                  <TableCell>{course.course_name}</TableCell>
                  <TableCell>{course.department}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(course)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(course.course_id)} color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Course Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {currentCourse?.course_id ? 'Edit Course' : 'Add New Course'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Course Code"
                  name="course_code"
                  value={currentCourse?.course_code || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Course Name"
                  name="course_name"
                  value={currentCourse?.course_name || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Department"
                  name="department"
                  value={currentCourse?.department || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {currentCourse?.course_id ? 'Update' : 'Create'}
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
    </>
  );
};

export default CourseManagement;