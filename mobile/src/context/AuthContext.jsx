import React, { createContext, useState, useEffect, useContext } from 'react';
import { storage } from '../utils/storage';
import { authAPI, setOnUnauthorizedCallback } from '../services/api';
import {
  checkBiometricSupport,
  authenticateWithBiometrics,
  getBiometryLabel,
} from '../utils/biometrics';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Biometric states
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState('none');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricEmail, setBiometricEmail] = useState(null);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  const refreshBiometricState = async () => {
    try {
      const support = await checkBiometricSupport();
      setIsBiometricSupported(support.available);
      setBiometricType(support.biometryType);

      const enabled = await storage.isBiometricEnabled();
      setBiometricEnabled(enabled);

      const email = await storage.getBiometricEmail();
      setBiometricEmail(email);
      return { support, enabled, email };
    } catch (e) {
      console.error('refreshBiometricState error:', e);
      return { support: null, enabled: false, email: null };
    }
  };

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

    const init = async () => {
      await restoreSession();
      await refreshBiometricState();
    };

    init();

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
    const loggedInUser = await saveAuth(data);
    // Save credentials securely for future biometric login (requirement: save email+password in SecureStore)
    // This enables biometric on next login. User can disable later from profile.
    try {
      await storage.setBiometricCredentials(email, password);
      await refreshBiometricState();
    } catch (e) {
      console.error('Failed to save biometric credentials:', e);
    }
    return loggedInUser;
  };

  const register = async (userData) => {
    const data = await authAPI.register(userData);
    const newUser = await saveAuth(data);
    // Also save credentials after register for biometric future use
    if (userData?.email && userData?.password) {
      try {
        await storage.setBiometricCredentials(userData.email, userData.password);
        await refreshBiometricState();
      } catch (e) {
        console.error('Failed to save biometric credentials after register:', e);
      }
    }
    return newUser;
  };

  const logout = async (options = {}) => {
    const { clearBiometric = false } = options;
    await storage.clearAuth();
    if (clearBiometric) {
      await storage.removeBiometricCredentials();
      await refreshBiometricState();
    }
    setToken(null);
    setUser(null);
  };

  // Biometric: authenticate then login with stored credentials
  const loginWithBiometrics = async () => {
    setIsBiometricLoading(true);
    try {
      const support = await checkBiometricSupport();
      if (!support.available) {
        throw new Error(
          !support.hasHardware
            ? 'This device does not support biometric authentication.'
            : !support.enrolled
              ? 'No biometrics enrolled. Please set up Fingerprint/Face ID in device settings.'
              : 'Biometric authentication not available.'
        );
      }

      const creds = await storage.getBiometricCredentials();
      if (!creds?.email || !creds?.password) {
        throw new Error('No saved credentials found. Please log in with email and password first.');
      }

      const { label } = getBiometryLabel(support.biometryType);
      const authResult = await authenticateWithBiometrics(`Log in with ${label}`);
      if (!authResult.success) {
        throw new Error(authResult.error || 'Biometric authentication failed');
      }

      // Biometric verified - perform normal login with stored creds
      const data = await authAPI.login(creds.email, creds.password);
      const loggedInUser = await saveAuth(data);
      return loggedInUser;
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const enableBiometric = async (email, password) => {
    // Explicitly enable with given credentials (used from settings if needed)
    if (!email || !password) {
      const creds = await storage.getBiometricCredentials();
      if (!creds) throw new Error('No credentials to enable biometric. Please login first.');
      await storage.setBiometricEnabled(true);
      await refreshBiometricState();
      return true;
    }
    const support = await checkBiometricSupport();
    if (!support.available) throw new Error('Biometrics not available on this device');
    const authResult = await authenticateWithBiometrics('Enable biometric login');
    if (!authResult.success) throw new Error(authResult.error || 'Authentication failed');
    await storage.setBiometricCredentials(email, password);
    await refreshBiometricState();
    return true;
  };

  const disableBiometric = async () => {
    await storage.removeBiometricCredentials();
    await refreshBiometricState();
    return true;
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
    // Biometric
    isBiometricSupported,
    biometricType,
    biometricEnabled,
    biometricEmail,
    isBiometricLoading,
    loginWithBiometrics,
    enableBiometric,
    disableBiometric,
    refreshBiometricState,
    checkBiometricSupport,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be inside AuthProvider');
  return context;
};

export default AuthContext;
