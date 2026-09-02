import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Keys
const TOKEN_KEY = 'society_connect_token';
const REFRESH_KEY = 'society_connect_refresh';
const USER_KEY = '@society_connect_user';

// Helper: SecureStore only works on native; web fallback to AsyncStorage
const isNative = Platform.OS !== 'web';

export const storage = {
  // Token - stored securely on device (expo-secure-store), fallback to AsyncStorage on web
  setToken: async (token) => {
    try {
      if (isNative && token) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        // Also migrate cleanup: remove old AsyncStorage token if exists
        try { await AsyncStorage.removeItem('@society_connect_token'); } catch {}
      } else if (token) {
        await AsyncStorage.setItem('@society_connect_token', token);
      }
    } catch (e) {
      console.error('Error saving auth token:', e);
      // Fallback to AsyncStorage
      try { await AsyncStorage.setItem('@society_connect_token', token); } catch {}
    }
  },

  getToken: async () => {
    try {
      if (isNative) {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) return token;
        // Migration: check old AsyncStorage key
        const legacy = await AsyncStorage.getItem('@society_connect_token');
        if (legacy) {
          // Migrate to SecureStore
          await SecureStore.setItemAsync(TOKEN_KEY, legacy);
          await AsyncStorage.removeItem('@society_connect_token');
          return legacy;
        }
        return null;
      }
      return await AsyncStorage.getItem('@society_connect_token');
    } catch (e) {
      console.error('Error retrieving auth token:', e);
      return null;
    }
  },

  removeToken: async () => {
    try {
      if (isNative) await SecureStore.deleteItemAsync(TOKEN_KEY);
      await AsyncStorage.removeItem('@society_connect_token');
    } catch (e) {
      console.error('Error removing auth token:', e);
    }
  },

  setRefreshToken: async (token) => {
    try {
      if (!token) return;
      if (isNative) {
        await SecureStore.setItemAsync(REFRESH_KEY, token);
        try { await AsyncStorage.removeItem('@society_connect_refresh'); } catch {}
      } else {
        await AsyncStorage.setItem('@society_connect_refresh', token);
      }
    } catch (e) {
      console.error('Error saving refresh token:', e);
      try { await AsyncStorage.setItem('@society_connect_refresh', token); } catch {}
    }
  },

  getRefreshToken: async () => {
    try {
      if (isNative) {
        const t = await SecureStore.getItemAsync(REFRESH_KEY);
        if (t) return t;
        const legacy = await AsyncStorage.getItem('@society_connect_refresh');
        if (legacy) {
          await SecureStore.setItemAsync(REFRESH_KEY, legacy);
          await AsyncStorage.removeItem('@society_connect_refresh');
          return legacy;
        }
        return null;
      }
      return await AsyncStorage.getItem('@society_connect_refresh');
    } catch (e) {
      console.error('Error retrieving refresh token:', e);
      return null;
    }
  },

  // User - JSON, stored in AsyncStorage (not sensitive, but persisted)
  setUser: async (user) => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user data:', e);
    }
  },

  getUser: async () => {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error retrieving user data:', e);
      return null;
    }
  },

  removeUser: async () => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Error removing user data:', e);
    }
  },

  // Clear all auth state
  clearAuth: async () => {
    try {
      if (isNative) {
        try { await SecureStore.deleteItemAsync(TOKEN_KEY); } catch {}
        try { await SecureStore.deleteItemAsync(REFRESH_KEY); } catch {}
      }
      await AsyncStorage.multiRemove(['@society_connect_token', '@society_connect_refresh', USER_KEY]);
    } catch (e) {
      console.error('Error clearing auth storage:', e);
    }
  },
};
