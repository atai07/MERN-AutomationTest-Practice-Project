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
  AccessTime,
  CalendarToday,
  AttachMoney,
} from '@mui/icons-material';
import { eventService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  location: string;
  price: number;
  coverImage: string;
  isPublic: boolean;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  } | string;
}

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organizationName: '',
    jobTitle: '',
    question: '',
  });

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        organizationName: user.organization || '',
        jobTitle: user.profession || '',
      }));
    }
  }, [user]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await eventService.getById(id!);
      setEvent(response.data.data);
      setIsRegistered(response.data.isRegistered || false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  // Check if user can edit the event (creator or admin)
  const canEditEvent = () => {
    if (!user || !event) return false;
    
    // Handle both string and object formats for createdBy
    const creatorId = typeof event.createdBy === 'string' 
      ? event.createdBy 
      : event.createdBy._id;
    
    // Compare both as strings to handle ObjectId vs string comparison
    const isCreator = String(user.id) === String(creatorId);
    const isAdmin = user.role === 'admin';
    
    console.log('Can Edit Check:', { 
      userId: user.id, 
      creatorId, 
      isCreator, 
      isAdmin, 
      userRole: user.role,
      eventCreatedBy: event.createdBy 
    });
    
    return isAdmin || isCreator;
  };

  const handleEditEvent = () => {
    navigate(`/events/edit/${id}`);
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
      
      await eventService.register(id!, formData);
      
      setSuccessDialog(true);
      setIsRegistered(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        organizationName: '',
        jobTitle: '',
        question: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register for event');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !event) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">Event not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
        {/* Event Title and Badge */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
            {event.title}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          
          {/* Event Meta Info */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Chip
              icon={<CalendarToday />}
              label={formatDate(event.date)}
              color="error"
              sx={{ fontWeight: 500 }}
            />
            <Chip
              icon={<AccessTime />}
              label={formatTime(event.date)}
              color="primary"
              sx={{ fontWeight: 500 }}
            />
            <Chip
              label={`Duration: ${event.duration}`}
              variant="outlined"
            />
            <Chip
              icon={<AttachMoney />}
              label={event.price > 0 ? `$${event.price}` : 'Free'}
              color="success"
              variant="outlined"
            />
          </Box>
          
          {/* Location */}
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<LocationOn />}
              label={event.location}
              variant="outlined"
            />
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Left Side - Event Image */}
          <Grid item xs={12} md={6}>
            {/* Event Image */}
            <Box
              sx={{
                width: '100%',
                height: '94%',
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: '#f5f5f5',
              }}
            >
              {event.coverImage ? (
                <img
                  src={event.coverImage}
                  alt={event.title}
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
                    Event
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Right Side - Registration Form */}
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
                      required
                      placeholder="Atai"
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
                      required
                      placeholder="Bhuiyan"
                      InputProps={{
                        readOnly: !!user,
                      }}
                      sx={{ backgroundColor: 'white' }}
                    />
                  </Grid>

                  {/* Work Email */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Work email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="atai.rabbi+sa@gmail.com"
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
                      required
                      placeholder="+1"
                      InputProps={{
                        readOnly: !!user,
                      }}
                      sx={{ backgroundColor: 'white' }}
                    />
                  </Grid>

                  {/* Organization Name */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Organization name"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      placeholder="Company or organization"
                      InputProps={{
                        readOnly: !!user,
                      }}
                      sx={{ backgroundColor: 'white' }}
                    />
                  </Grid>

                  {/* Job Title */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Job title"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      InputProps={{
                        readOnly: !!user,
                      }}
                      sx={{ backgroundColor: 'white' }}
                    />
                  </Grid>

                  {/* Question */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Submit a question you have on this topic"
                      name="question"
                      value={formData.question}
                      onChange={handleChange}
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
                      disabled={submitting || isRegistered}
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1rem',
                      }}
                    >
                      {isRegistered ? 'Already Registered' : (submitting ? 'Getting Ticket...' : 'Get Ticket')}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>

        {/* Event Description - Full Width Below */}
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.8,
            }}
          >
            {event.description}
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
            Registration Successful!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your registration has been confirmed. Check your email for confirmation details and event information.
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

export default EventDetails;
