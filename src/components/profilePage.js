import React, { useState } from 'react';
import { Avatar, Box, Drawer, List, ListItem, ListItemText, Button, Card, CardContent, CardHeader, Divider, Grid , TextField, Typography } from '@mui/material';
import { Save } from '@mui/icons-material';
import AppBarComponent from './CustomAppBar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState({
    user_id: 8,  // Example user_id
    name: 'Amir Swalleh',
    email: 'amirS@gmail.com',
    role: 'admin',
    profileImage: 'https://www.w3schools.com/w3images/avatar2.png',
  });

  // Toggle edit mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminData({ ...adminData, [name]: value });
  };

  const handleSave = () => {
    axios.put(`http://localhost:5000/api/profileRoutes/update-profile/${adminData.user_id}`, {
      username: adminData.name,
      email: adminData.email,
      role: adminData.role,
    })
    .then(response => {
      console.log(response.data.message);
      setIsEditing(false);
    })
    .catch(error => {
      console.error('Error updating profile:', error);
    });
  };

  const handleNavigation = (path) => {
    setDrawerOpen(false);
    navigate(path);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
    <AppBarComponent openDrawer={drawerOpen} toggleDrawer={toggleDrawer} />
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ paddingTop: '80px', paddingLeft: 3, paddingRight: 3 }}>
        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ maxWidth: 345, boxShadow: 3 }}>
              <CardHeader
                avatar={<Avatar alt="Admin Profile" src={adminData.profileImage} sx={{ width: 100, height: 100 }} />}
                title={adminData.name}
                subheader={adminData.role}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {adminData.bio}
                </Typography>
                <Button variant="outlined" color="primary" fullWidth onClick={toggleEdit}>
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={8}>
            <Card sx={{ boxShadow: 3 }}>
              <CardHeader title="Profile Details" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Full Name"
                      name="name"
                      value={adminData.name}
                      onChange={handleInputChange}
                      fullWidth
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Email"
                      name="email"
                      value={adminData.email}
                      onChange={handleInputChange}
                      fullWidth
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Role"
                      name="role"
                      value={adminData.role}
                      onChange={handleInputChange}
                      fullWidth
                      disabled={!isEditing}
                    />
                  </Grid>
                </Grid>
              </CardContent>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 2 }}>
                {isEditing ? (
                  <Button variant="contained" color="primary" onClick={handleSave} startIcon={<Save />}>
                    Save Changes
                  </Button>
                ) : (
                  <Button variant="outlined" color="secondary" onClick={toggleEdit}>
                    Edit
                  </Button>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </div>
    </>
  );
};

export default ProfilePage;
