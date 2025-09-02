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
import SendIcon from '@mui/icons-material/Send';
import { CertificateData } from '../types/Certificate';
import { certificateAPI } from '../services/api';

interface CertificateFormProps {
  onCertificateGenerated?: () => void;
}

const CertificateForm: React.FC<CertificateFormProps> = ({ onCertificateGenerated }) => {
  const [formData, setFormData] = useState<CertificateData>({
    name: '',
    surname: '',
    recipientEmail: '',
    managerEmail: '',
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
        let successMessage = `Diploma generated successfully! Diploma ID: ${response.certificateId}`;
        if (response.emailSent) {
          successMessage += ' - Emails have been sent to recipients';
        }
        setSuccess(successMessage);
        // Don't try to open certificate URL until PDF generation is implemented
        // if (response.certificateUrl) {
        //   window.open(response.certificateUrl, '_blank');
        // }
        // Trigger refresh of certificate history
        if (onCertificateGenerated) {
          onCertificateGenerated();
        }
        // Clear form after successful submission
        setFormData({
          name: '',
          surname: '',
          recipientEmail: '',
          managerEmail: '',
          completionDate: new Date().toISOString().split('T')[0]
        });
      } else {
        setError(response.message || 'Failed to generate certificate');
      }
    } catch (err) {
      setError('An error occurred while generating the certificate');
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
        borderTop: '4px solid #FF6B35',
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
          <WorkspacePremiumIcon sx={{ fontSize: 32, color: '#FF6B35' }} />
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
            label="Recipient Email"
            name="recipientEmail"
            type="email"
            value={formData.recipientEmail}
            onChange={handleChange}
            required
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label="Manager Email"
            name="managerEmail"
            type="email"
            value={formData.managerEmail}
            onChange={handleChange}
            required
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label="Completion Date"
            name="completionDate"
            type="date"
            value={formData.completionDate}
            onChange={handleChange}
            required
            variant="outlined"
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
            startIcon={!loading && <SendIcon />}
            sx={{ 
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 500,
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #E55100 0%, #FF6B35 100%)',
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Diploma'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default CertificateForm;