import axios from 'axios';
import Constants from 'expo-constants';
import { storage } from '../utils/storage';

// Deployed backend (Render). Used whenever no override is provided.
export const PRODUCTION_API_URL = 'https://society-connect-app.onrender.com/api';

const normalize = (url) => (url ? url.trim().replace(/\/+$/, '') : null);

// Decide which backend URL to use: env override, then app.json extra, then production.
const getBaseUrl = () => {
  const fromEnv = normalize(process.env.EXPO_PUBLIC_API_URL);
  if (fromEnv) return fromEnv;

  // Fallback to app.json extra.apiUrl (useful when .env not reloaded)
  const extraUrl = normalize(
    Constants.expoConfig?.extra?.apiUrl || Constants.manifest?.extra?.apiUrl
  );
  if (extraUrl) return extraUrl;

  return PRODUCTION_API_URL;
};

export const API_BASE_URL = getBaseUrl();

if (__DEV__) {
  console.log('[API] Base URL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  // Render's free tier can cold-start, so allow extra time for the first request.
  timeout: 60000,
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

// Simple error message for UI - handles all network failure variants for demo
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors?.[0]) return error.response.data.errors[0];
  // axios network errors have no response - detect via code or message
  const isNetworkError =
    !error.response &&
    (error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message === 'Network Error' ||
      error.message?.includes('timeout') ||
      error.message?.includes('Network Error') ||
      error.message?.includes('Cannot reach'));
  if (isNetworkError) {
    return `Network Error: cannot reach backend at ${API_BASE_URL}. Check your internet connection and try again.`;
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
