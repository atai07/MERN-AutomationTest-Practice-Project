import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Button, Card, CardMedia, CardContent, CardActions, Grid, Pagination, Chip, CircularProgress } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { eventService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EventsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const eventsPerPage = 8;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventService.getAll();
      const allEvents = response.data.data || [];
      
      // Filter to show only upcoming events (date-based, not time-based)
      const upcomingEvents = allEvents.filter((event: any) => {
        const eventDate = new Date(event.date);
        const now = new Date();
        
        // Compare only dates, not times
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return eventDateOnly >= todayDateOnly;
      });
      
      // Sort by date ascending (nearest date first)
      upcomingEvents.sort((a: any, b: any) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const indexOfLastEvent = page * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(events.length / eventsPerPage);



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
            Upcoming Events
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/events/create')}
                sx={{ 
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                Create Event
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/events/my-events')}
                sx={{ 
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                {user.role === 'admin' ? 'Event Dashboard' : 'My Events'}
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/events/my-booked-events')}
                sx={{ 
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                My Booked Events
              </Button>
            </Box>
          )}
        </Box>

        {!loading && events.length === 0 && (
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
            <EventIcon
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
              There are no events happening right now.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Please check back soon!
            </Typography>
          </Paper>
        )}

        {events.length > 0 && (
          <>
            <Grid container spacing={3}>
              {currentEvents.map((event) => (
                <Grid item xs={12} sm={6} key={event._id}>
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

export default EventsList;
