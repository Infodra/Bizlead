import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 600000, // 10 minute timeout for email scraping (25 companies × 15 seconds)
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.debug('✅ Token added to request:', token.substring(0, 20) + '...');
  } else {
    console.warn('⚠️ No token found in localStorage');
  }
  return config;
});

// Handle token expiration and network errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log all error responses for debugging
    console.debug('API Error Response:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    
    // Handle 402 Payment Required - important, don't suppress
    if (error.response?.status === 402) {
      console.warn('Payment required - user must complete subscription');
      return Promise.reject(error);
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      
      // On dashboard search/database pages, let the page handle 401 errors
      if (
        currentPath.includes('/dashboard/search') ||
        currentPath.includes('/dashboard/database') ||
        currentPath.includes('/dashboard/crm')
      ) {
        // The search/database page will handle the 401 error
        return Promise.reject(error);
      }
      
      // On other pages, redirect to login
      if (
        !currentPath.includes('/auth/login') &&
        !currentPath.includes('/auth/signup') &&
        !currentPath.includes('/payment') &&
        !currentPath.includes('/pricing')
      ) {
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      } else if (currentPath.includes('/payment')) {
        // On payment page, suppress 401 errors and return empty response instead
        // This allows the page to function without valid authentication
        return Promise.resolve({ data: {} } as any);
      }
    }
    
    // Handle network errors
    if (!error.response) {
      // Network error - could be CORS, timeout, or connection refused
      console.debug('Network error:', {
        message: error.message,
        code: error.code,
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

