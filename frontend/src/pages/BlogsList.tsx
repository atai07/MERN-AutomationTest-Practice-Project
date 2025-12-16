import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Box,
  Pagination,
  Chip,
  CircularProgress,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import { blogService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  isPublic: boolean;
  status: 'draft' | 'published';
  createdAt: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

const BlogsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const blogsPerPage = 8;

  useEffect(() => {
    document.title = 'Blogs - Community Platform';
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogService.getAll(page, blogsPerPage);
      setBlogs(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
            Community Blogs
          </Typography>
          {user && (
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
                onClick={() => navigate('/blogs/my-blogs')}
                sx={{ 
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                {user.role === 'admin' ? 'Blogs Dashboard' : 'My Blogs'}
              </Button>
            </Box>
          )}
        </Box>

        {!loading && blogs.length === 0 && (
          <Paper
            elevation={0}
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
            <ArticleIcon
              sx={{
                fontSize: 80,
                color: 'text.secondary',
                mb: 2,
                opacity: 0.5,
              }}
            />
            <Typography
              variant="h5"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              No blogs available yet.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Check back soon for new content!
            </Typography>
          </Paper>
        )}

        {blogs.length > 0 && (
          <>
            <Grid container spacing={3}>
              {blogs.map((blog) => (
                <Grid item xs={12} sm={6} key={blog._id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="280"
                        image={blog.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600'}
                        alt={blog.title}
                        onClick={() => navigate(`/blogs/${blog._id}`)}
                        sx={{ 
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                      />
                      <Chip 
                        label={formatDate(blog.createdAt)}
                        sx={{ 
                          position: 'absolute',
                          top: 16,
                          left: 16,
                          backgroundColor: 'white',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          px: 1.5,
                          py: 2.5,
                        }}
                      />
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        onClick={() => navigate(`/blogs/${blog._id}`)}
                        sx={{ 
                          fontWeight: 700,
                          mb: 2,
                          lineHeight: 1.4,
                          cursor: 'pointer',
                          color: '#1a1a2e',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '56px',
                          '&:hover': {
                            color: '#1976d2'
                          }
                        }}
                      >
                        {blog.title}
                      </Typography>
                      
                      {blog.excerpt && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            mb: 2,
                            lineHeight: 1.7,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {blog.excerpt}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            By {blog.createdBy?.firstName} {blog.createdBy?.lastName}
                          </Typography>
                          {user && blog.createdBy._id === user.id && (
                            <Chip 
                              label={blog.status === 'published' ? 'Published' : 'Draft'}
                              color={blog.status === 'published' ? 'success' : 'warning'}
                              size="small"
                              sx={{ 
                                width: 'fit-content',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                          )}
                        </Box>
                        {user && blog.createdBy._id === user.id ? (
                          <Button 
                            variant="contained"
                            size="medium" 
                            onClick={() => navigate(`/blogs/edit/${blog._id}`)}
                            sx={{ 
                              fontWeight: 600,
                              textTransform: 'none',
                              px: 3,
                              py: 1,
                              borderRadius: 2
                            }}
                          >
                            Edit
                          </Button>
                        ) : (
                          <Button 
                            variant="contained"
                            size="medium" 
                            onClick={() => navigate(`/blogs/${blog._id}`)}
                            sx={{ 
                              fontWeight: 600,
                              textTransform: 'none',
                              px: 3,
                              py: 1,
                              borderRadius: 2
                            }}
                          >
                            Read More
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontSize: '1rem',
                      fontWeight: 500,
                    },
                    '& .Mui-selected': {
                      backgroundColor: '#ff6b35',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#e55a2b',
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default BlogsList;
