import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, FormControl, InputLabel, Select,
  MenuItem, Snackbar, Alert
} from '@mui/material';
import { Download } from '@mui/icons-material';
import axiosInstance from '../axios/axiosInstance';
import AppBarComponent from './CustomAppBar';

const roles = ['student', 'teacher', 'admin'];
const statuses = ['Present', 'Absent'];
const courses = ['Computer Science', 'Mathematics', 'Physics', 'Business', 'Arts']; // Adjust based on your database

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    roleFilter: '',
    courseFilter: '',
    statusFilter: '',
    studentNameFilter: ''
  });
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      const response = await axiosInstance.get('/reports', {
        params: filters
      });
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching reports:', error.response || error);
      setError('Failed to load reports: ' + (error.response?.data?.error || error.message));
      setReports([]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const exportData = () => {
    const csvContent = [
      ["Report ID", "Date", "User ID", "User Name", "Role", "Category", "Amount", "Description", "Attendance Status", "Course", "Student Name"],
      ...reports.map(report => [
        report.report_id,
        report.date,
        report.user_id,
        report.user_name,
        report.role,
        report.category,
        report.amount,
        report.description || '',
        report.status || '',
        report.course || '',
        report.student_name || ''
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reports_data.csv';
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
        <Typography variant="h4" sx={{ mb: 3 }}>Reports</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Start Date"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
            <TextField
              label="End Date"
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                name="roleFilter"
                value={filters.roleFilter}
                onChange={handleFilterChange}
                label="Role"
              >
                <MenuItem value="">All</MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Course</InputLabel>
              <Select
                name="courseFilter"
                value={filters.courseFilter}
                onChange={handleFilterChange}
                label="Course"
              >
                <MenuItem value="">All</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course} value={course}>{course}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="statusFilter"
                value={filters.statusFilter}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Student Name"
              name="studentNameFilter"
              value={filters.studentNameFilter}
              onChange={handleFilterChange}
              variant="outlined"
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={exportData}
          >
            Export to CSV
          </Button>
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
                <TableCell>Report ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>User Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Attendance Status</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Student Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.report_id}>
                  <TableCell>{report.report_id}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>{report.user_id}</TableCell>
                  <TableCell>{report.user_name}</TableCell>
                  <TableCell>{report.role}</TableCell>
                  <TableCell>{report.category}</TableCell>
                  <TableCell>{report.amount}</TableCell>
                  <TableCell>{report.description || '-'}</TableCell>
                  <TableCell>{report.status || '-'}</TableCell>
                  <TableCell>{report.course || '-'}</TableCell>
                  <TableCell>{report.student_name || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
          <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
        </Snackbar>
      </Box>
    </div>
  );
};

export default Reports;