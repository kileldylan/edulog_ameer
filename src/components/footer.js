// FooterComponent.js
import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const FooterComponent = () => {
  return (
    <AppBar position="fixed" style={{ top: 'auto', bottom: 0 }}>
      <Toolbar>
        <Typography variant="body1" style={{ flexGrow: 1 }}>
          &copy; {new Date().getFullYear()} Edulog. All rights reserved.
        </Typography>
        <Typography variant="body2">
          Privacy Policy | Terms of Service
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default FooterComponent;
