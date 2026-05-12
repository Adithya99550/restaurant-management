'use client';

import { useState, useEffect } from 'react';
import { getAuth, clearAuth } from '../lib/auth';

export const useAuth = () => {
  const [auth, setAuthState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authData = getAuth();
    setAuthState(authData);
    setLoading(false);
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