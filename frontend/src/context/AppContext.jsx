import React, { createContext, useState, useEffect } from 'react';
import api from '../requests';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('patientToken') || 
           localStorage.getItem('doctorToken') || 
           localStorage.getItem('adminToken') || 
           localStorage.getItem('assistantToken') ||
           localStorage.getItem('token');
  });
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(() => {
    if (localStorage.getItem('patientToken')) return 'patient';
    if (localStorage.getItem('doctorToken')) return 'doctor';
    if (localStorage.getItem('adminToken')) return 'admin';
    if (localStorage.getItem('assistantToken')) return 'assistant';
    return null;
  });

  // Load user data on mount if token exists
  useEffect(() => {
    const loadUserData = async () => {
      const patientToken = localStorage.getItem('patientToken');
      const doctorToken = localStorage.getItem('doctorToken');
      const adminToken = localStorage.getItem('adminToken');
      const assistantToken = localStorage.getItem('assistantToken');
      const genericToken = localStorage.getItem('token');
      
      if (patientToken || doctorToken || adminToken || assistantToken || genericToken) {
        try {
          console.log('Loading user data from API...');
          const response = await api.get('/user');
          console.log('User data loaded:', response.data);
          setUserData(response.data?.user || response.data);
        } catch (error) {
          console.error('Failed to load user data:', error);
          // Don't clear tokens here - let the interceptor handle 401s
        }
      }
    };
    
    loadUserData();
  }, []);

  // Update userType when token changes
  useEffect(() => {
    if (token) {
      if (localStorage.getItem('patientToken')) setUserType('patient');
      else if (localStorage.getItem('doctorToken')) setUserType('doctor');
      else if (localStorage.getItem('adminToken')) setUserType('admin');
      else if (localStorage.getItem('assistantToken')) setUserType('assistant');
    } else {
      setUserType(null);
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem('patientToken');
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('assistantToken');
    localStorage.removeItem('token');
    localStorage.removeItem('doctor');
    localStorage.removeItem('admin');
    localStorage.removeItem('assistant');
    localStorage.removeItem('userData');
    setToken(null);
    setUserData(null);
    setUserType(null);
  };

  return (
    <AppContext.Provider value={{ 
      token, 
      setToken, 
      userData, 
      setUserData, 
      userType,
      logout 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
