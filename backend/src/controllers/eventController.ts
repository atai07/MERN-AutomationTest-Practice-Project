import { Response } from 'express';
import Event from '../models/Event';
import EventRegistration from '../models/EventRegistration';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// @desc    Get all events (public for guests, all for logged-in users)
// @route   GET /api/events
// @access  Public/Private
export const getEvents = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    let query: any = {};

    // Show only public (published) events, not drafts
    query.isPublic = true;

    // Filter upcoming events only (start of today)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    query.date = { $gte: todayStart };

    const events = await Event.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get recent events for homepage
// @route   GET /api/events/recent
// @access  Public
export const getRecentEvents = async (req: AuthRequest, res: Response) => {
  try {
    // Filter from start of today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    let query: any = { 
      date: { $gte: todayStart },
      isPublic: true // Show only published events, not drafts
    };

    const events = await Event.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(4);

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Search events
// @route   GET /api/events/search
// @access  Public
export const searchEvents = async (req: AuthRequest, res: Response) => {
  try {
    const searchTerm = req.query.q as string;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required',
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const query: any = {
      isPublic: true,
      date: { $gte: todayStart },
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { location: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    const events = await Event.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ date: 1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public/Private
export const getEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'firstName lastName email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if guest user can access
    if (!req.user && !event.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'This event is private',
      });
    }

    // Check if user is already registered (by email)
    let isRegistered = false;
    if (req.user) {
      const registration = await EventRegistration.findOne({
        event: event._id,
        email: req.user.email
      });
      isRegistered = !!registration;
    }

    res.status(200).json({
      success: true,
      data: event,
      isRegistered,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Create event request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    const { title, description, date, duration, location, price, coverImage, isPublic } = req.body;

    console.log('Extracted fields:', { title, description, date, duration, location, price, coverImage, isPublic });

    const event = await Event.create({
      title,
      description,
      date,
      duration,
      location,
      price,
      coverImage,
      isPublic,
      createdBy: req.user!._id,
    });

    // Create notification for all users
    const allUsers = await require('../models/User').default.find({ _id: { $ne: req.user!._id } });
    
    const notifications = allUsers.map((user: any) => ({
      user: user._id,
      type: 'event',
      title: 'New Event Posted',
      message: `${req.user!.firstName} posted a new event: ${title}`,
      link: `/events/${event._id}`,
      isRead: false,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check ownership or admin role
    const isOwner = event.createdBy.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event',
      });
    }

    // Check if the event is being published (draft -> published)
    const wasPrivate = !event.isPublic;
    const isNowPublic = req.body.isPublic === true;
    const isBeingPublished = wasPrivate && isNowPublic;

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // If event is being published, create notifications for all users
    if (isBeingPublished && event) {
      const allUsers = await require('../models/User').default.find({ _id: { $ne: req.user!._id } });
      
      const notifications = allUsers.map((user: any) => ({
        user: user._id,
        type: 'event',
        title: 'New Event Published',
        message: `${req.user!.firstName} published a new event: ${event!.title}`,
        link: `/events/${event!._id}`,
        isRead: false,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(200).json({
      success: true,
      message: isBeingPublished ? 'Event published successfully!' : 'Event updated successfully',
      data: event,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check ownership or admin role
    const isOwner = event.createdBy.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event',
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Public
export const registerForEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const { firstName, lastName, organization, profession, email, phone, socialMediaLink, question } = req.body;

    // Check if already registered
    const existingRegistration = await EventRegistration.findOne({
      event: event._id,
      email: email,
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this event',
      });
    }

    // Create registration
    const registration = await EventRegistration.create({
      event: event._id,
      user: req.user?._id,
      firstName,
      lastName,
      organization,
      profession,
      email,
      phone,
      socialMediaLink,
      question,
      paymentStatus: event.price === 0 ? 'free' : 'pending',
    });

    event.registrations.push(registration._id);
    await event.save();

    res.status(201).json({
      success: true,
      message: event.price === 0 ? 'Registration successful' : 'Please complete payment',
      data: registration,
      requiresPayment: event.price > 0,
      amount: event.price,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create payment intent for event
// @route   POST /api/events/:id/payment-intent
// @access  Public
export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (event.price === 0) {
      return res.status(400).json({
        success: false,
        message: 'This event is free',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(event.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        eventId: event._id.toString(),
        registrationId: req.body.registrationId,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Confirm payment for event
// @route   POST /api/events/confirm-payment
// @access  Public
export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { registrationId, paymentIntentId } = req.body;

    const registration = await EventRegistration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    registration.paymentStatus = 'completed';
    registration.paymentId = paymentIntentId;
    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get user's created events
// @route   GET /api/events/my-events
// @access  Private
export const getMyEvents = async (req: AuthRequest, res: Response) => {
  try {
    const events = await Event.find({ createdBy: req.user!._id })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get user's registered/booked events
// @route   GET /api/events/my-booked-events
// @access  Private
export const getMyBookedEvents = async (req: AuthRequest, res: Response) => {
  try {
    // Find all registrations for this user
    const registrations = await EventRegistration.find({
      $or: [
        { user: req.user!._id },
        { email: req.user!.email }
      ]
    }).populate({
      path: 'event',
      populate: {
        path: 'createdBy',
        select: 'firstName lastName'
      }
    }).sort({ createdAt: -1 });

    // Extract events from registrations
    const events = registrations
      .filter(reg => reg.event) // Filter out registrations with deleted events
      .map(reg => {
        const eventData = reg.event as any;
        return {
          ...eventData._doc,
          registrationId: reg._id,
          registrationStatus: reg.paymentStatus,
          registeredAt: reg.createdAt
        };
      });

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get event participants
// @route   GET /api/events/:id/participants
// @access  Private
export const getEventParticipants = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is the event creator or admin
    const isOwner = event.createdBy.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view participants',
      });
    }

    // Get all registrations for this event
    const registrations = await EventRegistration.find({ event: req.params.id })
      .select('firstName lastName email phone organization profession paymentStatus createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: registrations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all events for admin dashboard (all users' events)
// @route   GET /api/events/admin/all-events
// @access  Private (Admin only)
export const getAllEventsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access admin dashboard',
      });
    }

    const events = await Event.find({})
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
