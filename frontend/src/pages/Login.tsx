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
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

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

    // Remove spaces from email
    if (name === 'email') {
      filteredValue = value.replace(/\s/g, '');
    }

    setFormData({ ...formData, [name]: filteredValue });
    
    // Clear errors when user types
    if (name === 'email') {
      setEmailError('');
    }
    if (name === 'password') {
      setPasswordError('');
    }
  };

  const handleEmailBlur = () => {
    const trimmedEmail = formData.email.trim();
    // Only validate if user has entered something
    if (trimmedEmail && !validateEmail(trimmedEmail)) {
      setEmailError('Invalid email.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordError('');
    setEmailError('');
    setLoading(true);

    // Trim fields
    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();

    // Test 5: Validate empty fields on frontend
    if (!trimmedEmail || !trimmedPassword) {
      if (!trimmedEmail) {
        setEmailError('Email is required');
      }
      if (!trimmedPassword) {
        setPasswordError('Password is required');
      }
      setError('Please provide email and password');
      setLoading(false);
      return;
    }

    // Validate email format
    if (!validateEmail(trimmedEmail)) {
      setEmailError('Invalid email.');
      setError('Invalid email.');
      setLoading(false);
      return;
    }

    // Validate password format
    if (!validatePassword(trimmedPassword)) {
      setPasswordError('Password must be at least 8 characters long and include letters, numbers, and special characters');
      setError('Please enter a valid password');
      setLoading(false);
      return;
    }

    try {
      await login(trimmedEmail, trimmedPassword);
      navigate('/');
    } catch (err: any) {
      // Handle different error scenarios (Tests 4, 6, 7, 8)
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              margin="normal"
              error={!!emailError}
              helperText={emailError}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              error={!!passwordError}
              helperText={passwordError}
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot Password?
              </Link>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register">
                  Register
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
