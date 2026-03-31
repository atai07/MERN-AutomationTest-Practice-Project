import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  Alert,
  Snackbar,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { eventService } from '../services/api';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    highlight: '',
    displayImage: null as File | null,
    eventDay: 'single', // 'single' or 'multiple'
    singleDate: null as Date | null,
    singleTime: null as Date | null,
    startDate: null as Date | null,
    endDate: null as Date | null,
    multipleTime: null as Date | null,
    duration: '',
    eventType: 'in-person', // 'in-person' or 'online'
    location: '',
    isPaidEvent: false,
    eventFee: '',
    description: '',
    visibility: 'public', // 'public' or 'private'
  });
  
  const [imagePreview, setImagePreview] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, displayImage: file });
      
      // Compress and resize image before preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Create canvas to resize image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set max dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression (0.8 quality for JPEG)
          const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
          setImagePreview(compressedImage);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Event Title is required');
      return false;
    }

    if (formData.eventDay === 'single') {
      if (!formData.singleDate) {
        setError('Please select a date');
        return false;
      }
      if (!formData.singleTime) {
        setError('Please select a time');
        return false;
      }
    } else {
      if (!formData.startDate || !formData.endDate) {
        setError('Please select start and end dates');
        return false;
      }
      if (!formData.multipleTime) {
        setError('Please select a time');
        return false;
      }
    }

    if (!formData.duration.trim()) {
      setError('Event Duration is required');
      return false;
    }

    if (formData.eventType === 'in-person' && !formData.location.trim()) {
      setError('Location is required for in-person events');
      return false;
    }

    if (formData.isPaidEvent) {
      const fee = parseFloat(formData.eventFee);
      if (!formData.eventFee.trim() || isNaN(fee) || fee <= 0) {
        setError('Event Fee must be a valid positive number');
        return false;
      }
    }

    if (!formData.description.trim()) {
      setError('Event Description is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    console.log('Form submission started with status:', status);
    console.log('Current form data:', formData);
    
    setError('');
    
    // Only validate for published events, not for drafts
    if (status === 'published' && !validateForm()) {
      console.log('Validation failed');
      return;
    }

    console.log('Validation passed or draft mode');
    setLoading(true);

    try {
      // Prepare the date by combining date and time
      let eventDate: Date;
      if (formData.eventDay === 'single' && formData.singleDate && formData.singleTime) {
        eventDate = new Date(formData.singleDate);
        eventDate.setHours(formData.singleTime.getHours());
        eventDate.setMinutes(formData.singleTime.getMinutes());
      } else if (formData.startDate && formData.multipleTime) {
        eventDate = new Date(formData.startDate);
        eventDate.setHours(formData.multipleTime.getHours());
        eventDate.setMinutes(formData.multipleTime.getMinutes());
      } else {
        // For drafts, use current date if no date is set
        eventDate = new Date();
      }

      // Prepare data for submission (matching backend schema)
      const submitData = {
        title: formData.title.trim() || 'Untitled Event',
        description: formData.description.trim() || 'No description',
        date: eventDate.toISOString(),
        duration: formData.duration.trim() || '1 hour',
        location: formData.eventType === 'online' ? 'Online' : (formData.location.trim() || 'TBD'),
        price: formData.isPaidEvent ? parseFloat(formData.eventFee || '0') : 0,
        isPublic: status === 'published',
        coverImage: imagePreview || '', // Use the base64 image preview as cover image
      };

      console.log('Submitting event data:', submitData);

      // Call API to create event
      const response = await eventService.create(submitData);
      console.log('Event created successfully:', response.data);

      setToast({
        open: true,
        message: status === 'draft' 
          ? 'Event saved as draft successfully!' 
          : 'Event published successfully!',
        severity: 'success'
      });

      setTimeout(() => {
        if (status === 'draft') {
          navigate('/events/my-events');
        } else {
          navigate('/events');
        }
      }, 1500);

    } catch (err: any) {
      console.error('Error creating event:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || 'Failed to create event';
      setError(errorMessage);
      setToast({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/events');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Create Event
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Paper elevation={3} sx={{ p: 4 }}>
            <Grid container spacing={3}>
              {/* Event Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </Grid>

              {/* Highlight */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Highlight"
                  name="highlight"
                  value={formData.highlight}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>

              {/* Event Display Image */}
              <Grid item xs={12}>
                <FormLabel>Event Display Image</FormLabel>
                <Box sx={{ mt: 1 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  {imagePreview && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Event Day(s) */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Event Day(s)</FormLabel>
                  <RadioGroup
                    row
                    name="eventDay"
                    value={formData.eventDay}
                    onChange={handleChange}
                  >
                    <FormControlLabel value="single" control={<Radio />} label="Single Day" />
                    <FormControlLabel value="multiple" control={<Radio />} label="Multiple Days" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Single Day Fields */}
              {formData.eventDay === 'single' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Date"
                      value={formData.singleDate}
                      onChange={(newValue: Date | null) => setFormData({ ...formData, singleDate: newValue })}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TimePicker
                      label="Time"
                      value={formData.singleTime}
                      onChange={(newValue: Date | null) => setFormData({ ...formData, singleTime: newValue })}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                </>
              )}

              {/* Multiple Days Fields */}
              {formData.eventDay === 'multiple' && (
                <>
                  <Grid item xs={12} sm={4}>
                    <DatePicker
                      label="Start Date"
                      value={formData.startDate}
                      onChange={(newValue: Date | null) => setFormData({ ...formData, startDate: newValue })}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <DatePicker
                      label="End Date"
                      value={formData.endDate}
                      onChange={(newValue: Date | null) => setFormData({ ...formData, endDate: newValue })}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TimePicker
                      label="Time"
                      value={formData.multipleTime}
                      onChange={(newValue: Date | null) => setFormData({ ...formData, multipleTime: newValue })}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                </>
              )}

              {/* Event Duration */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 2 hours, 3 days"
                />
              </Grid>

              {/* Event Type */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Event Type</FormLabel>
                  <RadioGroup
                    row
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                  >
                    <FormControlLabel value="in-person" control={<Radio />} label="In-Person" />
                    <FormControlLabel value="online" control={<Radio />} label="Online" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Location (only for in-person) */}
              {formData.eventType === 'in-person' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </Grid>
              )}

              {/* Paid Event Checkbox */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isPaidEvent}
                      onChange={handleChange}
                      name="isPaidEvent"
                    />
                  }
                  label="Paid Event"
                />
              </Grid>

              {/* Event Fee (only if paid event) */}
              {formData.isPaidEvent && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Event Fee (USD)"
                    name="eventFee"
                    value={formData.eventFee}
                    onChange={handleChange}
                    placeholder="e.g., 50"
                  />
                </Grid>
              )}

              {/* Event Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={6}
                />
              </Grid>

              {/* Visibility */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Event Visibility</FormLabel>
                  <RadioGroup
                    row
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                  >
                    <FormControlLabel 
                      value="public" 
                      control={<Radio />} 
                      label="Public (All users can see and register)" 
                    />
                    <FormControlLabel 
                      value="private" 
                      control={<Radio />} 
                      label="Private (Only logged-in members can see and register)" 
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleSubmit('draft')}
                    disabled={loading}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleSubmit('published')}
                    disabled={loading}
                  >
                    {loading ? 'Publishing...' : 'Publish'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        <Snackbar
          open={toast.open}
          autoHideDuration={6000}
          onClose={handleToastClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleToastClose} severity={toast.severity} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateEvent;
