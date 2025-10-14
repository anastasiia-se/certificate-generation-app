import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  LinearProgress,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import Papa from 'papaparse';
import { certificateAPI } from '../services/api';

interface CsvRow {
  Name: string;
  Surname: string;
}

interface DiplomaEntry {
  name: string;
  surname: string;
  completionDate: string;
  status?: 'pending' | 'success' | 'error' | 'duplicate';
  error?: string;
  duplicateCount?: number;
}

interface BatchCertificateUploadProps {
  onBatchComplete?: () => void;
}

const BatchCertificateUpload: React.FC<BatchCertificateUploadProps> = ({ onBatchComplete }) => {
  const [diplomas, setDiplomas] = useState<DiplomaEntry[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ successful: number; failed: number } | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSummary(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedDiplomas: DiplomaEntry[] = results.data.map((row: any) => {
            const csvRow = row as CsvRow;

            if (!csvRow.Name || !csvRow.Surname) {
              throw new Error('CSV must contain Name and Surname columns');
            }

            return {
              name: csvRow.Name.trim(),
              surname: csvRow.Surname.trim(),
              completionDate: new Date().toISOString().split('T')[0],
              status: 'pending' as const
            };
          });

          if (parsedDiplomas.length === 0) {
            setError('No valid entries found in CSV file');
            return;
          }

          // Check for duplicates for each entry
          const diplomasWithDuplicateCheck = await Promise.all(
            parsedDiplomas.map(async (diploma) => {
              try {
                const duplicates = await certificateAPI.checkDuplicate(diploma.name, diploma.surname);
                if (duplicates.length > 0) {
                  return {
                    ...diploma,
                    status: 'duplicate' as const,
                    duplicateCount: duplicates.length
                  };
                }
                return diploma;
              } catch (err) {
                return diploma;
              }
            })
          );

          setDiplomas(diplomasWithDuplicateCheck);
        } catch (err: any) {
          setError(err.message || 'Failed to parse CSV file');
        }
      },
      error: (error) => {
        setError(`Failed to read CSV file: ${error.message}`);
      }
    });

    // Reset file input
    event.target.value = '';
  };

  const handleRemoveDiploma = (index: number) => {
    setDiplomas(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateAll = async () => {
    // Check if there are any duplicates
    const hasDuplicates = diplomas.some(d => d.status === 'duplicate');

    if (hasDuplicates) {
      const confirmGenerate = window.confirm(
        'Some entries are duplicates. Do you want to generate diplomas for ALL entries including duplicates?\n\n' +
        'Click OK to generate all (including duplicates)\n' +
        'Click Cancel to remove duplicates before generating'
      );

      if (!confirmGenerate) {
        return;
      }
    }

    setProcessing(true);
    setProgress(0);
    setSummary(null);

    let successful = 0;
    let failed = 0;

    for (let i = 0; i < diplomas.length; i++) {
      const diploma = diplomas[i];

      try {
        await certificateAPI.generateCertificate({
          name: diploma.name,
          surname: diploma.surname,
          recipientEmail: 'no-email@example.com',
          managerEmail: 'no-email@example.com',
          completionDate: diploma.completionDate
        });

        setDiplomas(prev => prev.map((d, idx) =>
          idx === i ? { ...d, status: 'success' as const } : d
        ));
        successful++;
      } catch (err: any) {
        setDiplomas(prev => prev.map((d, idx) =>
          idx === i ? { ...d, status: 'error' as const, error: err.message } : d
        ));
        failed++;
      }

      setProgress(((i + 1) / diplomas.length) * 100);

      // Small delay to avoid overwhelming the backend
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setSummary({ successful, failed });
    setProcessing(false);

    // Trigger refresh of certificate history
    if (onBatchComplete) {
      onBatchComplete();
    }
  };

  const handleClearAll = () => {
    setDiplomas([]);
    setSummary(null);
    setError(null);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        maxWidth: 800,
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
          <CloudUploadIcon sx={{ fontSize: 32, color: '#FF5F00' }} />
        </Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>
          Batch Generate Diplomas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload a CSV file to generate multiple diplomas at once
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {summary && (
        <Alert severity={summary.failed === 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
          Batch generation complete! {summary.successful} successful, {summary.failed} failed.
        </Alert>
      )}

      {diplomas.length === 0 ? (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              CSV Format:
            </Typography>
            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
              Name,Surname{'\n'}
              John,Doe{'\n'}
              Jane,Smith{'\n'}
              Michael,Johnson
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              • Diploma Issued date will be set to today's date automatically
            </Typography>
          </Alert>

          <Button
            component="label"
            variant="contained"
            fullWidth
            size="large"
            startIcon={<CloudUploadIcon />}
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
            Upload CSV File
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleFileUpload}
            />
          </Button>
        </Box>
      ) : (
        <Box>
          {diplomas.some(d => d.status === 'duplicate') && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Some entries are duplicates of existing diplomas. You can remove them individually or generate anyway when you click "Generate All".
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Preview ({diplomas.length} diploma{diplomas.length !== 1 ? 's' : ''})
            </Typography>
            <Button
              size="small"
              onClick={handleClearAll}
              disabled={processing}
            >
              Clear All
            </Button>
          </Box>

          <TableContainer sx={{ mb: 3, maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Surname</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Diploma Issued</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {diplomas.map((diploma, index) => (
                  <TableRow key={index}>
                    <TableCell>{diploma.name}</TableCell>
                    <TableCell>{diploma.surname}</TableCell>
                    <TableCell>{diploma.completionDate}</TableCell>
                    <TableCell>
                      {diploma.status === 'success' && (
                        <Chip label="Success" color="success" size="small" />
                      )}
                      {diploma.status === 'error' && (
                        <Chip label="Failed" color="error" size="small" />
                      )}
                      {diploma.status === 'duplicate' && (
                        <Chip
                          label={`Duplicate (${diploma.duplicateCount} existing)`}
                          color="warning"
                          size="small"
                        />
                      )}
                      {diploma.status === 'pending' && (
                        <Chip label="Pending" size="small" />
                      )}
                    </TableCell>                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveDiploma(index)}
                        disabled={processing}
                        sx={{
                          color: '#DC3545',
                          '&:hover': {
                            backgroundColor: '#FFF5F5',
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {processing && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Processing diplomas...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component="label"
              variant="outlined"
              fullWidth
              startIcon={<CloudUploadIcon />}
              disabled={processing}
              sx={{
                borderColor: '#FF5F00',
                color: '#FF5F00',
                '&:hover': {
                  borderColor: '#CC4C00',
                  backgroundColor: '#FFF5F2',
                }
              }}
            >
              Upload Different File
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileUpload}
              />
            </Button>

            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerateAll}
              disabled={processing || diplomas.length === 0}
              sx={{
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
              {processing ? 'Generating...' : `Generate All ${diplomas.length} Diplomas`}
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default BatchCertificateUpload;
