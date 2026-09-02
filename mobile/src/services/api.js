import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { storage } from '../utils/storage';

// Determine default local API URL based on platform
// In Expo Go, Constants.expoConfig.hostUri contains the Metro host IP (e.g. "192.168.1.238:8081")
// which equals the PC's current LAN IP — the same host where the backend should be reachable on :5000.
// This provides a resilient fallback when EXPO_PUBLIC_API_URL is stale or missing after DHCP reassignment.
const getExpoHostIp = () => {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      Constants.manifest?.hostUri ||
      Constants.manifest2?.extra?.expoGo?.developer?.host ||
      null;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      // Only use LAN IPs, not tunnel or exp.direct
      if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return host;
    }
  } catch {}
  return null;
};

const getDefaultBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  const expoHostIp = getExpoHostIp();
  if (envUrl) {
    // Auto-correct stale LAN IP at runtime (DHCP reassignment)
    // If envUrl is a 192.168.x.x address but current Expo host IP differs, use the host IP instead
    // This prevents persistent Network Error when .env is stale and phone fetched old bundle
    if (expoHostIp && envUrl.includes('192.168.')) {
      const match = envUrl.match(/http:\/\/(\d+\.\d+\.\d+\.\d+)/);
      const envIp = match ? match[1] : null;
      if (envIp && envIp !== expoHostIp) {
        // Preserve port/path from envUrl, replace host
        const corrected = envUrl.replace(envIp, expoHostIp);
        // Log in DEV — safe (no secrets)
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.warn(`[API] Auto-correcting stale EXPO_PUBLIC_API_URL ${envUrl} → ${corrected} (current host ${expoHostIp})`);
        }
        return corrected;
      }
    }
    return envUrl;
  }
  // Expo Go fallback: derive backend URL from Metro host IP (same machine)
  if (expoHostIp) {
    return `http://${expoHostIp}:5000/api`;
  }
  // Android emulator routes host machine loopback through 10.0.2.2
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  // iOS simulator and web use localhost
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getDefaultBaseUrl();

// ── Safe Debug Logging (no secrets) ──
if (__DEV__) {
  console.log('[API] Base URL:', API_BASE_URL);
  console.log('[API] EXPO_PUBLIC_API_URL env:', process.env.EXPO_PUBLIC_API_URL || '(not set, using fallback)');
  const expoIp = getExpoHostIp();
  if (expoIp) console.log('[API] Expo host IP (from hostUri):', expoIp);
  if (process.env.EXPO_PUBLIC_API_URL && expoIp && !process.env.EXPO_PUBLIC_API_URL.includes(expoIp)) {
    console.warn(`[API] WARNING: EXPO_PUBLIC_API_URL IP differs from Expo host IP (${expoIp}). If Network Error occurs, update mobile/.env to http://${expoIp}:5000/api and restart with --clear`);
  }
  if (API_BASE_URL.includes('192.168.1.142')) {
    console.warn('[API] WARNING: Base URL contains stale IP 192.168.1.142 — update mobile/.env to current LAN IP (e.g. 192.168.1.238)');
  }
  if (API_BASE_URL.includes('localhost') && Platform.OS === 'android' && !API_BASE_URL.includes('10.0.2.2')) {
    console.warn('[API] WARNING: localhost on Android physical device will fail — use LAN IP for Expo Go');
  }
}

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

// Request Interceptor: Attach JWT Bearer token + safe debug logging
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (__DEV__) {
      const fullUrl = `${config.baseURL || API_BASE_URL}${config.url || ''}`;
      console.log(`[API] → ${config.method?.toUpperCase()} ${fullUrl}`);
    }
    return config;
  },
  (error) => {
    if (__DEV__) {
      console.log('[API] Request interceptor error:', error.message, 'code:', error.code);
    }
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 Unauthorized + safe error diagnostics
api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[API] ← ${response.status} ${response.config?.method?.toUpperCase()} ${response.config?.url}`);
    }
    return response;
  },
  async (error) => {
    if (__DEV__) {
      // Safe diagnostics — NEVER log password / token
      console.log('[API] ✖ Error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
      });
      if (!error.response && error.request) {
        console.log('[API] Network Error hint: backend unreachable at', error.config?.baseURL, '— check LAN IP, firewall, and that backend is listening on 0.0.0.0');
      }
    }
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
  // Axios network errors have no response — surface actionable hint
  if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
    return `Network Error: cannot reach backend at ${API_BASE_URL}. Ensure phone & PC are on same Wi-Fi and backend is running.`;
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

const unwrapPaginated = (data) => {
  // Backend now returns { tickets, pagination } but older code expects array
  if (data && Array.isArray(data.tickets)) return data.tickets;
  if (data && Array.isArray(data.users)) return data.users;
  return data;
};

export const ticketAPI = {
  getMyTickets: async (params = {}) => {
    const res = await api.get('/tickets/my', { params });
    const data = res.data.data;
    // Handle both paginated {tickets, pagination} and plain array for backward compat
    if (data && data.tickets) return unwrapPaginated(data);
    return data;
  },

  getAllTickets: async (params = {}) => {
    const res = await api.get('/tickets', { params });
    const data = res.data.data;
    if (data && data.tickets) return unwrapPaginated(data);
    return data;
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
    const data = res.data.data;
    if (data && data.users) return unwrapPaginated(data);
    return data;
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
