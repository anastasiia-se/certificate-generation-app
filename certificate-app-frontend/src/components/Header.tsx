import React from 'react';
import { AppBar, Toolbar, Typography, Box, Chip, IconButton, Tooltip } from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';

interface HeaderProps {
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  
  const handleLogout = () => {
    localStorage.removeItem('swedbank_auth');
    if (onLogout) {
      onLogout();
    }
  };
  return (
    <Box>
      {/* Oak leaves strip at the very top */}
      <Box
        sx={{
          height: '57px', // 2cm in pixels (approximately)
          backgroundImage: 'url(/oak-leaves-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <AppBar 
        position="static" 
        sx={{ 
          mb: 4,
          background: 'white',
          borderBottom: '3px solid #FF5F00',
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
              Gen AI Training for Technical Professionals
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
          <WorkspacePremiumIcon sx={{ color: '#FF5F00' }} />
          <Chip 
            label="Professional Training" 
            size="small"
            sx={{ 
              backgroundColor: '#FFF5F2',
              color: '#FF5F00',
              fontWeight: 500
            }}
          />
          {onLogout && (
            <Tooltip title="Logout">
              <IconButton
                onClick={handleLogout}
                sx={{
                  color: '#666666',
                  '&:hover': {
                    backgroundColor: '#FFF5F2',
                    color: '#FF5F00',
                  }
                }}
              >
                <LogoutOutlined />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Toolbar>
    </AppBar>
    </Box>
  );
};

export default Header;