# 🏗️ Project Architecture & Learning Guide

This document explains how the MyEvents platform is structured and how everything works together.

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  (React + TypeScript + Material-UI)                         │
│  Port: 3000                                                  │
├─────────────────────────────────────────────────────────────┤
│  - User Interface Components                                 │
│  - Routing (React Router)                                    │
│  - State Management (Context API)                            │
│  - API Service Layer (Axios)                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/REST API
                        │ (JSON)
┌───────────────────────▼─────────────────────────────────────┐
│                         BACKEND                              │
│  (Node.js + Express + TypeScript)                           │
│  Port: 5000                                                  │
├─────────────────────────────────────────────────────────────┤
│  - REST API Endpoints                                        │
│  - Authentication (JWT)                                      │
│  - Business Logic                                            │
│  - Data Validation                                           │
└───────────────────────┬─────────────────────────────────────┘
                        │ Mongoose ODM
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                       DATABASE                               │
│  (MongoDB)                                                   │
│  Port: 27017                                                 │
├─────────────────────────────────────────────────────────────┤
│  Collections:                                                │
│  - users                                                     │
│  - events, eventregistrations                                │
│  - jobs, jobapplications                                     │
│  - blogs, comments, notifications                            │
└─────────────────────────────────────────────────────────────┘

External Services:
┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│   Stripe    │  │  Nodemailer  │  │ Cloudinary  │
│  (Payments) │  │   (Email)    │  │  (Images)   │
└─────────────┘  └──────────────┘  └─────────────┘
```

---

## 🔄 Request Flow

### Example: User Creates an Event

```
1. USER ACTION
   └─> User fills form and clicks "Create Event"

2. FRONTEND (CreateEvent.tsx)
   └─> Form validation
   └─> Call eventService.create(data)

3. API SERVICE (services/api.ts)
   └─> axios.post('/api/events', data)
   └─> Attach JWT token in headers

4. BACKEND ROUTE (routes/eventRoutes.ts)
   └─> POST /api/events
   └─> Apply 'protect' middleware

5. MIDDLEWARE (middleware/auth.ts)
   └─> Verify JWT token
   └─> Attach user to request

6. CONTROLLER (controllers/eventController.ts)
   └─> createEvent function
   └─> Validate data
   └─> Create event in database

7. MODEL (models/Event.ts)
   └─> Save to MongoDB
   └─> Return created document

8. RESPONSE
   └─> Send success response with event data

9. FRONTEND UPDATES
   └─> Display success message
   └─> Redirect to events list
   └─> Update UI
```

---

## 📁 Detailed File Structure

### Backend Structure

```
backend/
├── src/
│   ├── server.ts                    # Entry point
│   │   - Initialize Express app
│   │   - Connect to MongoDB
│   │   - Register routes
│   │   - Start server
│   │
│   ├── models/                      # Database Schemas
│   │   ├── User.ts                  # User model
│   │   │   - firstName, lastName, email, password
│   │   │   - role (user/admin)
│   │   │   - organization, profession, phone
│   │   │   - socialMediaLink, profileImage
│   │   │   - isActive, subscriptionTier, subscriptionExpiry
│   │   │   - resetPasswordToken, resetPasswordExpire
│   │   │
│   │   ├── Event.ts                 # Event model
│   │   │   - title, description, date, duration
│   │   │   - location, price, coverImage
│   │   │   - isPublic, createdBy, registrations
│   │   │
│   │   ├── EventRegistration.ts    # Event registration
│   │   │   - event, user, personal info
│   │   │   - paymentStatus, paymentId
│   │   │
│   │   ├── Job.ts                   # Job posting model
│   │   │   - title, description, company
│   │   │   - location, jobType, salary
│   │   │   - isPublic, createdBy, applications
│   │   │
│   │   ├── JobApplication.ts       # Job application
│   │   │   - job, user, personal info
│   │   │   - coverLetter, resumeUrl
│   │   │
│   │   ├── Blog.ts                  # Blog post model
│   │   │   - title, content, excerpt
│   │   │   - coverImage, isPublic, status
│   │   │   - createdBy, likes, comments
│   │   │
│   │   ├── Comment.ts               # Comment model
│   │   │   - content, user, blog
│   │   │   - createdAt, updatedAt
│   │   │
│   │   └── Notification.ts         # Notification model
│   │       - user, type, title, message
│   │       - link, isRead
│   │
│   ├── controllers/                 # Business Logic
│   │   ├── authController.ts       # Auth operations
│   │   │   - register() - Register new user
│   │   │   - login() - User login
│   │   │   - forgotPassword() - Request password reset
│   │   │   - resetPassword() - Reset password with token
│   │   │   - getMe() - Get current user
│   │   │   - updateProfile() - Update user profile
│   │   │
│   │   ├── eventController.ts      # Event operations
│   │   │   - getEvents() - Get all events
│   │   │   - getRecentEvents() - Get recent events
│   │   │   - searchEvents() - Search events
│   │   │   - getEvent() - Get single event
│   │   │   - createEvent() - Create event
│   │   │   - updateEvent() - Update event
│   │   │   - deleteEvent() - Delete event
│   │   │   - registerForEvent() - Register for event
│   │   │   - createPaymentIntent() - Stripe payment
│   │   │   - confirmPayment() - Confirm payment
│   │   │   - getMyEvents() - Get user's created events
│   │   │   - getMyBookedEvents() - Get user's registrations
│   │   │   - getEventParticipants() - Get event participants
│   │   │   - getAllEventsAdmin() - Admin view all events
│   │   │
│   │   ├── jobController.ts        # Job operations
│   │   │   - getJobs() - Get all jobs
│   │   │   - getRecentJobs() - Get recent jobs
│   │   │   - searchJobs() - Search jobs
│   │   │   - getJob() - Get single job
│   │   │   - createJob() - Create job
│   │   │   - updateJob() - Update job
│   │   │   - deleteJob() - Delete job
│   │   │   - applyForJob() - Apply for job
│   │   │   - getMyJobs() - Get user's posted jobs
│   │   │   - getMyAppliedJobs() - Get user's applications
│   │   │   - getJobApplicants() - Get job applicants
│   │   │   - getAllJobsAdmin() - Admin view all jobs
│   │   │
│   │   ├── blogController.ts       # Blog operations
│   │   │   - getBlogs() - Get all blogs
│   │   │   - getRecentBlogs() - Get recent blogs
│   │   │   - searchBlogs() - Search blogs
│   │   │   - getBlog() - Get single blog
│   │   │   - createBlog() - Create blog
│   │   │   - updateBlog() - Update blog
│   │   │   - deleteBlog() - Delete blog
│   │   │   - toggleLike() - Like/unlike blog
│   │   │   - getMyBlogs() - Get user's blogs
│   │   │   - getAllBlogsAdmin() - Admin view all blogs
│   │   │
│   │   └── notificationController.ts
│   │       - getNotifications()
│   │       - markAsRead()
│   │       - markAllAsRead()
│   │       - deleteNotification()
│   │
│   ├── routes/                      # API Endpoints
│   │   ├── authRoutes.ts
│   │   │   POST   /api/auth/register
│   │   │   POST   /api/auth/login
│   │   │   POST   /api/auth/forgot-password
│   │   │   PUT    /api/auth/reset-password/:token
│   │   │   GET    /api/auth/me (protected)
│   │   │   PUT    /api/auth/update-profile (protected)
│   │   │
│   │   ├── eventRoutes.ts
│   │   │   GET    /api/events (optionalAuth)
│   │   │   GET    /api/events/recent (optionalAuth)
│   │   │   GET    /api/events/search (optionalAuth)
│   │   │   GET    /api/events/my-events (protected)
│   │   │   GET    /api/events/my-booked-events (protected)
│   │   │   GET    /api/events/admin/all-events (protected)
│   │   │   GET    /api/events/:id (optionalAuth)
│   │   │   GET    /api/events/:id/participants (protected)
│   │   │   POST   /api/events (protected)
│   │   │   PUT    /api/events/:id (protected)
│   │   │   DELETE /api/events/:id (protected)
│   │   │   POST   /api/events/:id/register (optionalAuth)
│   │   │   POST   /api/events/:id/payment-intent
│   │   │   POST   /api/events/confirm-payment
│   │   │
│   │   ├── jobRoutes.ts
│   │   │   GET    /api/jobs (optionalAuth)
│   │   │   GET    /api/jobs/recent (optionalAuth)
│   │   │   GET    /api/jobs/search (optionalAuth)
│   │   │   GET    /api/jobs/my-jobs (protected)
│   │   │   GET    /api/jobs/my-applied-jobs (protected)
│   │   │   GET    /api/jobs/admin/all-jobs (protected)
│   │   │   GET    /api/jobs/:id (optionalAuth)
│   │   │   GET    /api/jobs/:id/applicants (protected)
│   │   │   POST   /api/jobs (protected)
│   │   │   PUT    /api/jobs/:id (protected)
│   │   │   DELETE /api/jobs/:id (protected)
│   │   │   POST   /api/jobs/:id/apply (optionalAuth)
│   │   │
│   │   ├── blogRoutes.ts
│   │   │   GET    /api/blogs (optionalAuth)
│   │   │   GET    /api/blogs/recent (optionalAuth)
│   │   │   GET    /api/blogs/search (optionalAuth)
│   │   │   GET    /api/blogs/my-blogs (protected)
│   │   │   GET    /api/blogs/admin/all-blogs (protected)
│   │   │   GET    /api/blogs/:id (optionalAuth)
│   │   │   POST   /api/blogs (protected)
│   │   │   PUT    /api/blogs/:id (protected)
│   │   │   DELETE /api/blogs/:id (protected)
│   │   │   POST   /api/blogs/:id/like (protected)
│   │   │
│   │   └── notificationRoutes.ts
│   │       GET    /api/notifications (protected)
│   │       PUT    /api/notifications/:id/read (protected)
│   │       PUT    /api/notifications/read-all (protected)
│   │       DELETE /api/notifications/:id (protected)
│   │
│   ├── middleware/
│   │   ├── auth.ts                  # Authentication
│   │   │   - protect()              # Verify JWT token
│   │   │   - optionalAuth()         # Optional authentication
│   │   │
│   │   └── upload.ts                # File upload
│   │       - multer configuration   # Image upload handling
│   │       - File filtering         # Only allow images
│   │       - Size limits            # 5MB max
│   │
│   ├── utils/
│   │   └── email.ts                 # Email utility
│   │       - sendEmail()            # Send emails via Nodemailer
│   │
│   └── scripts/                     # Utility scripts
│       ├── createAdminUser.ts       # Create admin account
│       ├── fixUserLogin.ts          # Fix login issues
│       └── resetUserPassword.ts     # Reset user password
│
├── uploads/                         # Uploaded files
│   └── profiles/                    # Profile images
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
└── .env                             # Environment variables
```

### Frontend Structure

```
frontend/
├── src/
│   ├── index.tsx                    # Entry point
│   │   - Render React app
│   │   - Apply theme
│   │   - Wrap with providers
│   │
│   ├── App.tsx                      # Main component
│   │   - Define all routes
│   │   - Route protection
│   │
│   ├── context/
│   │   └── AuthContext.tsx         # Global auth state
│   │       - User state
│   │       - Token management
│   │       - Login/logout functions
│   │
│   ├── services/
│   │   └── api.ts                  # API calls
│   │       - eventService          # Event API calls
│   │       - jobService            # Job API calls
│   │       - blogService           # Blog API calls
│   │       - notificationService   # Notification API calls
│   │       - authService           # Auth API calls
│   │
│   ├── utils/
│   │   └── imageHelper.ts          # Image utilities
│   │       - Image handling        # Image processing helpers
│   │
│   ├── components/
│   │   ├── Layout/
│   │   │   └── Layout.tsx          # Main layout
│   │   │       - Navigation bar
│   │   │       - Search bar
│   │   │       - User menu
│   │   │       - Outlet for pages
│   │   │
│   │   ├── Notifications/
│   │   │   └── NotificationPanel.tsx
│   │   │       - Notification dropdown
│   │   │       - Mark as read
│   │   │
│   │   └── ProtectedRoute.tsx      # Route guard
│   │       - Check authentication
│   │       - Redirect if not logged in
│   │
│   └── pages/
│       ├── Home.tsx                 # Home page
│       │   - Cover photo
│       │   - Quick links sidebar
│       │   - Recent posts feed
│       │   - Upcoming events
│       │   - New jobs
│       │
│       ├── Login.tsx                # Login page
│       │   - Login form
│       │   - Error handling
│       │
│       ├── Register.tsx             # Registration page
│       │   - Registration form
│       │   - Validation
│       │
│       ├── ForgotPassword.tsx       # Password reset request
│       ├── ResetPassword.tsx        # Password reset form
│       ├── SearchResults.tsx        # Search results page
│       │
│       ├── EventsList.tsx           # All events list
│       ├── EventDetails.tsx         # Event details & registration
│       ├── CreateEvent.tsx          # Create event form
│       ├── EditEvent.tsx            # Edit event form
│       ├── MyEvents.tsx             # User's created events
│       ├── MyBookedEvents.tsx       # User's event registrations
│       ├── EventParticipants.tsx    # Event participants list
│       │
│       ├── JobsList.tsx             # All jobs list
│       ├── JobDetails.tsx           # Job details & application
│       ├── CreateJob.tsx            # Create job form
│       ├── EditJob.tsx              # Edit job form
│       ├── MyJobs.tsx               # User's posted jobs
│       ├── MyAppliedJobs.tsx        # User's job applications
│       ├── JobApplicants.tsx        # Job applicants list
│       │
│       ├── BlogsList.tsx            # All blogs list
│       ├── BlogDetails.tsx          # Blog details & likes
│       ├── CreateBlog.tsx           # Create blog form
│       ├── EditBlog.tsx             # Edit blog form
│       ├── MyBlogs.tsx              # User's published blogs
│       │
│       └── Profile.tsx              # User profile management
│
├── public/
│   └── index.html                   # HTML template
│
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
└── .env                             # Environment variables
```

---

## 🔐 Authentication Flow

```
┌──────────────┐
│   Register   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Hash Password       │
│  (bcrypt)            │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Save to Database    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Generate JWT Token  │
│  (includes user ID)  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Send Token to       │
│  Frontend            │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Store in            │
│  localStorage        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Attach to All       │
│  API Requests        │
│  (Authorization      │
│   Header)            │
└──────────────────────┘

Protected Route:
┌──────────────┐
│  API Request │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Extract Token       │
│  from Header         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Verify Token        │
│  (jwt.verify)        │
└──────┬───────────────┘
       │
   ┌───┴───┐
   │ Valid?│
   └───┬───┘
       │
    Yes│  No
       │   └──> Return 401 Unauthorized
       ▼
┌──────────────────────┐
│  Decode User ID      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Fetch User from DB  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Attach User to      │
│  Request Object      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Continue to         │
│  Controller          │
└──────────────────────┘
```

---

## 💾 Data Models Relationships

```
User (users collection)
├─── Events (events.createdBy)
│    └─── EventRegistrations
│
├─── Jobs (jobs.createdBy)
│    └─── JobApplications
│
├─── Blogs (blogs.createdBy)
│    ├─── Likes (blogs.likes[])
│    └─── Comments
│
└─── Notifications (notifications.user)

Relationships:
- One User can create many Events/Jobs/Blogs
- One Event can have many Registrations
- One Job can have many Applications
- One Blog can have many Likes and Comments
- One User can have many Notifications
```

---

## 🎨 Frontend State Management

```
AuthContext (Global)
├─── user: User | null
├─── token: string | null
├─── loading: boolean
└─── Functions:
     ├─── login()
     ├─── register()
     └─── logout()

Component State (Local)
└─── Each page manages its own:
     ├─── Data (events, jobs, blogs)
     ├─── Loading states
     ├─── Error messages
     └─── Form data
```

---

## 🚀 Key Technologies Explained

### Backend

**Express.js**
- Web framework for Node.js
- Handles HTTP requests/responses
- Middleware support

**Mongoose**
- ODM for MongoDB
- Schema definition
- Data validation
- Queries and updates

**JWT (JSON Web Tokens)**
- Stateless authentication
- Contains user information
- Signed and verified
- Sent in Authorization header

**Bcrypt**
- Password hashing algorithm
- One-way encryption
- Salt rounds for security

### Frontend

**React**
- Component-based UI library
- Virtual DOM for performance
- Hooks for state management

**Material-UI**
- Pre-built components
- Consistent design
- Responsive layout
- Theme customization

**React Router**
- Client-side routing
- Nested routes
- Protected routes

**Axios**
- HTTP client for API calls
- Promise-based
- Interceptors for headers
- Error handling

---

## 📚 Learning Resources

### For Complete Beginners:
1. **JavaScript**: MDN Web Docs
2. **TypeScript**: Official TypeScript Handbook
3. **React**: Official React Documentation
4. **Node.js**: Node.js Getting Started Guide
5. **MongoDB**: MongoDB University (free courses)

### For This Project:
1. Study the request flow (above)
2. Read through one controller at a time
3. Understand how models define data
4. See how routes connect to controllers
5. Follow a feature from frontend to database

---

**Continue learning by:**
- Adding new features
- Reading the code
- Making small changes
- Debugging issues
- Building similar projects
