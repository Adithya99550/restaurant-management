'use client';

import { useState, useEffect } from 'react';
import { getAuth, clearAuth } from '../lib/auth';
import api from '../lib/api';

export const useAuth = () => {
  const [auth, setAuthState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const authData = getAuth();
      if (!authData) {
        setLoading(false);
        return;
      }

      try {
        // Validate with server
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setAuthState({ token: authData.token, user: res.data.data });
          localStorage.setItem('user', JSON.stringify(res.data.data));
        }
      } catch (error) {
        // If server is down or token invalid, clear auth
        console.error('Session validation failed:', error);
        clearAuth();
        setAuthState(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const setAuth = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({ token, user });
  };

  const logout = () => {
    clearAuth();
    setAuthState(null);
  };

  return { auth, setAuth, logout, loading };
};

export default useAuth;