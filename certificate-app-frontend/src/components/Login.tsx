import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const CORRECT_PASSWORD = 'GenAITraining2025';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    if (password === CORRECT_PASSWORD) {
      localStorage.setItem('swedbank_auth', 'authenticated');
      onLogin();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
    
    setLoading(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAFAFA 0%, #F0F0F0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/oak-leaves-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.03,
          zIndex: 0,
        }
      }}
    >
      <Paper 
        elevation={0}
        sx={{
          p: 6,
          maxWidth: 400,
          width: '100%',
          mx: 2,
          border: '1px solid #E0E0E0',
          borderTop: '4px solid #FF5F00',
          borderRadius: 2,
          background: 'white',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header with Swedbank branding */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <img 
            src="/swedbank-logo.png" 
            alt="Swedbank" 
            style={{ height: 50, marginBottom: 20 }}
          />
          <Box 
            sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: '#FFF5F2',
              mb: 2
            }}
          >
            <LockOutlined sx={{ fontSize: 32, color: '#FF5F00' }} />
          </Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: '#2C2C2C' }}>
            Access Required
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Gen AI Training for Technical Professionals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please enter the access password to continue
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              '& .MuiAlert-message': {
                fontSize: '0.95rem'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Access Password"
            value={password}
            onChange={handlePasswordChange}
            required
            variant="outlined"
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: '#FF5F00' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || !password.trim()}
            sx={{ 
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 500,
              background: 'linear-gradient(135deg, #FF5F00 0%, #FF8533 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #CC4C00 0%, #FF5F00 100%)',
              },
              '&:disabled': {
                background: '#E0E0E0',
                color: '#999999',
              }
            }}
          >
            {loading ? 'Accessing...' : 'Access System'}
          </Button>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Authorized personnel only • Swedbank Internal System
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;