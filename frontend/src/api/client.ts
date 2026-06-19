import axios from 'axios';

// Base URL: /api in development (Vite proxy forwards to http://localhost:5000)
// Override with VITE_API_BASE_URL in production.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// ─── Request interceptor ──────────────────────────────────────────────────────
// TODO: Attach JWT access token when the auth backend is ready.
// Replace the comment block below with:
//   const token = tokenStore.get();
//   if (token) config.headers.Authorization = `Bearer ${token}`;

client.interceptors.request.use(
  (config) => {
    // Placeholder for token attachment
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
