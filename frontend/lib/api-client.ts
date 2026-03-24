// Axios instance with JWT interceptors
// Attaches Bearer token to every request, refreshes on 401

import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, clearAuth } from './auth-utils';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach Bearer token if available
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-refresh access token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = getRefreshToken();

      if (refresh) {
        try {
          const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
          const { data } = await axios.post(`${baseURL}/auth/refresh/`, { refresh });
          setAccessToken(data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return apiClient(originalRequest);
        } catch {
          clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } else {
        clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
