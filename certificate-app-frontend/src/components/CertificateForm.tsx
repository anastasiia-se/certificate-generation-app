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
        let successMessage = 'Certificate generated successfully!';
        if (response.emailSent) {
          successMessage += ' Emails have been sent to the recipient and manager.';
        }
        setSuccess(successMessage);
        if (response.certificateUrl) {
          window.open(response.certificateUrl, '_blank');
        }
        // Trigger refresh of certificate history
        if (onCertificateGenerated) {
          onCertificateGenerated();
        }
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
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Generate Certificate
      </Typography>
      
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
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Certificate'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default CertificateForm;