import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// Event Services
export const eventService = {
  getAll: (page = 1, limit = 12) => 
    axios.get(`${API_URL}/events?page=${page}&limit=${limit}`),
  
  getRecent: () => 
    axios.get(`${API_URL}/events/recent`),
  
  search: (query: string) =>
    axios.get(`${API_URL}/events/search?q=${encodeURIComponent(query)}`),
  
  getMyEvents: () => 
    axios.get(`${API_URL}/events/my-events`),
  
  getAllEventsAdmin: () => 
    axios.get(`${API_URL}/events/admin/all-events`),
  
  getMyBookedEvents: () => 
    axios.get(`${API_URL}/events/my-booked-events`),
  
  getById: (id: string) => 
    axios.get(`${API_URL}/events/${id}`),
  
  getParticipants: (id: string) => 
    axios.get(`${API_URL}/events/${id}/participants`),
  
  create: (data: any) => 
    axios.post(`${API_URL}/events`, data),
  
  update: (id: string, data: any) => 
    axios.put(`${API_URL}/events/${id}`, data),
  
  delete: (id: string) => 
    axios.delete(`${API_URL}/events/${id}`),
  
  register: (id: string, data: any) => 
    axios.post(`${API_URL}/events/${id}/register`, data),
  
  createPaymentIntent: (id: string, registrationId: string) => 
    axios.post(`${API_URL}/events/${id}/payment-intent`, { registrationId }),
  
  confirmPayment: (registrationId: string, paymentIntentId: string) => 
    axios.post(`${API_URL}/events/confirm-payment`, { registrationId, paymentIntentId }),
};

// Job Services
export const jobService = {
  getAll: (page = 1, limit = 12) => 
    axios.get(`${API_URL}/jobs?page=${page}&limit=${limit}`),
  
  getRecent: () => 
    axios.get(`${API_URL}/jobs/recent`),
  
  search: (query: string) =>
    axios.get(`${API_URL}/jobs/search?q=${encodeURIComponent(query)}`),
  
  getMyJobs: () => 
    axios.get(`${API_URL}/jobs/my-jobs`),
  
  getAllJobsAdmin: () => 
    axios.get(`${API_URL}/jobs/admin/all-jobs`),
  
  getMyAppliedJobs: () => 
    axios.get(`${API_URL}/jobs/my-applied-jobs`),
  
  getById: (id: string) => 
    axios.get(`${API_URL}/jobs/${id}`),
  
  getApplicants: (id: string) => 
    axios.get(`${API_URL}/jobs/${id}/applicants`),
  
  create: (data: any) => 
    axios.post(`${API_URL}/jobs`, data),
  
  update: (id: string, data: any) => 
    axios.put(`${API_URL}/jobs/${id}`, data),
  
  delete: (id: string) => 
    axios.delete(`${API_URL}/jobs/${id}`),
  
  apply: (id: string, data: any) => 
    axios.post(`${API_URL}/jobs/${id}/apply`, data),
};

// Blog Services
export const blogService = {
  getAll: (page = 1, limit = 12) => 
    axios.get(`${API_URL}/blogs?page=${page}&limit=${limit}`),
  
  getRecent: () => 
    axios.get(`${API_URL}/blogs/recent`),
  
  search: (query: string) =>
    axios.get(`${API_URL}/blogs/search?q=${encodeURIComponent(query)}`),
  
  getMyBlogs: () => 
    axios.get(`${API_URL}/blogs/my-blogs`),
  
  getAllBlogsAdmin: () => 
    axios.get(`${API_URL}/blogs/admin/all-blogs`),
  
  getById: (id: string) => 
    axios.get(`${API_URL}/blogs/${id}`),
  
  create: (data: any) => 
    axios.post(`${API_URL}/blogs`, data),
  
  update: (id: string, data: any) => 
    axios.put(`${API_URL}/blogs/${id}`, data),
  
  delete: (id: string) => 
    axios.delete(`${API_URL}/blogs/${id}`),
  
  toggleLike: (id: string) => 
    axios.post(`${API_URL}/blogs/${id}/like`),
};

// Notification Services
export const notificationService = {
  getAll: () => 
    axios.get(`${API_URL}/notifications`),
  
  markAsRead: (id: string) => 
    axios.put(`${API_URL}/notifications/${id}/read`),
  
  markAllAsRead: () => 
    axios.put(`${API_URL}/notifications/read-all`),
  
  delete: (id: string) => 
    axios.delete(`${API_URL}/notifications/${id}`),
};

// Auth Services
export const authService = {
  forgotPassword: (email: string) => 
    axios.post(`${API_URL}/auth/forgot-password`, { email }),
  
  resetPassword: (token: string, password: string) => 
    axios.put(`${API_URL}/auth/reset-password/${token}`, { password }),
};
