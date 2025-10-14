import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import SaveIcon from '@mui/icons-material/Save';
import { CertificateData } from '../types/Certificate';
import { certificateAPI } from '../services/api';

interface CertificateFormProps {
  onCertificateGenerated?: () => void;
}

const CertificateForm: React.FC<CertificateFormProps> = ({ onCertificateGenerated }) => {
  const [formData, setFormData] = useState<CertificateData>({
    name: '',
    surname: '',
    recipientEmail: 'no-email@example.com',
    managerEmail: 'no-email@example.com',
    completionDate: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await certificateAPI.generateCertificate(formData);
      if (response.success) {
        setSuccess(`Diploma generated and saved successfully! Diploma ID: ${response.certificateId}`);

        // Trigger refresh of certificate history
        if (onCertificateGenerated) {
          onCertificateGenerated();
        }

        // Clear form after successful submission
        setFormData({
          name: '',
          surname: '',
          recipientEmail: 'no-email@example.com',
          managerEmail: 'no-email@example.com',
          completionDate: new Date().toISOString().split('T')[0]
        });
      } else {
        setError(response.message || 'Failed to generate diploma');
      }
    } catch (err) {
      setError('An error occurred while generating the diploma');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 4, 
        maxWidth: 600, 
        mx: 'auto', 
        mt: 4,
        border: '1px solid #E0E0E0',
        borderTop: '4px solid #FF5F00',
        borderRadius: 2,
        background: 'white',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
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
          <WorkspacePremiumIcon sx={{ fontSize: 32, color: '#FF5F00' }} />
        </Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>
          Generate Diploma
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create a professional diploma for program completion
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label="Surname"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            required
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Diploma Issued"
            name="completionDate"
            type="date"
            value={formData.completionDate}
            onChange={handleChange}
            required
            variant="outlined"
            helperText="Date when the diploma is being generated (defaults to today)"
            InputLabelProps={{
              shrink: true,
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={!loading && <SaveIcon />}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 500,
              background: 'linear-gradient(135deg, #FF5F00 0%, #FF8533 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #CC4C00 0%, #FF5F00 100%)',
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate & Save Diploma'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default CertificateForm;