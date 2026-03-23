'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAuthToken } from '../lib/api';
import { saveAuth, clearAuth, getStoredToken, getStoredUser } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = getStoredToken();
    const savedUser = getStoredUser();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
      setAuthToken(savedToken);
    }

    setLoading(false);
  }, []);

  const login = (authPayload) => {
    const authToken = authPayload.token;
    const authUser = {
      _id: authPayload._id,
      name: authPayload.name,
      email: authPayload.email,
      role: authPayload.role,
      avatar: authPayload.avatar || '',
      bio: authPayload.bio || '',
    };

    setToken(authToken);
    setUser(authUser);
    saveAuth(authToken, authUser);
    setAuthToken(authToken);
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload);
    login(response.data);
    return response.data;
  };

  const signIn = async (payload) => {
    const response = await api.post('/auth/login', payload);
    login(response.data);
    return response.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearAuth();
    setAuthToken(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      saveAuth(token, next);
      return next;
    });
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === 'admin',
      register,
      signIn,
      logout,
      updateUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
