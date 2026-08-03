'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { setAuthTokens, clearAuthTokens, getAccessToken } from '@/lib/auth';
import type { UserProfile } from '@shared/types';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        clearAuthTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const res = await api.post('/auth/login', data);
    const { user: userData, tokens } = res.data;
    setAuthTokens(tokens.access_token, tokens.refresh_token);
    setUser(userData);
    return userData;
  };

  const register = async (data: {
    email: string;
    full_name: string;
    password: string;
    phone?: string;
  }) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  };

  const verifyEmail = async (email: string, code: string) => {
    const res = await api.post('/auth/verify-email', { email, code });
    return res.data;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('formix_refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch (err) {
      // ignore logout errors
    } finally {
      clearAuthTokens();
      setUser(null);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    verifyEmail,
    logout,
  };
}
