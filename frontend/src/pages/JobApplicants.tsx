import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { jobService } from '../services/api';

const JobApplicants: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobAndApplicants();
  }, [id]);

  const fetchJobAndApplicants = async () => {
    try {
      setLoading(true);
      const response = await jobService.getById(id!);
      const jobData = response.data.data;
      setJob(jobData);
      
      // Fetch applications for this job
      const applicationsResponse = await jobService.getApplicants(id!);
      setApplicants(applicationsResponse.data.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/jobs/my-jobs')}
          sx={{ mt: 2 }}
        >
          Back to My Jobs
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/jobs/my-jobs')}
            sx={{ 
              textTransform: 'none',
            }}
          >
            Back
          </Button>
        </Box>

        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600,
            color: '#1a1a2e',
            mb: 1,
          }}
        >
          {job?.title}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
          >
            {applicants.length} {applicants.length === 1 ? 'Applicant' : 'Applicants'}
          </Typography>
          <Chip 
            label={job?.company} 
            size="small"
            sx={{ 
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              fontWeight: 600
            }}
          />
        </Box>

        {applicants.length === 0 ? (
          <Box
            sx={{
              mt: 8,
              mb: 8,
              p: 6,
              textAlign: 'center',
              backgroundColor: 'background.default',
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h5"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              No applicants yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Be patient, applications will appear here once candidates apply for your job.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Applied On</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Cover Letter</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applicants.map((applicant, index) => (
                  <TableRow 
                    key={applicant._id || index}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f9f9f9' },
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {applicant.firstName} {applicant.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {applicant.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {applicant.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(applicant.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {applicant.coverLetter ? (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: '300px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                          title={applicant.coverLetter}
                        >
                          {applicant.coverLetter}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          No cover letter
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default JobApplicants;
