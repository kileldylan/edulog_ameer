import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, Box, Grid, Typography, 
  Radio, RadioGroup, FormControlLabel, FormControl,
  InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    department: '',
    course_id: '',
    year_of_study: 1
  });
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch courses when userType changes
  useEffect(() => {
    if (userType === 'student') {
      setCoursesLoading(true);
      axios.get('http://localhost:5000/api/student/courses/all')
        .then(res => {
          // Ensure we're getting the data array from the response
          const coursesData = res.data?.data || [];
          if (Array.isArray(coursesData)) {
            setCourses(coursesData);
          } else {
            console.error('Unexpected courses format:', res.data);
            setCourses([]);
          }
        })
        .catch(err => {
          console.error('Failed to fetch courses:', err);
          setError('Failed to load courses. Please try again.');
          setCourses([]);
        })
        .finally(() => setCoursesLoading(false));
    } else {
      setCourses([]);
    }
  }, [userType]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const endpoint = '/api/register'; // Unified endpoint
      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        ...formData,
        role: userType
      });

      if (response.data.success) {
        setSuccessMessage('Registration successful!');
        setTimeout(() => navigate('/'), 1000);
        setFormData({
          username: '',
          email: '',
          password: '',
          name: '',
          department: '',
          course_id: '',
          year_of_study: 1
        });
      } else {
        setError(response.data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ width: 400, mx: 'auto', mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom textAlign="center">
        <PersonAddIcon /> Register
      </Typography>

      {successMessage && <Typography color="success.main" textAlign="center">{successMessage}</Typography>}
      {error && <Typography color="error.main" textAlign="center">{error}</Typography>}

      <RadioGroup
        row
        value={userType}
        onChange={(e) => setUserType(e.target.value)}
        sx={{ justifyContent: 'center', mb: 3 }}
      >
        <FormControlLabel value="admin" control={<Radio />} label="Admin" />
        <FormControlLabel value="student" control={<Radio />} label="Student" />
      </RadioGroup>

      <form onSubmit={handleRegister}>
        <TextField
          label="Username"
          name="username"
          fullWidth
          margin="normal"
          value={formData.username}
          onChange={handleInputChange}
          required
        />

        <TextField
          label="Email"
          name="email"
          type="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleInputChange}
          required
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={handleInputChange}
          required
        />

        {userType === 'student' && (
          <>
            <TextField
              label="Full Name"
              name="name"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={handleInputChange}
              required
            />

            <TextField
              label="Department"
              name="department"
              fullWidth
              margin="normal"
              value={formData.department}
              onChange={handleInputChange}
              required
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Course</InputLabel>
              <Select
                name="course_id"
                value={formData.course_id}
                label="Course"
                onChange={handleInputChange}
                required
                disabled={coursesLoading}
              >
                {coursesLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading courses...
                  </MenuItem>
                ) : courses.length === 0 ? (
                  <MenuItem disabled>No courses available</MenuItem>
                ) : (
                  courses.map(course => (
                    <MenuItem key={course.course_id} value={course.course_id}>
                      {course.course_name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <TextField
              label="Year of Study"
              name="year_of_study"
              type="number"
              fullWidth
              margin="normal"
              value={formData.year_of_study}
              onChange={handleInputChange}
              inputProps={{ min: 1, max: 5 }}
            />
          </>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={isLoading || (userType === 'student' && coursesLoading)}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </Button>
      </form>

      <Grid container justifyContent="center" sx={{ mt: 2 }}>
        <Typography variant="body2">
          Already have an account?{' '}
          <Link to="/" style={{ color: '#1976d2' }}>
            Login
          </Link>
        </Typography>
      </Grid>
    </Box>
  );
}

export default Register;