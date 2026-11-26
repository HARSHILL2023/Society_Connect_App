import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'society_connect_token';
const REFRESH_KEY = 'society_connect_refresh';
const USER_KEY = '@society_connect_user';
const BIOMETRIC_CREDENTIALS_KEY = 'society_connect_biometric_credentials';
const BIOMETRIC_ENABLED_KEY = 'society_connect_biometric_enabled';

const isWeb = Platform.OS === 'web';

export const storage = {
  setToken: async (token) => {
    if (!token) return;
    try {
      if (isWeb) {
        await AsyncStorage.setItem('@society_connect_token', token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (e) {
      console.error('Error saving token:', e);
    }
  },

  getToken: async () => {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem('@society_connect_token');
      }
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) return token;

      const oldToken = await AsyncStorage.getItem('@society_connect_token');
      if (oldToken) {
        await SecureStore.setItemAsync(TOKEN_KEY, oldToken);
        await AsyncStorage.removeItem('@society_connect_token');
        return oldToken;
      }
      return null;
    } catch (e) {
      console.error('Error reading token:', e);
      return null;
    }
  },

  removeToken: async () => {
    try {
      if (!isWeb) await SecureStore.deleteItemAsync(TOKEN_KEY);
      await AsyncStorage.removeItem('@society_connect_token');
    } catch (e) {
      console.error('Error removing token:', e);
    }
  },

  setRefreshToken: async (token) => {
    if (!token) return;
    try {
      if (isWeb) {
        await AsyncStorage.setItem('@society_connect_refresh', token);
      } else {
        await SecureStore.setItemAsync(REFRESH_KEY, token);
      }
    } catch (e) {
      console.error('Error saving refresh token:', e);
    }
  },

  getRefreshToken: async () => {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem('@society_connect_refresh');
      }
      const token = await SecureStore.getItemAsync(REFRESH_KEY);
      if (token) return token;

      const oldToken = await AsyncStorage.getItem('@society_connect_refresh');
      if (oldToken) {
        await SecureStore.setItemAsync(REFRESH_KEY, oldToken);
        await AsyncStorage.removeItem('@society_connect_refresh');
        return oldToken;
      }
      return null;
    } catch (e) {
      console.error('Error reading refresh token:', e);
      return null;
    }
  },

  setUser: async (user) => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user:', e);
    }
  },

  getUser: async () => {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading user:', e);
      return null;
    }
  },

  removeUser: async () => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Error removing user:', e);
    }
  },

  clearAuth: async () => {
    try {
      if (!isWeb) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_KEY);
      }
      await AsyncStorage.multiRemove(['@society_connect_token', '@society_connect_refresh', USER_KEY]);
      // NOTE: intentionally NOT clearing biometric credentials here
      // so user can use biometric on next login after logout.
      // Call clearBiometricAuth() explicitly to remove them.
    } catch (e) {
      console.error('Error clearing auth:', e);
    }
  },

  // --- Biometric credential storage (email + password encrypted via SecureStore) ---
  setBiometricCredentials: async (email, password) => {
    if (!email || !password) return;
    const payload = JSON.stringify({ email, password });
    try {
      if (isWeb) {
        await AsyncStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, payload);
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      } else {
        await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, payload, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
        await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
      }
    } catch (e) {
      console.error('Error saving biometric credentials:', e);
    }
  },

  getBiometricCredentials: async () => {
    try {
      let data = null;
      if (isWeb) {
        data = await AsyncStorage.getItem(BIOMETRIC_CREDENTIALS_KEY);
      } else {
        data = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
      }
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (!parsed?.email || !parsed?.password) return null;
      return parsed;
    } catch (e) {
      console.error('Error reading biometric credentials:', e);
      return null;
    }
  },

  removeBiometricCredentials: async () => {
    try {
      if (isWeb) {
        await AsyncStorage.multiRemove([BIOMETRIC_CREDENTIALS_KEY, BIOMETRIC_ENABLED_KEY]);
      } else {
        await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
        await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
        await AsyncStorage.multiRemove([BIOMETRIC_CREDENTIALS_KEY, BIOMETRIC_ENABLED_KEY]);
      }
    } catch (e) {
      console.error('Error removing biometric credentials:', e);
    }
  },

  hasBiometricCredentials: async () => {
    const creds = await storage.getBiometricCredentials();
    return !!creds;
  },

  setBiometricEnabled: async (enabled) => {
    try {
      if (isWeb) {
        if (enabled) {
          await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
        } else {
          await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
          // Also clear credentials when disabling
          await AsyncStorage.removeItem(BIOMETRIC_CREDENTIALS_KEY);
        }
      } else {
        if (enabled) {
          await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
        } else {
          // Disabling -> remove both flag and credentials
          try { await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY); } catch {}
          try { await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY); } catch {}
          await AsyncStorage.multiRemove([BIOMETRIC_CREDENTIALS_KEY, BIOMETRIC_ENABLED_KEY]);
        }
      }
    } catch (e) {
      console.error('Error setting biometric enabled:', e);
    }
  },

  isBiometricEnabled: async () => {
    try {
      let value = null;
      if (isWeb) {
        value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      } else {
        value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
        if (value === null) {
          // fallback check AsyncStorage
          value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
          if (value) {
            await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, value);
          }
        }
      }
      // Enabled only if flag is 'true' AND credentials exist
      if (value !== 'true') return false;
      const creds = await storage.getBiometricCredentials();
      return !!creds;
    } catch (e) {
      console.error('Error checking biometric enabled:', e);
      return false;
    }
  },

  getBiometricEmail: async () => {
    const creds = await storage.getBiometricCredentials();
    return creds?.email || null;
  },

  clearBiometricAuth: async () => {
    await storage.removeBiometricCredentials();
  },
};
