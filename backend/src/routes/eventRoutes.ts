import express from 'express';
import {
  getEvents,
  getRecentEvents,
  searchEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  createPaymentIntent,
  confirmPayment,
  getMyEvents,
  getMyBookedEvents,
  getEventParticipants,
  getAllEventsAdmin,
} from '../controllers/eventController';
import { protect, optionalAuth } from '../middleware/auth';

const router = express.Router();

router.get('/', optionalAuth, getEvents);
router.get('/recent', optionalAuth, getRecentEvents);
router.get('/search', optionalAuth, searchEvents);
router.get('/my-events', protect, getMyEvents);
router.get('/my-booked-events', protect, getMyBookedEvents);
router.get('/admin/all-events', protect, getAllEventsAdmin);
router.get('/:id', optionalAuth, getEvent);
router.get('/:id/participants', protect, getEventParticipants);
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.post('/:id/register', optionalAuth, registerForEvent);
router.post('/:id/payment-intent', createPaymentIntent);
router.post('/confirm-payment', confirmPayment);

export default router;
