import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Card, CardMedia, CardContent, Grid, Chip, CircularProgress } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { eventService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyBookedEvents: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookedEvents();
  }, []);

  const fetchMyBookedEvents = async () => {
    try {
      const response = await eventService.getMyBookedEvents();
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching my booked events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'free':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Payment Completed';
      case 'pending':
        return 'Payment Pending';
      case 'free':
        return 'Free Event';
      default:
        return status;
    }
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
            My Booked Events
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/events')}
              sx={{ 
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Browse Events
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
              My Events
            </Button>
          </Box>
        </Box>

        {events.length === 0 ? (
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
            <ConfirmationNumberIcon
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
              You haven't booked any events yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Browse and register for upcoming events!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/events')}
              sx={{ 
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Browse Events
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {events.map((event) => (
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
                    <Chip 
                      label={getStatusLabel(event.registrationStatus)}
                      color={getStatusColor(event.registrationStatus)}
                      sx={{ 
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontWeight: 600,
                        fontSize: '0.85rem',
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
                        Registered: {new Date(event.registeredAt).toLocaleDateString()}
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
                        View Event
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default MyBookedEvents;
