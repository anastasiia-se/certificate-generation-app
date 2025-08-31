import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { CertificateRecord } from '../types/Certificate';
import { certificateAPI } from '../services/api';

interface CertificateHistoryProps {
  refreshTrigger?: number;
}

const CertificateHistory: React.FC<CertificateHistoryProps> = ({ refreshTrigger }) => {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const data = await certificateAPI.getCertificateHistory();
      setCertificates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch certificate history:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [refreshTrigger]);

  const handleDownload = async (certificateId: string, name: string, surname: string) => {
    try {
      const blob = await certificateAPI.downloadCertificate(certificateId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${name}_${surname}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download certificate:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h5" gutterBottom>
          Certificate History
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchCertificates} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Recipient Email</TableCell>
              <TableCell>Manager Email</TableCell>
              <TableCell>Completion Date</TableCell>
              <TableCell>Sent Date</TableCell>
              <TableCell>Email Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certificates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No certificates have been generated yet
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              certificates.map((cert) => (
                <TableRow key={cert.certificateId}>
                  <TableCell>{`${cert.name} ${cert.surname}`}</TableCell>
                  <TableCell>{cert.recipientEmail}</TableCell>
                  <TableCell>{cert.managerEmail}</TableCell>
                  <TableCell>{formatDate(cert.completionDate)}</TableCell>
                  <TableCell>{formatDate(cert.sentDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={cert.emailSent ? 'Sent' : 'Pending'}
                      color={cert.emailSent ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="PDF download coming soon">
                      <span>
                        <IconButton
                          disabled
                          size="small"
                        >
                          <DownloadIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default CertificateHistory;