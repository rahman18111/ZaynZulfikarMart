import axios from 'axios';

// Konfigurasi endpoint API:
// 1. Jika diset di environment variable VITE_API_URL (misal saat deploy di Vercel / Netlify)
// 2. Jika mode development lokal (port 5173), gunakan port backend 5000
// 3. Fallback default relative /api jika disajikan bersama backend (Single Port / Reverse Proxy)
const envApiUrl = import.meta.env.VITE_API_URL;
const isDevPort = typeof window !== 'undefined' && window.location.port === '5173';
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const BASE_URL = envApiUrl || (isDevPort ? `http://${hostname}:5000/api` : '/api');

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zayn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('zayn_token');
      localStorage.removeItem('zayn_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
