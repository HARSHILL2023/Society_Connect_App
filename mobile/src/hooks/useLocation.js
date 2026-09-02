import { useState, useRef, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';

// Beginner-friendly hook for foreground location
// Manages: permission, current position, watcher cleanup
export const useLocation = () => {
  const [permission, setPermission] = useState(null);
  const [location, setLocation] = useState(null); // { latitude, longitude, address }
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const watcherRef = useRef(null);

  const requestPermission = useCallback(async () => {
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setPermission({ granted, status });
      if (!granted) {
        setError('Location permission denied. Enable location to attach complaint location.');
      }
      return granted;
    } catch (e) {
      setError(e.message || 'Failed to request location permission.');
      return false;
    }
  }, []);

  const checkPermission = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    const granted = status === 'granted';
    setPermission({ granted, status });
    return granted;
  }, []);

  // Get current position once + reverse geocode
  const getCurrentLocation = useCallback(async () => {
    setIsFetching(true);
    setError('');
    try {
      const hasPerm = permission?.granted || (await checkPermission());
      if (!hasPerm) {
        const granted = await requestPermission();
        if (!granted) return null;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = pos.coords;

      let address = '';
      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode && geocode[0]) {
          const g = geocode[0];
          const parts = [g.name, g.street, g.city, g.region, g.postalCode].filter(Boolean);
          address = parts.join(', ');
        }
      } catch {
        // Reverse geocode optional — keep coords even if it fails
        address = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      }

      const locData = { latitude, longitude, address };
      setLocation(locData);
      return locData;
    } catch (e) {
      const msg = e.message || 'Could not get current location.';
      setError(msg);
      return null;
    } finally {
      setIsFetching(false);
    }
  }, [permission, checkPermission, requestPermission]);

  // Get last known position (fast, may be stale)
  const getLastKnownLocation = useCallback(async () => {
    try {
      const last = await Location.getLastKnownPositionAsync();
      if (last) {
        const { latitude, longitude } = last.coords;
        return { latitude, longitude };
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Watch position (optional) — demonstrates watchPositionAsync + cleanup
  const startWatching = useCallback(async (onUpdate) => {
    const hasPerm = permission?.granted || (await checkPermission());
    if (!hasPerm) {
      const granted = await requestPermission();
      if (!granted) return false;
    }
    try {
      watcherRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 10 },
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const loc = { latitude, longitude };
          setLocation((prev) => ({ ...prev, ...loc }));
          if (onUpdate) onUpdate(loc);
        }
      );
      return true;
    } catch (e) {
      setError(e.message || 'Failed to start location watcher.');
      return false;
    }
  }, [permission, checkPermission, requestPermission]);

  const stopWatching = useCallback(() => {
    if (watcherRef.current) {
      watcherRef.current.remove();
      watcherRef.current = null;
    }
  }, []);

  // Auto cleanup on unmount — critical to not leave watchers running
  useEffect(() => {
    return () => {
      if (watcherRef.current) {
        watcherRef.current.remove();
        watcherRef.current = null;
      }
    };
  }, []);

  return {
    permission,
    isGranted: permission?.granted === true,
    location,
    isFetching,
    error,
    setError,
    requestPermission,
    checkPermission,
    getCurrentLocation,
    getLastKnownLocation,
    startWatching,
    stopWatching,
    setLocation,
  };
};

export default useLocation;
