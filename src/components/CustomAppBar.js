import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Menu, 
  MenuItem, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Avatar,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Assignment as ReportsIcon,
  School as StudentsIcon,
  Class as SessionsIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  zIndex: theme.zIndex.drawer + 1
}));

const AppBarComponent = ({ openDrawer, toggleDrawer }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = React.useState(null);
  const navigate = useNavigate();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchorEl(null);
  };

  const handleNavigation = (path) => {
    toggleDrawer();
    navigate(path);
  };

  const handleLogout = () => {
    handleMenuClose();
    // Add logout logic here
    navigate('/');
  };
  return (
    <>
      <StyledAppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Edulog Admin Portal
          </Typography>
          
          <div>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }} src="/path-to-user-avatar.jpg">
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
          </div>
        </Toolbar>
      </StyledAppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error' }} />
        </MenuItem>
      </Menu>

      {/* Side Drawer */}
      <Drawer
        anchor="left"
        open={openDrawer}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button onClick={() => handleNavigation('/adminHome')}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          
          <ListItem button onClick={() => handleNavigation('/studentsManagement')}>
            <ListItemIcon><StudentsIcon /></ListItemIcon>
            <ListItemText primary="Students" />
          </ListItem>
          <ListItem button onClick={() => handleNavigation('/teachers')}>
            <ListItemIcon><ReportsIcon /></ListItemIcon>
            <ListItemText primary="Teachers" />
          </ListItem>
          <ListItem button onClick={() => handleNavigation('/courses')}>
            <ListItemIcon><ReportsIcon /></ListItemIcon>
            <ListItemText primary="Courses" />
          </ListItem>
          <ListItem button onClick={() => handleNavigation('/sessionManagement')}>
            <ListItemIcon><SessionsIcon /></ListItemIcon>
            <ListItemText primary="Sessions" />
          </ListItem>
          
          <ListItem button onClick={() => handleNavigation('/attendance')}>
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Attendance" />
          </ListItem>
          
          <ListItem button onClick={() => handleNavigation('/reports')}>
            <ListItemIcon><ReportsIcon /></ListItemIcon>
            <ListItemText primary="Reports" />
          </ListItem>
          
          <ListItem button onClick={() => handleNavigation('/calendarPage')}>
            <ListItemIcon><CalendarIcon /></ListItemIcon>
            <ListItemText primary="Calendar" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default AppBarComponent;