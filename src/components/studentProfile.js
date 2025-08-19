import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, 
  Paper, Avatar, CircularProgress, Alert
} from '@mui/material';
import { Person, Email, Lock } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import StudentNavbar from './studentNavbar';
import { getToken } from '../axios/auth';
import axiosInstance from '../axios/axiosInstance';

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    department: '',
    year_of_study: ''
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const { student_id } = useParams();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = getToken();
        if (!token) {
          throw new Error('Authentication token missing');
        }
        
        const response = await axiosInstance.get('/student/dashboard');
        
        // Check if data exists and has the expected structure
        if (response.data.success && response.data.data?.student) {
          setProfile({
            name: response.data.data.student.name || '',
            email: response.data.data.student.email || '',
            department: response.data.data.student.department || '',
            year_of_study: response.data.data.student.year_of_study || ''
          });
        } else {
          throw new Error('Invalid profile data structure');
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load profile');
        console.error('Profile error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [student_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await axiosInstance.put('/student/profile', {
        email: profile.email,
        password: password || undefined
      });
      
      setSuccess('Profile updated successfully');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile.name) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <StudentNavbar />
      <Box sx={{ p: 3, mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        
        <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Avatar sx={{ width: 100, height: 100, fontSize: 40 }}>
              {profile.name.charAt(0) || 'S'}
            </Avatar>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Name"
              value={profile.name}
              disabled
              InputProps={{
                startAdornment: <Person sx={{ mr: 1 }} />
              }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              required
              InputProps={{
                startAdornment: <Email sx={{ mr: 1 }} />
              }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Department"
              value={profile.department}
              disabled
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Year of Study"
              value={profile.year_of_study}
              disabled
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1 }} />
              }}
              helperText="Leave blank to keep current password"
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                type="submit"
                disabled={loading}
                sx={{ mr: 2 }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outlined"
                onClick={() => navigate('/student/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </>
  );
};

export default StudentProfile;