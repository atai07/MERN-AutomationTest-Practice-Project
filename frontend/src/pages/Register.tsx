import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    profession: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Toast close handler
  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  // Name validation (only English letters, apostrophe, and period)
  const validateName = (name: string): boolean => {
    return /^[a-zA-Z'.\s]+$/.test(name);
  };

  // Phone validation (only +, (, ), -, and numbers)
  const validatePhone = (phone: string): boolean => {
    return /^[0-9+()\-\s]*$/.test(phone);
  };

  // Email validation
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Password validation function
  const validatePassword = (password: string): boolean => {
    // At least 8 characters
    if (password.length < 8) return false;
    // Contains at least one letter
    if (!/[a-zA-Z]/.test(password)) return false;
    // Contains at least one number
    if (!/[0-9]/.test(password)) return false;
    // Contains at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let filteredValue = value;

    // Validate and filter based on field type
    if (name === 'firstName' || name === 'lastName' || name === 'organization' || name === 'profession') {
      // Only allow English letters, apostrophe, period, and spaces
      filteredValue = value.replace(/[^a-zA-Z'.\s]/g, '');
    } else if (name === 'phone') {
      // Only allow numbers, +, (, ), -, and spaces
      filteredValue = value.replace(/[^0-9+()\-\s]/g, '');
    } else if (name === 'email') {
      // Remove spaces from email
      filteredValue = value.replace(/\s/g, '');
    }

    setFormData({ ...formData, [name]: filteredValue });
    
    // Clear errors when user types
    if (name === 'password') {
      setPasswordError('');
    }
    if (name === 'confirmPassword') {
      setConfirmPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Trim all text fields
    const trimmedData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      organization: formData.organization.trim(),
      profession: formData.profession.trim(),
      phone: formData.phone.trim(),
    };

    // Validate first name
    if (!trimmedData.firstName || !validateName(trimmedData.firstName)) {
      setError('First name must contain only English letters, apostrophes, and periods');
      return;
    }

    // Validate last name
    if (!trimmedData.lastName || !validateName(trimmedData.lastName)) {
      setError('Last name must contain only English letters, apostrophes, and periods');
      return;
    }

    // Validate email
    if (!trimmedData.email || !validateEmail(trimmedData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate organization if provided
    if (trimmedData.organization && !validateName(trimmedData.organization)) {
      setError('Organization must contain only English letters, apostrophes, and periods');
      return;
    }

    // Validate profession if provided
    if (trimmedData.profession && !validateName(trimmedData.profession)) {
      setError('Profession must contain only English letters, apostrophes, and periods');
      return;
    }

    // Validate phone if provided
    if (trimmedData.phone && !validatePhone(trimmedData.phone)) {
      setError('Phone must contain only numbers, +, (, ), and -');
      return;
    }

    // Validate password format
    if (!validatePassword(trimmedData.password)) {
      setPasswordError('Password must be at least 8 characters long and include letters, numbers, and special characters');
      setError('Please enter a valid password');
      return;
    }

    if (trimmedData.password !== trimmedData.confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = trimmedData;
      await register(registerData);
      
      // Show success toast
      setToast({
        open: true,
        message: 'Registration successful! Thank you for joining us.',
        severity: 'success'
      });
      
      // Navigate after a short delay to show the toast
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response);
      
      // Handle specific error cases
      const errorMessage = err.response?.data?.message || err.message || '';
      
      // Check for network errors
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Cannot connect to server. Please make sure the backend is running.');
        setToast({
          open: true,
          message: 'Cannot connect to server. Please make sure the backend is running.',
          severity: 'error'
        });
      } else if (errorMessage.includes('already exists') || errorMessage.includes('already in use')) {
        setError('This email is already in use. Try logging in or use another email.');
        setToast({
          open: true,
          message: 'This email is already in use. Try logging in or use another email.',
          severity: 'error'
        });
      } else {
        const displayMessage = errorMessage || 'Registration failed. Please check your information and try again.';
        setError(displayMessage);
        setToast({
          open: true,
          message: displayMessage,
          severity: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Register
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  error={!!passwordError}
                  helperText={passwordError || "Your password must be at least 8 characters long and include a mix of letters, numbers, and special characters."}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  error={!!confirmPasswordError}
                  helperText={confirmPasswordError || "Re-enter your password to confirm."}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login">
                  Login
                </Link>
              </Typography>
            </Box>
          </form>
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

export default Register;
