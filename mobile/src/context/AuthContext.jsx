import React, { createContext, useState, useEffect, useContext } from 'react';
import { storage } from '../utils/storage';
import { authAPI, setOnUnauthorizedCallback } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await storage.getToken();
        const savedUser = await storage.getUser();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);

          try {
            const freshUser = await authAPI.getMe();
            setUser(freshUser);
            await storage.setUser(freshUser);
          } catch (e) {
            // Token invalid - will be cleared by 401 handler
          }
        }
      } catch (e) {
        console.error('Session restore failed:', e);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    setOnUnauthorizedCallback(() => {
      setUser(null);
      setToken(null);
    });
  }, []);

  const saveAuth = async (data) => {
    const newToken = data.token || data.accessToken;
    const refreshToken = data.refreshToken || null;

    await storage.setToken(newToken);
    if (refreshToken) await storage.setRefreshToken(refreshToken);
    await storage.setUser(data.user);

    setToken(newToken);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    return saveAuth(data);
  };

  const register = async (userData) => {
    const data = await authAPI.register(userData);
    return saveAuth(data);
  };

  const logout = async () => {
    await storage.clearAuth();
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const updatedUser = await authAPI.updateProfile(profileData);
    await storage.setUser(updatedUser);
    setUser(updatedUser);
    return updatedUser;
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    role: user?.role || null,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be inside AuthProvider');
  return context;
};

export default AuthContext;
