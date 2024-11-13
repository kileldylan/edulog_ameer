import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Menu, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Example profile icon
import { useNavigate } from 'react-router-dom';

const AppBarComponent = ({ openDrawer, toggleDrawer }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate(); // Initialize useNavigate for routing

  // Handle menu dropdown for profile/logout
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    navigate('/'); // Redirect to login page
  };

  // Handle navigation when clicking on menu items
  const handleNavigation = (path) => {
    toggleDrawer(); // Close the drawer when navigating
    navigate(path);  // Navigate to the selected path
  };

  return (
    <>
      {/* AppBar */}
      <AppBar position="sticky" style={{ background: '#333', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)' }}>
      <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Admin Portal
          </Typography>
          <div>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="account of current user"
              onClick={handleMenu}
            >
            <IconButton color="inherit" onClick={() => navigate('/profile')}>
                <AccountCircleIcon />
            </IconButton>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer
        anchor="left"
        open={openDrawer} // Drawer open state controlled by parent component
        onClose={toggleDrawer} // Close drawer when clicking outside
      >
        <List>
          <ListItem button={true} onClick={() => handleNavigation('/adminHome')}>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button={true} onClick={() => handleNavigation('/attendance')}>
            <ListItemText primary="Attendance Records" />
          </ListItem>
          <ListItem button={true} onClick={() => handleNavigation('/studentsManagement')}>
            <ListItemText primary="Students" />
          </ListItem>
          <ListItem button={true} onClick={() => handleNavigation('/reports')}>
            <ListItemText primary="Reports" />
          </ListItem>
          <ListItem button={true} onClick={() => handleNavigation('/calendarPage')}>
            <ListItemText primary="Calendar" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default AppBarComponent;
