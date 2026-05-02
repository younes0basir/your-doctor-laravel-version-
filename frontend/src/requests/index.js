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
    // Try tokens in priority order
    const token = localStorage.getItem('adminToken') || 
                  localStorage.getItem('doctorToken') || 
                  localStorage.getItem('patientToken');
                  
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
      console.warn('401 Unauthorized - Clearing session and redirecting to login');
      
      // Clear all possible tokens and user data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('patientToken');
      localStorage.removeItem('doctorToken');
      localStorage.removeItem('userData');
      
      // Redirect to login unless already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
