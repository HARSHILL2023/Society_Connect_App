import React, { createContext, useState, useEffect, useContext } from 'react';
import { storage } from '../utils/storage';
import { authAPI, setOnUnauthorizedCallback } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authentication state from storage on app launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await storage.getToken();
        const storedUser = await storage.getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);

          // Verify token validity in background
          authAPI.getMe()
            .then((freshUser) => {
              setUser(freshUser);
              storage.setUser(freshUser);
            })
            .catch(() => {
              // Token invalid/expired - handled by response interceptor
            });
        }
      } catch (e) {
        console.error('Session restoration failed:', e);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    // Register callback for 401 Unauthorized responses
    setOnUnauthorizedCallback(() => {
      setUser(null);
      setToken(null);
    });
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    await storage.setToken(data.token);
    await storage.setUser(data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await authAPI.register(userData);
    await storage.setToken(data.token);
    await storage.setUser(data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
