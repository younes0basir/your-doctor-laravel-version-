import React, { createContext, useState, useEffect } from 'react';
import api from '../requests';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('patientToken') || localStorage.getItem('doctorToken');
  });
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(() => {
    return localStorage.getItem('patientToken') ? 'patient' : 
           localStorage.getItem('doctorToken') ? 'doctor' : null;
  });

  // Load user data on mount if token exists
  useEffect(() => {
    const loadUserData = async () => {
      const patientToken = localStorage.getItem('patientToken');
      const doctorToken = localStorage.getItem('doctorToken');
      
      if (patientToken || doctorToken) {
        try {
          console.log('Loading user data from API...');
          const response = await api.get('/user');
          console.log('User data loaded:', response.data);
          setUserData(response.data);
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
      const newUserType = localStorage.getItem('patientToken') ? 'patient' : 'doctor';
      setUserType(newUserType);
    } else {
      setUserType(null);
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem('patientToken');
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctor');
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
