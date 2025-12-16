import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SearchResults from './pages/SearchResults';
import EventsList from './pages/EventsList';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import MyEvents from './pages/MyEvents';
import MyBookedEvents from './pages/MyBookedEvents';
import EventParticipants from './pages/EventParticipants';
import JobsList from './pages/JobsList';
import JobDetails from './pages/JobDetails';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import MyJobs from './pages/MyJobs';
import MyAppliedJobs from './pages/MyAppliedJobs';
import JobApplicants from './pages/JobApplicants';
import BlogsList from './pages/BlogsList';
import BlogDetails from './pages/BlogDetails';
import CreateBlog from './pages/CreateBlog';
import EditBlog from './pages/EditBlog';
import MyBlogs from './pages/MyBlogs';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="search" element={<SearchResults />} />
        
        {/* Events Routes */}
        <Route path="events" element={<EventsList />} />
        <Route path="events/:id" element={<EventDetails />} />
        <Route
          path="events/create"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="events/edit/:id"
          element={
            <ProtectedRoute>
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="events/my-events"
          element={
            <ProtectedRoute>
              <MyEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="events/my-booked-events"
          element={
            <ProtectedRoute>
              <MyBookedEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="events/:id/participants"
          element={
            <ProtectedRoute>
              <EventParticipants />
            </ProtectedRoute>
          }
        />
        
        {/* Jobs Routes */}
        <Route path="jobs" element={<JobsList />} />
        <Route path="jobs/:id" element={<JobDetails />} />
        <Route
          path="jobs/create"
          element={
            <ProtectedRoute>
              <CreateJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="jobs/edit/:id"
          element={
            <ProtectedRoute>
              <EditJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="jobs/my-jobs"
          element={
            <ProtectedRoute>
              <MyJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="jobs/my-applied-jobs"
          element={
            <ProtectedRoute>
              <MyAppliedJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="jobs/:id/applicants"
          element={
            <ProtectedRoute>
              <JobApplicants />
            </ProtectedRoute>
          }
        />
        
        {/* Blogs Routes */}
        <Route path="blogs" element={<BlogsList />} />
        <Route path="blogs/:id" element={<BlogDetails />} />
        <Route
          path="blogs/create"
          element={
            <ProtectedRoute>
              <CreateBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="blogs/edit/:id"
          element={
            <ProtectedRoute>
              <EditBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="blogs/my-blogs"
          element={
            <ProtectedRoute>
              <MyBlogs />
            </ProtectedRoute>
          }
        />
        
        {/* Profile */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
