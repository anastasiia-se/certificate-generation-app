import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
import Header from './components/Header';
import CertificateForm from './components/CertificateForm';
import CertificateHistory from './components/CertificateHistory';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
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
      <div className="App">
        <Header />
        <Container maxWidth="lg">
          <CertificateForm onCertificateGenerated={handleCertificateGenerated} />
          <CertificateHistory refreshTrigger={refreshTrigger} />
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
