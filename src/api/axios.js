import axios from 'axios';
import { sanitizeObject } from '../utils/security';

const base = process.env.REACT_APP_API_BASE_URL;
if (!base) {
  console.warn('REACT_APP_API_BASE_URL not set. API calls may fail.');
}

const api = axios.create({
  baseURL: base,
  timeout: 60000, // 60 second timeout - increased for better stability
  headers: {
    'Content-Type': 'application/json',
    // X-Requested-With removed to avoid CORS issues
    // Backend CORS config needs to be updated to allow custom headers
  },
});

// Request interceptor - automatically add auth token to requests and sanitize data
api.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Sanitize request data to prevent XSS and injection attacks
    if (config.data && typeof config.data === 'object') {
      config.data = sanitizeObject(config.data);
    }
    
    // Note: X-Request-Time header removed to avoid CORS issues
    // Backend needs to allow custom headers in CORS configuration
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log detailed error information for debugging
    if (error.response) {
      // Server responded with error status
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method
      });
    } else if (error.request) {
      // Request made but no response received
      console.error('API No Response:', {
        url: error.config?.url,
        method: error.config?.method,
        message: 'No response received from server'
      });
    } else {
      // Something happened in setting up the request
      console.error('API Request Setup Error:', error.message);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh');
      if (refreshToken) {
        try {
          // Try to refresh the token
          const response = await axios.post(`${base}token/refresh/`, {
            refresh: refreshToken
          });
          
          const newAccessToken = response.data.access;
          localStorage.setItem('access', newAccessToken);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, logout user
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
