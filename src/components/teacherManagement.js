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

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/teachers');
      setTeachers(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch teachers', 'error');
    }
  };

  const handleOpenDialog = (teacher = null) => {
    setCurrentTeacher(teacher || {
      name: '',
      email: '',
      department: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTeacher(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentTeacher(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (currentTeacher.teacher_id) {
        await axios.put(`http://localhost:5000/api/admin/teachers/${currentTeacher.teacher_id}`, currentTeacher);
        showSnackbar('Teacher updated successfully', 'success');
      } else {
        await axios.post('http://localhost:5000/api/admin/teachers', currentTeacher);
        showSnackbar('Teacher created successfully', 'success');
      }
      fetchTeachers();
      handleCloseDialog();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Error saving teacher', 'error');
    }
  };

  const handleDelete = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/teachers/${teacherId}`);
        showSnackbar('Teacher deleted successfully', 'success');
        fetchTeachers();
      } catch (error) {
        showSnackbar('Error deleting teacher', 'error');
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
          <Typography variant="h4">Teacher Management</Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Teacher
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.teacher_id}>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.department}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(teacher)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(teacher.teacher_id)} color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Teacher Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {currentTeacher?.teacher_id ? 'Edit Teacher' : 'Add New Teacher'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Name"
                  name="name"
                  value={currentTeacher?.name || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  name="email"
                  type="email"
                  value={currentTeacher?.email || ''}
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
                  value={currentTeacher?.department || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {currentTeacher?.teacher_id ? 'Update' : 'Create'}
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

export default TeacherManagement;