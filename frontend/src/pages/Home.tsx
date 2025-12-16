import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
} from '@mui/material';
import {
  Event as EventIcon,
  Work as WorkIcon,
  Article as ArticleIcon,
  CalendarToday as CalendarTodayIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { eventService, jobService, blogService } from '../services/api';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<any[]>([]);
  const [mixedFeed, setMixedFeed] = useState<any[]>([]);

  useEffect(() => {
    fetchRecentData();
  }, []);

  const fetchRecentData = async () => {
    try {
      const [events, jobs, blogs] = await Promise.all([
        eventService.getRecent(),
        jobService.getRecent(),
        blogService.getRecent(),
      ]);
      
      // Sort events by date ascending (nearest date first) for sidebar
      const sortedEvents = (events.data.data || []).sort((a: any, b: any) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      
      setRecentEvents(sortedEvents);
      setRecentJobs(jobs.data.data || []);
      setRecentBlogs(blogs.data.data || []);

      // Create mixed feed with all post types
      const allPosts = [
        ...(events.data.data || []).map((event: any) => ({ ...event, type: 'event' })),
        ...(jobs.data.data || []).map((job: any) => ({ ...job, type: 'job' })),
        ...(blogs.data.data || []).map((blog: any) => ({ ...blog, type: 'blog' })),
      ];

      // Sort by most recent (createdAt or updatedAt, whichever is newer)
      const sortedFeed = allPosts.sort((a: any, b: any) => {
        const aDate = Math.max(
          new Date(a.createdAt).getTime(),
          new Date(a.updatedAt || a.createdAt).getTime()
        );
        const bDate = Math.max(
          new Date(b.createdAt).getTime(),
          new Date(b.updatedAt || b.createdAt).getTime()
        );
        return bDate - aDate; // Descending order (newest first)
      });

      setMixedFeed(sortedFeed);
    } catch (error) {
      console.error('Error fetching recent data:', error);
    }
  };

  return (
    <Box>
      {/* Cover Photo */}
      <Box
        sx={{
          height: 300,
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <Box textAlign="center">
          <Typography variant="h2" gutterBottom>
            Welcome to MyEvents
          </Typography>
          <Typography variant="h5">
            Connect, Share, and Grow Together
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Left Sidebar - Quick Links */}
          <Grid item xs={12} md={3}>
            <Paper elevation={2}>
              <List>
                <ListItem disablePadding>
                  <Typography variant="h6" sx={{ p: 2 }}>
                    Quick Links
                  </Typography>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => navigate('/events')}>
                    <ListItemIcon>
                      <EventIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Events" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => navigate('/jobs')}>
                    <ListItemIcon>
                      <WorkIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Jobs" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => navigate('/blogs')}>
                    <ListItemIcon>
                      <ArticleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Blogs" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Center - Feed */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Recent Posts
              </Typography>
              
              {/* Mixed Feed - Events, Jobs, and Blogs */}
              {mixedFeed.map((post) => {
                if (post.type === 'event') {
                  const event = post;
                  return (
                <Card 
                  key={event._id} 
                  sx={{ 
                    mb: 3,
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="280"
                      image={event.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'}
                      alt={event.title}
                      onClick={() => navigate(`/events/${event._id}`)}
                      sx={{ 
                        objectFit: 'cover',
                        cursor: 'pointer'
                      }}
                    />
                    <Chip 
                      label={event.price > 0 ? `$${event.price}` : 'FREE'}
                      sx={{ 
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        backgroundColor: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        px: 1.5,
                        py: 2.5,
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      onClick={() => navigate(`/events/${event._id}`)}
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
                      {event.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarTodayIcon sx={{ color: '#1976d2', fontSize: '1rem' }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#1976d2',
                          fontWeight: 600
                        }}
                      >
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })} • {new Date(event.date).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit', 
                          hour12: true 
                        })}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                      <LocationOnIcon sx={{ color: '#999', fontSize: '1rem', mt: 0.2 }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ lineHeight: 1.6 }}
                      >
                        {event.location}
                      </Typography>
                    </Box>
                    
                    {event.description && (
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
                        {event.description}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        By {event.createdBy?.firstName} {event.createdBy?.lastName}
                      </Typography>
                      <Button 
                        variant="contained"
                        size="medium" 
                        onClick={() => navigate(`/events/${event._id}`)}
                        sx={{ 
                          fontWeight: 600,
                          textTransform: 'none',
                          px: 3,
                          py: 1,
                          borderRadius: 2
                        }}
                      >
                        Get Ticket
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
                  );
                } else if (post.type === 'job') {
                  const job = post;
                  return (
                    <Card 
                      key={job._id} 
                      sx={{ 
                        mb: 3,
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                        }
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
                          icon={<WorkIcon />}
                          label="JOB"
                          sx={{ 
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            backgroundColor: 'white',
                            fontWeight: 700,
                            fontSize: '1rem',
                            px: 1.5,
                            py: 2.5,
                          }}
                        />
                        {job.applicationDeadline && (
                          <Chip 
                            label={`Deadline: ${new Date(job.applicationDeadline).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}`}
                            sx={{ 
                              position: 'absolute',
                              top: 16,
                              right: 16,
                              backgroundColor: 'rgba(211, 47, 47, 0.9)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                            }}
                          />
                        )}
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
                          <WorkIcon sx={{ color: '#1976d2', fontSize: '1rem' }} />
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
                        
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip 
                            label={job.jobType || 'Full-time'}
                            size="small"
                            sx={{ 
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              fontWeight: 600
                            }}
                          />
                          {job.salary && (
                            <Chip 
                              label={job.salary}
                              size="small"
                              sx={{ 
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                fontWeight: 600
                              }}
                            />
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            By {job.createdBy?.firstName} {job.createdBy?.lastName}
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
                            View Job
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                } else if (post.type === 'blog') {
                  const blog = post;
                  return (
                <Card 
                  key={blog._id} 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    }
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
                      icon={<ArticleIcon />}
                      label="BLOG"
                      sx={{ 
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        backgroundColor: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        px: 1.5,
                        py: 2.5,
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Chip 
                      label={new Date(blog.createdAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      size="small"
                      sx={{ 
                        mb: 2,
                        backgroundColor: '#ff6b35',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      onClick={() => navigate(`/blogs/${blog._id}`)}
                      sx={{ 
                        fontWeight: 700,
                        mb: 2,
                        lineHeight: 1.4,
                        cursor: 'pointer',
                        '&:hover': {
                          color: '#1976d2'
                        }
                      }}
                    >
                      {blog.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        mb: 2,
                        lineHeight: 1.6
                      }}
                    >
                      {blog.excerpt}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        By {blog.createdBy?.firstName} {blog.createdBy?.lastName}
                      </Typography>
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
                    </Box>
                  </CardContent>
                </Card>
                  );
                }
                return null;
              })}

              {mixedFeed.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No posts available yet.
                  </Typography>
                </Paper>
              )}
            </Box>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={3}>
            {/* Upcoming Events */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Events
              </Typography>
              <List dense>
                {recentEvents.slice(0, 4).map((event) => (
                  <ListItem key={event._id} disablePadding sx={{ mb: 1 }}>
                    <Card sx={{ width: '100%' }}>
                      <CardContent sx={{ p: 1.5 }}>
                        <Typography variant="subtitle2" noWrap>
                          {event.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 1 }}>
                        <Button
                          size="small"
                          onClick={() => navigate(`/events/${event._id}`)}
                        >
                          View
                        </Button>
                      </CardActions>
                    </Card>
                  </ListItem>
                ))}
              </List>
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate('/events')}
              >
                See All Events
              </Button>
            </Paper>

            {/* New Jobs */}
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                New Job Postings
              </Typography>
              <List dense>
                {recentJobs.slice(0, 4).map((job) => (
                  <ListItem key={job._id} disablePadding sx={{ mb: 1 }}>
                    <Card sx={{ width: '100%' }}>
                      <CardContent sx={{ p: 1.5 }}>
                        <Typography variant="subtitle2" noWrap>
                          {job.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {job.company}
                        </Typography>
                        {job.applicationDeadline && (
                          <Typography variant="caption" sx={{ display: 'block', color: '#d32f2f', fontWeight: 600, mt: 0.5 }}>
                            Deadline: {new Date(job.applicationDeadline).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions sx={{ p: 1 }}>
                        <Button
                          size="small"
                          onClick={() => navigate(`/jobs/${job._id}`)}
                        >
                          View
                        </Button>
                      </CardActions>
                    </Card>
                  </ListItem>
                ))}
              </List>
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate('/jobs')}
              >
                See All Jobs
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
