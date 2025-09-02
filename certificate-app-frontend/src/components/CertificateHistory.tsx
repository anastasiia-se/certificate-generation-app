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
  Tooltip,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import { CertificateRecord } from '../types/Certificate';
import { certificateAPI } from '../services/api';

interface CertificateHistoryProps {
  refreshTrigger?: number;
}

const CertificateHistory: React.FC<CertificateHistoryProps> = ({ refreshTrigger }) => {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diplomaToDelete, setDiplomaToDelete] = useState<CertificateRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const data = await certificateAPI.getCertificateHistory();
      setCertificates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch diploma history:', error);
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
      a.download = `diploma_${name}_${surname}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download diploma:', error);
      alert('Failed to download diploma. Please try again.');
    }
  };

  const handleDeleteClick = (diploma: CertificateRecord) => {
    setDiplomaToDelete(diploma);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!diplomaToDelete) return;

    setDeleting(true);
    try {
      await certificateAPI.deleteDiploma(diplomaToDelete.certificateId);
      
      // Remove the diploma from the local state
      setCertificates(prev => prev.filter(cert => cert.certificateId !== diplomaToDelete.certificateId));
      
      setDeleteDialogOpen(false);
      setDiplomaToDelete(null);
    } catch (error) {
      console.error('Failed to delete diploma:', error);
      alert('Failed to delete diploma. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDiplomaToDelete(null);
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
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mt: 4,
        border: '1px solid #E0E0E0',
        borderTop: '4px solid #FF5F00',
        borderRadius: 2,
        background: 'white',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box 
            sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#FFF5F2',
            }}
          >
            <SchoolIcon sx={{ fontSize: 24, color: '#FF5F00' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 500, color: '#2C2C2C' }}>
            Diploma History
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton 
            onClick={fetchCertificates} 
            disabled={loading}
            sx={{ 
              color: '#FF5F00',
              '&:hover': {
                backgroundColor: '#FFF5F2',
              }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
              <TableCell sx={{ fontWeight: 600, color: '#2C2C2C' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#2C2C2C' }}>Recipient Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#2C2C2C' }}>Manager Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#2C2C2C' }}>Completion Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#2C2C2C' }}>Sent Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#2C2C2C' }}>Email Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: '#2C2C2C' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={30} />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Loading diplomas...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : certificates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No diplomas have been generated yet
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Download Diploma">
                        <IconButton
                          onClick={() => handleDownload(cert.certificateId, cert.name, cert.surname)}
                          size="small"
                          color="primary"
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Diploma">
                        <IconButton
                          onClick={() => handleDeleteClick(cert)}
                          size="small"
                          sx={{ 
                            color: '#DC3545',
                            '&:hover': {
                              backgroundColor: '#FFF5F5',
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#DC3545', fontWeight: 600 }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this diploma?
          </DialogContentText>
          {diplomaToDelete && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#F8F9FA', borderRadius: 1 }}>
              <Typography variant="body2"><strong>Recipient:</strong> {diplomaToDelete.name} {diplomaToDelete.surname}</Typography>
              <Typography variant="body2"><strong>Diploma ID:</strong> {diplomaToDelete.certificateId}</Typography>
              <Typography variant="body2"><strong>Completion Date:</strong> {formatDate(diplomaToDelete.completionDate)}</Typography>
            </Box>
          )}
          <DialogContentText sx={{ mt: 2, color: '#DC3545', fontSize: '0.9rem' }}>
            <strong>Warning:</strong> This action cannot be undone. The diploma record and PDF file will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel}
            disabled={deleting}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            disabled={deleting}
            variant="contained"
            sx={{ 
              backgroundColor: '#DC3545',
              '&:hover': {
                backgroundColor: '#C82333',
              }
            }}
          >
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CertificateHistory;