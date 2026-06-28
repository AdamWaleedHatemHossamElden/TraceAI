import axios from 'axios';
import { tokenStore } from '../utils/tokenStore';

// Base URL: /api in development (Vite proxy forwards to http://localhost:5000)
// Override with VITE_API_BASE_URL in production.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// ─── Request interceptor ──────────────────────────────────────────────────────
// Attaches the Bearer token from sessionStorage to every outgoing request.
// If no token is stored the Authorization header is omitted, leaving the
// endpoint to return 401 as normal.

client.interceptors.request.use(
  (config) => {
    const token = tokenStore.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // When the request body is FormData, remove the default 'application/json'
    // Content-Type so the browser (via XHR) can supply the correct
    // 'multipart/form-data; boundary=...' value including the boundary token.
    // Setting it manually would omit the boundary and break multipart parsing.
    if (config.data instanceof FormData) {
      config.headers.delete('Content-Type');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────────
// Re-throws errors with original Axios structure so components can call
// parseApiError() / parseFieldErrors() from utils/errorUtils.ts.

client.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default client;
