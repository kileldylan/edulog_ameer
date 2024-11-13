import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [userType, setUserType] = useState('student');
  const [userDetails, setUserDetails] = useState({ student_id: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
        // Prepare data based on user type
        const dataToSend = {
            username: userDetails.username,
            email: userDetails.email,
            password: userDetails.password,
            role: userType,
        };

        // Include student_id only for students
        if (userType === 'student') {
            dataToSend.student_id = userDetails.student_id;
        }

        const response = await axios.post('http://localhost:5000/api/register', dataToSend);

        console.log('Registration response:', response.data); // Log the response

        if (response.data.success) {
            setSuccessMessage('Registration successful!');
            setTimeout(() => navigate('/'), 2000); // Redirect to login after 2 seconds
        } else {
            setError('Registration failed. Please try again.');
        }

        setUserDetails({ student_id: '', username: '', email: '', password: '' });
    } catch (err) {
        console.error('Error during registration:', err); // Log any errors
        setError('Registration failed. Please try again.');
        setSuccessMessage('');
    }
  };

  return (
    <Box
      sx={{
        width: 400,
        mx: 'auto',
        mt: 8,
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
        textAlign: 'center'
      }}
    >
      <Typography variant="h5" gutterBottom>
        <PersonAddIcon /> Register
      </Typography>

      {successMessage && <Typography color="success.main">{successMessage}</Typography>}
      {error && <Typography color="error.main">{error}</Typography>}

      <RadioGroup
        row
        value={userType}
        onChange={(e) => setUserType(e.target.value)}
        sx={{ justifyContent: 'center', mb: 2 }}
      >
        <FormControlLabel value="admin" control={<Radio />} label="Admin" />
        <FormControlLabel value="student" control={<Radio />} label="Student" />
      </RadioGroup>

      {/* Conditionally render the Student ID field */}
      {userType === 'student' && (
        <TextField
          label="Student ID"
          variant="outlined"
          fullWidth
          margin="normal"
          value={userDetails.student_id}
          onChange={(e) => setUserDetails({ ...userDetails, student_id: e.target.value })}
        />
      )}

      <TextField
        label="Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={userDetails.username}
        onChange={(e) => setUserDetails({ ...userDetails, username: e.target.value })}
      />

      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={userDetails.email}
        onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
      />

      <TextField
        label="Password"
        variant="outlined"
        type="password"
        fullWidth
        margin="normal"
        value={userDetails.password}
        onChange={(e) => setUserDetails({ ...userDetails, password: e.target.value })}
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleRegister}
        sx={{ mt: 2 }}
      >
        Register
      </Button>
    </Box>
  );
}

export default Register;
