import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, 
  Paper, Avatar, CircularProgress, Alert
} from '@mui/material';
import { Person, Email, Phone, Lock } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import StudentNavbar from './studentNavbar';

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
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
        const response = await axios.get(`http://localhost:5000/api/student/dashboard`);
        setProfile(response.data.student);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load profile');
        console.error('Profile error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [student_id]);

  // For updating profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/student/profile/${student_id}`, {
        email: profile.email,
        phone: profile.phone,
        password: password || undefined
      });
      setSuccess('Profile updated successfully');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      setSuccess(null);
    }
  };

  if (loading) {
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
              {profile.name?.charAt(0) || 'S'}
            </Avatar>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Name"
              value={profile.name || ''}
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
              value={profile.email || ''}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              required
              InputProps={{
                startAdornment: <Email sx={{ mr: 1 }} />
              }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Phone"
              type="tel"
              value={profile.phone || ''}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              required
              InputProps={{
                startAdornment: <Phone sx={{ mr: 1 }} />
              }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Department"
              value={profile.department || ''}
              disabled
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Year of Study"
              value={profile.year_of_study || ''}
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
                sx={{ mr: 2 }}
              >
                Save Changes
              </Button>
              <Button 
                variant="outlined"
                onClick={() => navigate(`/student/dashboard/${student_id}`)}
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