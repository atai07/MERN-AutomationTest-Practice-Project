import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { jobService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyJobs: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, jobId: '', jobTitle: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      // Check if user is admin and fetch appropriate data
      if (user?.role === 'admin') {
        const response = await jobService.getAllJobsAdmin();
        setJobs(response.data.data || []);
      } else {
        const response = await jobService.getMyJobs();
        setJobs(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (jobId: string, jobTitle: string) => {
    setDeleteDialog({ open: true, jobId, jobTitle });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, jobId: '', jobTitle: '' });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await jobService.delete(deleteDialog.jobId);
      setJobs(jobs.filter(job => job._id !== deleteDialog.jobId));
      closeDeleteDialog();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  const getJobStatus = (job: any) => {
    // Check if it's a draft first (draft jobs should always show as Draft)
    if (!job.isPublic) {
      return { label: 'Draft', color: 'warning' as const };
    }
    
    // Check if expired based on applicationDeadline
    if (job.applicationDeadline) {
      const deadlineDate = new Date(job.applicationDeadline);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      // Job is expired only if the deadline has passed (not including today)
      if (deadlineDate < todayStart) {
        return { label: 'Expired', color: 'default' as const };
      }
    }
    
    return { label: 'Published', color: 'success' as const };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              color: '#1a1a2e',
              mb: 2,
            }}
          >
            {isAdmin ? 'Jobs Dashboard' : 'My Jobs'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/jobs/create')}
              sx={{ 
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Post Job
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/jobs')}
              sx={{ 
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              All Jobs
            </Button>
          </Box>
        </Box>

        {jobs.length === 0 ? (
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
              You haven't posted any jobs yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Start by posting your first job!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/jobs/create')}
              sx={{ 
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Post Job
            </Button>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Job Title</TableCell>
                  {isAdmin && <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Creator</TableCell>}
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Application Deadline</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job) => {
                  const status = getJobStatus(job);
                  const isJobOwner = job.createdBy?._id === user?.id || job.createdBy === user?.id;
                  return (
                    <TableRow 
                      key={job._id}
                      sx={{ 
                        '&:hover': { backgroundColor: '#f9f9f9' },
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell>
                        <Typography
                          onClick={() => navigate(`/jobs/${job._id}`)}
                          sx={{
                            cursor: 'pointer',
                            color: '#1976d2',
                            fontWeight: 600,
                            '&:hover': {
                              textDecoration: 'underline',
                            }
                          }}
                        >
                          {job.title}
                        </Typography>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Typography variant="body2">
                            {job.createdBy?.firstName} {job.createdBy?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {job.createdBy?.email}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip 
                          label={status.label} 
                          color={status.color}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        {job.applicationDeadline ? (
                          <>
                            <Typography variant="body2">
                              {new Date(job.applicationDeadline).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(job.applicationDeadline).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit', 
                                hour12: true 
                              })}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No deadline
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          {(isAdmin || isJobOwner) && (
                            <>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<PeopleIcon />}
                                onClick={() => navigate(`/jobs/${job._id}/applicants`)}
                                sx={{ 
                                  textTransform: 'none',
                                  borderRadius: 1.5,
                                }}
                              >
                                Applicants
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => navigate(`/jobs/edit/${job._id}`)}
                                sx={{ 
                                  textTransform: 'none',
                                  borderRadius: 1.5,
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => openDeleteDialog(job._id, job.title)}
                                sx={{ 
                                  textTransform: 'none',
                                  borderRadius: 1.5,
                                }}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                          {!isAdmin && !isJobOwner && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate(`/jobs/${job._id}`)}
                              sx={{ 
                                textTransform: 'none',
                                borderRadius: 1.5,
                              }}
                            >
                              View Details
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="error" sx={{ fontSize: 32 }} />
          <Typography variant="h6" component="span">
            Delete Job
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>"{deleteDialog.jobTitle}"</strong>?
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, color: 'error.main' }}>
            This action cannot be undone. All job data and applications will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={closeDeleteDialog}
            disabled={deleting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            sx={{ textTransform: 'none' }}
          >
            {deleting ? 'Deleting...' : 'Delete Job'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyJobs;
