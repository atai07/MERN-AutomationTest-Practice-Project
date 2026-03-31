import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  LocationOn,
  Business,
  Work,
  AttachMoney,
  CalendarToday,
  Edit as EditIcon,
} from '@mui/icons-material';
import { jobService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Job {
  _id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  jobType: string;
  salary?: string;
  applicationDeadline?: string;
  coverImage: string;
  isPublic: boolean;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  } | string;
}

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    coverLetter: '',
  });

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobService.getById(id!);
      setJob(response.data.data);
      setIsApplied(response.data.isApplied || false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  // Check if user can edit the job (creator or admin)
  const canEditJob = () => {
    if (!user || !job) return false;
    
    // Handle both string and object formats for createdBy
    const creatorId = typeof job.createdBy === 'string' 
      ? job.createdBy 
      : job.createdBy._id;
    
    // Compare both as strings to handle ObjectId vs string comparison
    const isCreator = String(user.id) === String(creatorId);
    const isAdmin = user.role === 'admin';
    
    return isAdmin || isCreator;
  };

  const handleEditJob = () => {
    navigate(`/jobs/edit/${id}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      await jobService.apply(id!, formData);
      
      setSuccessDialog(true);
      setIsApplied(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        coverLetter: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !job) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">Job not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
        {/* Job Title and Badge */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
            {job.title}
          </Typography>
          
          {/* Edit Button - Only for creator and admin */}
          {canEditJob() && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditJob}
              sx={{ ml: 2 }}
            >
              Edit Job
            </Button>
          )}
        </Box>
        
        <Box sx={{ mb: 3 }}>
          {/* Job Meta Info */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Chip
              icon={<Business />}
              label={job.company}
              color="primary"
              sx={{ fontWeight: 500 }}
            />
            <Chip
              icon={<Work />}
              label={job.jobType}
              color="error"
              sx={{ fontWeight: 500 }}
            />
            {job.salary && (
              <Chip
                icon={<AttachMoney />}
                label={job.salary}
                color="success"
                variant="outlined"
              />
            )}
            {job.applicationDeadline && (
              <Chip
                icon={<CalendarToday />}
                label={`Apply by: ${new Date(job.applicationDeadline).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}`}
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
          
          {/* Location */}
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<LocationOn />}
              label={job.location}
              variant="outlined"
            />
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Left Side - Job Image */}
          <Grid item xs={12} md={6}>
            {/* Job Image */}
            <Box
              sx={{
                width: '100%',
                height: '94%',
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: '#f5f5f5',
              }}
            >
              {job.coverImage ? (
                <img
                  src={job.coverImage}
                  alt={job.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h3" sx={{ color: 'white', opacity: 0.7 }}>
                    Job
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Right Side - Application Form */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: '#f8f9fa',
                borderRadius: 2,
              }}
            >
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  {/* First Name */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="First name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      InputProps={{
                        readOnly: !!user,
                      }}
                      sx={{ backgroundColor: 'white' }}
                    />
                  </Grid>

                  {/* Last Name */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Last name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      InputProps={{
                        readOnly: !!user,
                      }}
                      sx={{ backgroundColor: 'white' }}
                    />
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john.doe@example.com"
                      InputProps={{
                        readOnly: !!user,
                      }}
                      sx={{ backgroundColor: 'white' }}
                    />
                  </Grid>

                  {/* Phone */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                      InputProps={{
                        readOnly: !!user,
                      }}
                      sx={{ backgroundColor: 'white' }}
                    />
                  </Grid>

                  {/* Cover Letter */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Cover Letter"
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleChange}
                      placeholder="Tell us why you're a great fit for this position..."
                      sx={{ backgroundColor: 'white' }}
                    />
                  </Grid>

                  {/* Error Message */}
                  {error && (
                    <Grid item xs={12}>
                      <Alert severity="error">{error}</Alert>
                    </Grid>
                  )}

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={submitting || isApplied}
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1rem',
                      }}
                    >
                      {isApplied ? 'Already Applied' : (submitting ? 'Submitting...' : 'Submit Application')}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>

        {/* Job Description - Full Width Below */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Job Description
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
            }}
          >
            {job.description}
          </Typography>
        </Box>
      </Paper>

      {/* Success Dialog */}
      <Dialog
        open={successDialog}
        onClose={() => setSuccessDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
          <Typography variant="h6" component="span">
            Application Submitted!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your application has been successfully submitted. The employer will review your application and contact you if selected.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setSuccessDialog(false)}
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobDetails;
