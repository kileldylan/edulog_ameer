import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Snackbar,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfileContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2rem',
  backgroundColor: '#f4f6f8',
  minHeight: '100vh',
});

const ProfileField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: '100%',
}));

const StudentProfile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const navigate = useNavigate();

  const student_id = localStorage.getItem('student_id');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/students/${student_id}`);
        setProfileData({
          name: response.data.name,
          email: response.data.email,
        });
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        setSnackbar({
          open: true,
          message: 'Error loading profile data',
          severity: 'error',
        });
      }
    };
    fetchProfileData();
  }, [student_id]);

  const handleEditToggle = () => setEditMode(!editMode);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/students/${student_id}`, profileData);
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Profile updated successfully',
          severity: 'success',
        });
        setEditMode(false);
      }
    } catch (error) {
      console.error('Failed to save profile data:', error);
      setSnackbar({
        open: true,
        message: 'Error saving profile data',
        severity: 'error',
      });
    }
  };

  const handleSnackbarClose = () => setSnackbar((prev) => ({ ...prev, open: false }));

  return (
    <ProfileContainer>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Profile
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/studentHome')}>
            <HomeIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Card sx={{ maxWidth: 600, width: '100%', mt: 8 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            {editMode ? 'Edit Profile' : 'Your Profile'}
          </Typography>

          <ProfileField
            name="name"
            label="Full Name"
            variant="outlined"
            value={profileData.name}
            onChange={handleInputChange}
            disabled={!editMode}
          />

          <ProfileField
            name="email"
            label="Email"
            variant="outlined"
            value={profileData.email}
            onChange={handleInputChange}
            disabled={!editMode}
          />

          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                onClick={editMode ? handleSave : handleEditToggle}
              >
                {editMode ? 'Save' : 'Edit Profile'}
              </Button>
            </Grid>
            {editMode && (
              <Grid item>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleEditToggle}
                >
                  Cancel
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        ContentProps={{
          'aria-describedby': 'message-id',
          style: { backgroundColor: snackbar.severity === 'success' ? '#4caf50' : '#f44336' },
        }}
      />
    </ProfileContainer>
  );
};

export default StudentProfile;
