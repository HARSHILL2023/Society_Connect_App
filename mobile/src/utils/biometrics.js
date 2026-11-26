import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { storage } from './storage';

/**
 * Biometrics helper - wraps expo-local-authentication + SecureStore credential flow
 */

const isWeb = Platform.OS === 'web';

/**
 * Check if device supports biometrics (hardware + enrolled)
 * @returns {Promise<{ available: boolean, enrolled: boolean, hasHardware: boolean, supportedTypes: number[], biometryType: string }>}
 */
export const checkBiometricSupport = async () => {
  if (isWeb) {
    return { available: false, enrolled: false, hasHardware: false, supportedTypes: [], biometryType: 'none' };
  }
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    const available = hasHardware && enrolled;

    // Map supported types to human readable
    let biometryType = 'none';
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometryType = 'face';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometryType = 'fingerprint';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometryType = 'iris';
    } else if (available) {
      biometryType = 'biometric';
    }

    return { available, enrolled, hasHardware, supportedTypes, biometryType };
  } catch (e) {
    console.error('checkBiometricSupport error:', e);
    return { available: false, enrolled: false, hasHardware: false, supportedTypes: [], biometryType: 'none' };
  }
};

/**
 * Get friendly label/icon for biometry type
 */
export const getBiometryLabel = (type) => {
  switch (type) {
    case 'face':
      return { label: 'Face ID', icon: 'scan-outline', prompt: 'Log in with Face ID' };
    case 'fingerprint':
      return { label: 'Fingerprint', icon: 'finger-print-outline', prompt: 'Log in with Fingerprint' };
    case 'iris':
      return { label: 'Iris', icon: 'eye-outline', prompt: 'Log in with Iris' };
    case 'biometric':
      return { label: 'Biometric', icon: 'finger-print-outline', prompt: 'Log in with Biometrics' };
    default:
      return { label: 'Biometric', icon: 'finger-print-outline', prompt: 'Log in with Biometrics' };
  }
};

/**
 * Prompt user for biometric authentication.
 * Returns { success: boolean, error?: string }
 */
export const authenticateWithBiometrics = async (promptMessage = 'Authenticate to login') => {
  if (isWeb) {
    return { success: false, error: 'Biometrics not available on web' };
  }
  try {
    const support = await checkBiometricSupport();
    if (!support.available) {
      if (!support.hasHardware) return { success: false, error: 'Device does not support biometrics' };
      if (!support.enrolled) return { success: false, error: 'No biometrics enrolled. Please set up Fingerprint/Face ID in device settings.' };
      return { success: false, error: 'Biometrics not available' };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      disableDeviceFallback: true, // don't fallback to passcode
      requireConfirmation: false,
    });

    if (result.success) {
      return { success: true };
    }

    // Map errors to user-friendly messages
    let error = 'Authentication failed';
    if (result.error === 'user_cancel') error = 'Authentication cancelled';
    else if (result.error === 'system_cancel') error = 'System cancelled authentication';
    else if (result.error === 'not_available') error = 'Biometric not available';
    else if (result.error === 'not_enrolled') error = 'No biometrics enrolled';
    else if (result.error === 'lockout') error = 'Too many attempts. Try again later.';
    else if (result.warning) error = result.warning;

    return { success: false, error };
  } catch (e) {
    console.error('authenticateWithBiometrics error:', e);
    return { success: false, error: e.message || 'Biometric authentication error' };
  }
};

/**
 * Enable biometric login by saving credentials securely.
 * Should be called after successful email/password login.
 */
export const enableBiometricLogin = async (email, password) => {
  if (isWeb) return { success: false, error: 'Biometrics not available on web' };
  const support = await checkBiometricSupport();
  if (!support.available) {
    return { success: false, error: 'Biometrics not available or not enrolled on this device' };
  }
  try {
    await storage.setBiometricCredentials(email, password);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

/**
 * Disable biometric login (removes stored credentials)
 */
export const disableBiometricLogin = async () => {
  try {
    await storage.removeBiometricCredentials();
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

/**
 * Check if biometric login is ready to use (enabled + credentials + hardware)
 */
export const isBiometricLoginAvailable = async () => {
  if (isWeb) return false;
  try {
    const enabled = await storage.isBiometricEnabled();
    if (!enabled) return false;
    const support = await checkBiometricSupport();
    return support.available;
  } catch {
    return false;
  }
};

/**
 * Get the email stored for biometric login (for UI display)
 */
export const getBiometricEmail = async () => {
  return storage.getBiometricEmail();
};
