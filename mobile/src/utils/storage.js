import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'society_connect_token';
const REFRESH_KEY = 'society_connect_refresh';
const USER_KEY = '@society_connect_user';

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
    } catch (e) {
      console.error('Error clearing auth:', e);
    }
  },
};
