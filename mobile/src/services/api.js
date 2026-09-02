import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { storage } from '../utils/storage';

// Find the LAN IP that Expo is using (e.g. 192.168.1.238 from "192.168.1.238:8081")
const getExpoHostIp = () => {
  try {
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return host;
    }
  } catch {}
  return null;
};

// Decide which backend URL to use
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const expoIp = getExpoHostIp();
  if (expoIp) return `http://${expoIp}:5000/api`;

  if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api';

  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getBaseUrl();

if (__DEV__) {
  console.log('[API] Base URL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

// When API returns 401, clear auth and go to login
let onUnauthorized = null;
export const setOnUnauthorizedCallback = (callback) => {
  onUnauthorized = callback;
};

// Add token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await storage.clearAuth();
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  }
);

// Simple error message for UI
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors?.[0]) return error.response.data.errors[0];
  if (error.message === 'Network Error') {
    return `Network Error: cannot reach backend at ${API_BASE_URL}. Check Wi-Fi and backend.`;
  }
  if (error.message) return error.message;
  return 'Something went wrong. Please try again.';
};

// Auth APIs
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

// Helper for paginated responses
const getList = (data) => {
  if (data?.tickets) return data.tickets;
  if (data?.users) return data.users;
  return data;
};

// Ticket APIs
export const ticketAPI = {
  getMyTickets: async (params = {}) => {
    const res = await api.get('/tickets/my', { params });
    return getList(res.data.data);
  },
  getAllTickets: async (params = {}) => {
    const res = await api.get('/tickets', { params });
    return getList(res.data.data);
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

// User APIs
export const userAPI = {
  getAllUsers: async (params = {}) => {
    const res = await api.get('/users', { params });
    return getList(res.data.data);
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

// Admin APIs
export const adminAPI = {
  getMetrics: async () => {
    const res = await api.get('/admin/metrics');
    return res.data.data;
  },
};

export default api;
