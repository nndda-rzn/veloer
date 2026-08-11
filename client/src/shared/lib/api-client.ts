import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor: handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if already on login page or if it's an auth check request
      const isOnLogin = window.location.pathname === '/login';
      const isAuthCheck = error.config?.url?.includes('/auth/me');

      if (!isOnLogin && !isAuthCheck) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
