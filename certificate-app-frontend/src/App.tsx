import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
import Header from './components/Header';
import CertificateForm from './components/CertificateForm';
import CertificateHistory from './components/CertificateHistory';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B35', // Swedbank orange
      light: '#FF8F65',
      dark: '#E55100',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4CAF50', // Green for nature/oak theme
      light: '#66BB6A',
      dark: '#388E3C',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C2C2C',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    h4: {
      fontWeight: 600,
      color: '#2C2C2C',
    },
    h5: {
      fontWeight: 500,
      color: '#2C2C2C',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 6,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#FF6B35',
            },
          },
        },
      },
    },
  },
});

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCertificateGenerated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        className="App"
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #FAFAFA 0%, #F0F0F0 100%)',
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
        <Header />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pb: 6 }}>
          <CertificateForm onCertificateGenerated={handleCertificateGenerated} />
          <CertificateHistory refreshTrigger={refreshTrigger} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
// Updated for Standard tier deployment
