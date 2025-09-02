import React from 'react';
import { AppBar, Toolbar, Typography, Box, Chip } from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const Header: React.FC = () => {
  return (
    <AppBar 
      position="static" 
      sx={{ 
        mb: 4,
        background: 'white',
        borderBottom: '3px solid #FF6B35',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <img 
            src="/swedbank-logo.png" 
            alt="Swedbank" 
            style={{ height: 40, marginRight: 20 }}
          />
          <Box sx={{ borderLeft: '2px solid #E0E0E0', pl: 2.5, ml: 1 }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                color: '#2C2C2C',
                fontWeight: 500,
                fontSize: '1.1rem'
              }}
            >
              Gen AI Training Program
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#666666',
                fontSize: '0.75rem'
              }}
            >
              Diploma Generation System
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WorkspacePremiumIcon sx={{ color: '#FF6B35' }} />
          <Chip 
            label="Professional Certification" 
            size="small"
            sx={{ 
              backgroundColor: '#FFF5F2',
              color: '#FF6B35',
              fontWeight: 500
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;