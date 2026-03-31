import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getProfileImageUrl } from '../utils/imageHelper';
import axios from 'axios';

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    profession: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        organization: user.organization || '',
        profession: user.profession || '',
      });
      // Handle profile image URL - if it's a relative path, prepend API URL
      setProfileImage(getProfileImageUrl(user.profileImage));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors when user types
    if (name === 'firstName') {
      setFirstNameError('');
    }
    if (name === 'lastName') {
      setLastNameError('');
    }
    if (name === 'email') {
      setEmailError('');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setLoading(true);

    // Validate required fields
    if (!formData.firstName.trim()) {
      setFirstNameError('First name is required');
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!formData.lastName.trim()) {
      setLastNameError('Last name is required');
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setEmailError('Email is required');
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError('Please enter a valid email address');
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Create FormData to handle both text and file data
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('organization', formData.organization);
      formDataToSend.append('profession', formData.profession);
      
      // Add profile image if selected
      if (imageFile) {
        formDataToSend.append('profileImage', imageFile);
      }

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/profile`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      setImageFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        organization: user.organization || '',
        profession: user.profession || '',
      });
      // Reset profile image preview to original
      setProfileImage(getProfileImageUrl(user.profileImage));
      setImageFile(null);
    }
    setEditMode(false);
    setError('');
    setSuccess('');
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">Profile</Typography>
            {!editMode && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Profile Image Section */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={profileImage}
                    alt={`${formData.firstName} ${formData.lastName}`}
                    sx={{ 
                      width: 150, 
                      height: 150,
                      fontSize: '3rem',
                    }}
                  >
                    {!profileImage && formData.firstName && formData.lastName && 
                      `${formData.firstName[0]}${formData.lastName[0]}`
                    }
                  </Avatar>
                  {editMode && (
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: 'white',
                        '&:hover': { backgroundColor: 'lightgray' },
                      }}
                    >
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={handleImageChange}
                      />
                      <PhotoCamera />
                    </IconButton>
                  )}
                </Box>
              </Grid>

              {/* Name Fields */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!editMode}
                  error={!!firstNameError}
                  helperText={firstNameError}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!editMode}
                  error={!!lastNameError}
                  helperText={lastNameError}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editMode}
                  error={!!emailError}
                  helperText={emailError}
                />
              </Grid>

              {/* Phone Number */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </Grid>

              {/* Organization */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </Grid>

              {/* Profession */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </Grid>

              {/* Action Buttons */}
              {editMode && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;
