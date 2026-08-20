import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from '../utils/storage';

// Determine default local API URL based on platform
const getDefaultBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Android emulator routes host machine loopback through 10.0.2.2
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  // iOS simulator and web use localhost
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getDefaultBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Unauthorized callback registry
let unauthorizedCallback = null;
export const setOnUnauthorizedCallback = (callback) => {
  unauthorizedCallback = callback;
};

// Request Interceptor: Attach JWT Bearer token
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await storage.clearAuth();
      if (unauthorizedCallback) {
        unauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

// Helper to extract clean error message
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors[0];
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected network error occurred. Please try again.';
};

/* ─── API Endpoints ─── */

export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data);
    return res.data.data;
  },
};

export const ticketAPI = {
  getMyTickets: async (params = {}) => {
    const res = await api.get('/tickets/my', { params });
    return res.data.data;
  },

  getAllTickets: async (params = {}) => {
    const res = await api.get('/tickets', { params });
    return res.data.data;
  },

  getTicketById: async (id) => {
    const res = await api.get(`/tickets/${id}`);
    return res.data.data;
  },

  createTicket: async (ticketData) => {
    const res = await api.post('/tickets', ticketData);
    return res.data.data;
  },

  updateTicketStatus: async (id, statusData) => {
    const res = await api.patch(`/tickets/${id}/status`, statusData);
    return res.data.data;
  },

  deleteTicket: async (id) => {
    const res = await api.delete(`/tickets/${id}`);
    return res.data;
  },
};

export const userAPI = {
  getAllUsers: async (params = {}) => {
    const res = await api.get('/users', { params });
    return res.data.data;
  },

  getUserById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data.data;
  },

  createUser: async (userData) => {
    const res = await api.post('/users', userData);
    return res.data.data;
  },

  updateUser: async (id, userData) => {
    const res = await api.put(`/users/${id}`, userData);
    return res.data.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};

export const adminAPI = {
  getMetrics: async () => {
    const res = await api.get('/admin/metrics');
    return res.data.data;
  },
};

export default api;
