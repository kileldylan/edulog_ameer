import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, 
  Paper, Avatar, CircularProgress, Alert,
  Grid, Card, CardContent, Divider
} from '@mui/material';
import { Person, Email, Lock, Save, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axios/axiosInstance';
import AppBarComponent from './CustomAppBar';

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axiosInstance.get('/admin/profile');
        setProfile({
          name: response.data.data.name,
          email: response.data.data.email,
          role: response.data.data.role
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const updateData = {
        email: profile.email,
        ...(password && { password }) // Only include password if provided
      };

      const response = await axiosInstance.put('/admin/profile', updateData);
      
      setSuccess(response.data.message || 'Profile updated successfully');
      setPassword('');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleDrawer = () => {
setDrawerOpen(!drawerOpen);
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
      <AppBarComponent openDrawer={drawerOpen} toggleDrawer={toggleDrawer} />
      <Box sx={{ p: 3, mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Admin Profile
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  fontSize: 40,
                  mb: 2,
                  mx: 'auto'
                }}
              >
                {profile.name.charAt(0)}
              </Avatar>
              <Typography variant="h6">{profile.name}</Typography>
              <Typography color="text.secondary">{profile.role}</Typography>
              
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                startIcon={<Edit />}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={profile.name}
                      disabled
                      InputProps={{
                        startAdornment: <Person sx={{ mr: 1 }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      required
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1 }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Role"
                      value={profile.role}
                      disabled
                    />
                  </Grid>
                  
                  {isEditing && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                          startAdornment: <Lock sx={{ mr: 1 }} />
                        }}
                        helperText="Leave blank to keep current password"
                      />
                    </Grid>
                  )}
                </Grid>

                {isEditing && (
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      type="submit"
                      disabled={loading}
                      startIcon={<Save />}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default AdminProfile;