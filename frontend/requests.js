import axios from 'axios';

// Create an Axios instance with Laravel backend URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add a request interceptor to attach the token automatically
api.interceptors.request.use(
  (config) => {
    // Try admin token first, then patient token, then doctor token
    const token = localStorage.getItem('adminToken') || localStorage.getItem('patientToken') || localStorage.getItem('doctorToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Don't clear tokens or redirect if we're on auth/admin/doctor pages
      const currentPath = window.location.pathname;
      const isProtectedPage = currentPath.startsWith('/admin') || 
                              currentPath.startsWith('/doctor') ||
                              currentPath === '/login' || 
                              currentPath === '/register';
      
      if (!isProtectedPage) {
        // Token expired or invalid, clear storage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('patientToken');
        localStorage.removeItem('doctorToken');
        localStorage.removeItem('userData');
        // Redirect to login
        window.location.href = '/login';
      } else {
        // On protected pages, just reject the error without redirecting
        // The component will handle the error display
        console.warn('401 error on protected page, not redirecting:', currentPath);
      }
    }
    return Promise.reject(error);
  }
);

export default api;