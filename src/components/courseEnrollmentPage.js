import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import StudentNavbar from './studentNavbar';
import CourseList from './courseList';

const CourseEnrollmentPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <>
      <StudentNavbar />
      <Box sx={{ p: 3, mt: 8 }}>
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab label="Available Courses" />
            <Tab label="Enrolled Courses" />
          </Tabs>
        </Paper>
        
        {tabValue === 0 ? (
          <CourseList type="available" />
        ) : (
          <CourseList type="enrolled" />
        )}
      </Box>
    </>
  );
};

export default CourseEnrollmentPage;