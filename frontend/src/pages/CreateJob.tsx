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
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { jobService } from '../services/api';

const CreateJob: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'Full-time',
    salary: '',
    applicationDeadline: '',
    description: '',
    displayImage: null as File | null,
    visibility: 'public', // 'public' or 'private'
  });
  
  const [imagePreview, setImagePreview] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
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
      setError('Job Title is required');
      return false;
    }

    if (!formData.company.trim()) {
      setError('Company name is required');
      return false;
    }

    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Job Description is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    console.log('Form submission started with status:', status);
    console.log('Current form data:', formData);
    
    setError('');
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    console.log('Validation passed');
    setLoading(true);

    try {
      // Prepare data for submission (matching backend schema)
      const submitData = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        jobType: formData.jobType,
        salary: formData.salary.trim() || undefined,
        applicationDeadline: formData.applicationDeadline || undefined,
        description: formData.description.trim(),
        isPublic: status === 'published', // Draft = false, Published = true
        coverImage: imagePreview || '', // Use the base64 image preview as cover image
      };

      console.log('Submitting job data:', submitData);

      // Call API to create job
      const response = await jobService.create(submitData);
      console.log('Job created successfully:', response.data);
      
      const createdJobId = response.data.data._id;

      setToast({
        open: true,
        message: status === 'draft' 
          ? 'Job saved as draft successfully!' 
          : 'Job posted successfully!',
        severity: 'success'
      });

      setTimeout(() => {
        navigate(`/jobs/${createdJobId}`);
      }, 1500);

    } catch (err: any) {
      console.error('Error creating job:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || 'Failed to create job';
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
    navigate('/jobs');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Post a Job
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Job Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Senior Software Engineer"
              />
            </Grid>

            {/* Company Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                placeholder="e.g., Tech Corp Inc."
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., San Francisco, CA or Remote"
              />
            </Grid>

            {/* Job Type */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Job Type"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                required
              >
                {jobTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Salary */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Salary (Optional)"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g., $80,000 - $120,000/year"
              />
            </Grid>

            {/* Application Deadline */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Application Deadline (Optional)"
                name="applicationDeadline"
                type="date"
                value={formData.applicationDeadline}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Job Display Image */}
            <Grid item xs={12}>
              <FormLabel>Job Display Image (Optional)</FormLabel>
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

            {/* Job Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={10}
                required
                placeholder="Provide a detailed description of the job, responsibilities, requirements, qualifications, etc."
              />
            </Grid>

            {/* Visibility */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Job Visibility</FormLabel>
                <RadioGroup
                  row
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                >
                  <FormControlLabel 
                    value="public" 
                    control={<Radio />} 
                    label="Public (All users can see and apply)" 
                  />
                  <FormControlLabel 
                    value="private" 
                    control={<Radio />} 
                    label="Private (Only logged-in members can see and apply)" 
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
                  {loading ? 'Posting...' : 'Post Job'}
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
  );
};

export default CreateJob;
