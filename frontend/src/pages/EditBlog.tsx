import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
  FormControlLabel,
  Switch,
  CircularProgress,
  IconButton,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Snackbar,
} from '@mui/material';
import { CloudUpload, Close } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { blogService } from '../services/api';

const EditBlog: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    visibility: 'public', // 'public' or 'private'
  });
  
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (id) {
      fetchBlogDetails();
    }
  }, [id]);

  const fetchBlogDetails = async () => {
    try {
      setFetchLoading(true);
      const response = await blogService.getById(id!);
      const blog = response.data.data;
      
      // Explicitly handle isPublic as a boolean
      const isPublic = blog.isPublic === true || blog.isPublic === 'true';
      
      setFormData({
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        coverImage: blog.coverImage || '',
        visibility: isPublic ? 'public' : 'private',
      });
      
      // Set image preview if blog has a cover image
      if (blog.coverImage) {
        setImagePreview(blog.coverImage);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Failed to load blog details');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleVisibilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Visibility changed to:', value);
    setFormData(prev => ({
      ...prev,
      visibility: value,
    }));
    setError('');
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setUploadedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear URL field when image is uploaded
      setFormData(prev => ({ ...prev, coverImage: '' }));
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, coverImage: '' }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.excerpt.trim()) {
      setError('Excerpt is required');
      return false;
    }
    if (formData.excerpt.length > 200) {
      setError('Excerpt must be 200 characters or less');
      return false;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    setError('');
    
    // Only validate for published blogs, not for drafts
    if (status === 'published' && !validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let coverImageData = formData.coverImage;
      
      // If user uploaded an image, convert to base64
      if (uploadedImage) {
        coverImageData = imagePreview;
      }

      const updateData = {
        title: formData.title.trim() || 'Untitled Blog',
        excerpt: formData.excerpt.trim() || 'No excerpt',
        content: formData.content.trim() || 'No content',
        coverImage: coverImageData,
        status: status,
        isPublic: formData.visibility === 'public',
      };

      console.log('Updating blog with data:', updateData);
      console.log('Visibility:', formData.visibility, '-> isPublic:', updateData.isPublic);

      const response = await blogService.update(id!, updateData);

      if (response.data.success) {
        setToast({
          open: true,
          message: status === 'draft' 
            ? 'Blog saved as draft successfully!' 
            : 'Blog updated successfully!',
          severity: 'success'
        });

        setTimeout(() => {
          navigate('/blogs/my-blogs');
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update blog. Please try again.';
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
    navigate(`/blogs/${id}`);
  };

  if (fetchLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Edit Blog
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box>
          <TextField
            fullWidth
            label="Blog Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            placeholder="Enter an engaging title for your blog"
            disabled={loading}
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Cover Image
            </Typography>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              disabled={loading || formData.coverImage.trim() !== ''}
              fullWidth
              sx={{ mb: 2 }}
            >
              Upload Cover Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>

            {imagePreview && (
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Cover preview"
                  sx={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
                <IconButton
                  onClick={handleRemoveImage}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'error.light', color: 'white' },
                  }}
                  size="small"
                >
                  <Close />
                </IconButton>
              </Box>
            )}

            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Or enter a URL below (max 5MB, JPG/PNG/GIF)
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Cover Image URL"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleChange}
            margin="normal"
            placeholder="https://example.com/image.jpg (optional)"
            helperText="Enter a URL for your blog's cover image"
            disabled={loading || uploadedImage !== null}
          />

          <TextField
            fullWidth
            label="Excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={2}
            placeholder="Brief summary of your blog (max 200 characters)"
            helperText={`${formData.excerpt.length}/200 characters`}
            error={formData.excerpt.length > 200}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={12}
            placeholder="Write your blog content here..."
            disabled={loading}
          />

          <Box sx={{ mt: 3, mb: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Blog Visibility</FormLabel>
              <RadioGroup
                row
                name="visibility"
                value={formData.visibility}
                onChange={handleVisibilityChange}
              >
                <FormControlLabel 
                  value="public" 
                  control={<Radio />} 
                  label="Public (All users can see)" 
                  disabled={loading}
                />
                <FormControlLabel 
                  value="private" 
                  control={<Radio />} 
                  label="Private (Only logged-in members can see)" 
                  disabled={loading}
                />
              </RadioGroup>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
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
              {loading ? 'Updating...' : 'Update Blog'}
            </Button>
          </Box>
        </Box>
      </Paper>

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

export default EditBlog;
