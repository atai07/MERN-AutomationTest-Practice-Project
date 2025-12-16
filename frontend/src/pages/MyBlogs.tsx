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
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { blogService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  isPublic: boolean;
  status: 'draft' | 'published';
  createdAt: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const MyBlogs: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, blogId: '', blogTitle: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  const fetchMyBlogs = async () => {
    try {
      // Check if user is admin and fetch appropriate data
      if (user?.role === 'admin') {
        const response = await blogService.getAllBlogsAdmin();
        setBlogs(response.data.data || []);
      } else {
        const response = await blogService.getMyBlogs();
        setBlogs(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (blogId: string, blogTitle: string) => {
    setDeleteDialog({ open: true, blogId, blogTitle });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, blogId: '', blogTitle: '' });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await blogService.delete(deleteDialog.blogId);
      setBlogs(blogs.filter(blog => blog._id !== deleteDialog.blogId));
      closeDeleteDialog();
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog');
    } finally {
      setDeleting(false);
    }
  };

  const getBlogStatus = (blog: Blog) => {
    if (blog.status === 'draft') {
      return { label: 'Draft', color: 'warning' as const };
    }
    return { label: 'Published', color: 'success' as const };
  };

  const isAdmin = user?.role === 'admin';

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
            {isAdmin ? 'Blogs Dashboard' : 'My Blogs'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/blogs/create')}
              sx={{ 
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Create Blog
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/blogs')}
              sx={{ 
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              All Blogs
            </Button>
          </Box>
        </Box>

        {blogs.length === 0 ? (
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
              You haven't created any blogs yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Start by creating your first blog!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/blogs/create')}
              sx={{ 
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Create Blog
            </Button>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Blog Title</TableCell>
                  {isAdmin && <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Creator</TableCell>}
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Created Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {blogs.map((blog) => {
                  const status = getBlogStatus(blog);
                  const isBlogOwner = blog.createdBy?._id === user?.id;
                  return (
                    <TableRow 
                      key={blog._id}
                      sx={{ 
                        '&:hover': { backgroundColor: '#f9f9f9' },
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell>
                        <Typography
                          onClick={() => navigate(`/blogs/${blog._id}`)}
                          sx={{
                            cursor: 'pointer',
                            color: '#1976d2',
                            fontWeight: 600,
                            '&:hover': {
                              textDecoration: 'underline',
                            }
                          }}
                        >
                          {blog.title}
                        </Typography>
                        {blog.excerpt && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {blog.excerpt.substring(0, 80)}...
                          </Typography>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Typography variant="body2">
                            {blog.createdBy?.firstName} {blog.createdBy?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {blog.createdBy?.email}
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
                        <Typography variant="body2">
                          {new Date(blog.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          {(isAdmin || isBlogOwner) && (
                            <>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => navigate(`/blogs/edit/${blog._id}`)}
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
                                onClick={() => openDeleteDialog(blog._id, blog.title)}
                                sx={{ 
                                  textTransform: 'none',
                                  borderRadius: 1.5,
                                }}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                          {!isAdmin && !isBlogOwner && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate(`/blogs/${blog._id}`)}
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

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={closeDeleteDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberIcon color="warning" />
            <Typography variant="h6" component="span">
              Confirm Delete
            </Typography>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete "<strong>{deleteDialog.blogTitle}</strong>"? 
              This action cannot be undone.
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
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default MyBlogs;
