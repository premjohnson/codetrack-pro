import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user authentication status on load
  const checkUser = async () => {
    // Avoid making /auth/me API requests if no active session flag exists
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('isLoggedIn');
        setUser(null);
      }
    } catch (error) {
      localStorage.removeItem('isLoggedIn');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.success) {
        setUser(response.data.user);
        localStorage.setItem('isLoggedIn', 'true');
        return response;
      }
    } catch (error) {
      localStorage.removeItem('isLoggedIn');
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      if (response.success) {
        localStorage.setItem('isLoggedIn', 'true');
        setUser(response.data.user);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('isLoggedIn');
      setUser(null);
      setLoading(false);
    }
  };

  const requestOTP = async (email, type) => {
    return await api.post('/auth/otp/request', { email, type });
  };

  const verifyOTP = async (email, otp, type) => {
    return await api.post('/auth/otp/verify', { email, otp, type });
  };

  const resetPassword = async (email, otp, newPassword) => {
    return await api.post('/auth/password-reset', { email, otp, newPassword });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      requestOTP,
      verifyOTP,
      resetPassword,
      refreshUser: checkUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
