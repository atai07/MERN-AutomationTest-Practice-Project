import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Button, Card, CardMedia, CardContent, CardActions, Grid, Pagination, Chip, CircularProgress } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import { jobService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const JobsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const jobsPerPage = 8;

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobService.getAll();
      const allJobs = response.data.data || [];
      console.log('Fetched jobs:', allJobs);
      console.log('First job applicationDeadline:', allJobs[0]?.applicationDeadline);
      setJobs(allJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const indexOfLastJob = page * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

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
            Job Opportunities
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/jobs/my-jobs')}
                sx={{ 
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                {user.role === 'admin' ? 'Jobs Dashboard' : 'My Jobs'}
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/jobs/my-applied-jobs')}
                sx={{ 
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                My Applications
              </Button>
            </Box>
          )}
        </Box>

        {!loading && jobs.length === 0 && (
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
            <WorkIcon
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
              No job postings available at the moment.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Please check back soon!
            </Typography>
          </Paper>
        )}

        {jobs.length > 0 && (
          <>
            <Grid container spacing={3}>
              {currentJobs.map((job) => (
                <Grid item xs={12} sm={6} key={job._id}>
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
                        image={job.coverImage || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600'}
                        alt={job.title}
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        sx={{ 
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                      />
                      <Chip 
                        label={job.jobType}
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
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        sx={{ 
                          fontWeight: 700,
                          mb: 2,
                          lineHeight: 1.4,
                          cursor: 'pointer',
                          color: '#1a1a2e',
                          '&:hover': {
                            color: '#1976d2'
                          }
                        }}
                      >
                        {job.title}
                      </Typography>
                      
                      {job.applicationDeadline && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#d32f2f',
                            fontWeight: 600,
                            mb: 2
                          }}
                        >
                          Application Deadline: {new Date(job.applicationDeadline).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <BusinessIcon sx={{ color: '#1976d2', fontSize: '1rem' }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#1976d2',
                            fontWeight: 600
                          }}
                        >
                          {job.company}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                        <LocationOnIcon sx={{ color: '#999', fontSize: '1rem', mt: 0.2 }} />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ lineHeight: 1.6 }}
                        >
                          {job.location}
                        </Typography>
                      </Box>
                      
                      {job.salary && (
                        <Box sx={{ mb: 2 }}>
                          <Chip 
                            label={job.salary} 
                            size="small"
                            sx={{ 
                              backgroundColor: '#e8f5e9',
                              color: '#2e7d32',
                              fontWeight: 600
                            }}
                          />
                        </Box>
                      )}
                      
                      {job.description && (
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
                          {job.description}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Posted by {job.createdBy?.firstName} {job.createdBy?.lastName}
                        </Typography>
                        <Button 
                          variant="contained"
                          size="medium" 
                          onClick={() => navigate(`/jobs/${job._id}`)}
                          sx={{ 
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 3,
                            py: 1,
                            borderRadius: 2
                          }}
                        >
                          Apply Now
                        </Button>
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

export default JobsList;
