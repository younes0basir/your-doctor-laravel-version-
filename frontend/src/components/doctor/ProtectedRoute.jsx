import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const doctorToken = localStorage.getItem('doctorToken');
        if (!doctorToken) {
          navigate('/doctor/login');
          return;
        }

        // Verify token by making a request to the protected profile endpoint
        await axios.get('http://localhost:5000/api/doctors/profile', {
          headers: { 'doctor-token': doctorToken }
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
        // Clear doctor-specific data
        localStorage.removeItem('doctorToken');
        localStorage.removeItem('doctor');
        navigate('/doctor/login');
      }
    };

    verifyAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
