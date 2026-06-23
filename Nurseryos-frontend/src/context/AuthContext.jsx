import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      loadUserProfile();
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const res = await api.auth.me();
      setUser(res.data);
    } catch (err) {
      setError(err.message);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      setToken(res.data.tokens.accessToken);
      return res.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email, password, fullName, roleName) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.auth.register(email, password, fullName, roleName);
      setSuccess('Account registered successfully! Please wait for Admin approval.');
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        error,
        success,
        setError,
        setSuccess,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
