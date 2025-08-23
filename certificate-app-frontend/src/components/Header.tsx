import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const Header: React.FC = () => {
  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        <SchoolIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Certificate Generation System
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2">
            Powered by Azure Functions
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;