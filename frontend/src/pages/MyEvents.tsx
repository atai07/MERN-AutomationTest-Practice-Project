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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { eventService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyEvents: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, eventId: '', eventName: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      // Check if user is admin and fetch appropriate data
      if (user?.role === 'admin') {
        const response = await eventService.getAllEventsAdmin();
        setEvents(response.data.data || []);
      } else {
        const response = await eventService.getMyEvents();
        setEvents(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (eventId: string, eventName: string) => {
    setDeleteDialog({ open: true, eventId, eventName });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, eventId: '', eventName: '' });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await eventService.delete(deleteDialog.eventId);
      setEvents(events.filter(event => event._id !== deleteDialog.eventId));
      closeDeleteDialog();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  const getEventStatus = (event: any) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    
    // Check if it's a draft first (draft events should always show as Draft)
    if (!event.isPublic) {
      return { label: 'Draft', color: 'warning' as const };
    }
    
    // Create a date for start of today (midnight)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    
    // Event is expired only if the date is before today (not including today)
    if (eventDateOnly < todayStart) {
      return { label: 'Expired', color: 'default' as const };
    } else {
      return { label: 'Published', color: 'success' as const };
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
            {isAdmin ? 'Event Dashboard' : 'My Events'}
          </Typography>
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
              onClick={() => navigate('/events')}
              sx={{ 
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Upcoming Events
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
            <Typography
              variant="h5"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              You haven't created any events yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Start by creating your first event!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/events/create')}
              sx={{ 
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Create Event
            </Button>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Event Name</TableCell>
                  {isAdmin && <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Creator</TableCell>}
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => {
                  const status = getEventStatus(event);
                  const isEventOwner = event.createdBy?._id === user?.id || event.createdBy === user?.id;
                  return (
                    <TableRow 
                      key={event._id}
                      sx={{ 
                        '&:hover': { backgroundColor: '#f9f9f9' },
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell>
                        <Typography
                          onClick={() => navigate(`/events/${event._id}`)}
                          sx={{
                            cursor: 'pointer',
                            color: '#1976d2',
                            fontWeight: 600,
                            '&:hover': {
                              textDecoration: 'underline',
                            }
                          }}
                        >
                          {event.title}
                        </Typography>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Typography variant="body2">
                            {event.createdBy?.firstName} {event.createdBy?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.createdBy?.email}
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
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(event.date).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: true 
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          {(isAdmin || isEventOwner) && (
                            <>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<PeopleIcon />}
                                onClick={() => navigate(`/events/${event._id}/participants`)}
                                sx={{ 
                                  textTransform: 'none',
                                  borderRadius: 1.5,
                                }}
                              >
                                Participants
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => navigate(`/events/edit/${event._id}`)}
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
                                onClick={() => openDeleteDialog(event._id, event.title)}
                                sx={{ 
                                  textTransform: 'none',
                                  borderRadius: 1.5,
                                }}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                          {!isAdmin && !isEventOwner && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate(`/events/${event._id}`)}
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
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="error" sx={{ fontSize: 32 }} />
          <Typography variant="h6" component="span">
            Delete Event
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>"{deleteDialog.eventName}"</strong>?
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, color: 'error.main' }}>
            This action cannot be undone. All event data and registrations will be permanently deleted.
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
            {deleting ? 'Deleting...' : 'Delete Event'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyEvents;
