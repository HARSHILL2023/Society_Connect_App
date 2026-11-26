import { useNavigation } from 'expo-router';

/**
 * Opens the parent drawer from any screen.
 *
 * Expo SDK 58 bundles its own navigation core inside expo-router, so hooks from
 * `@react-navigation/native` have no NavigationContext to read and throw
 * "Couldn't find a navigation object". Use expo-router's hook and walk up to the
 * navigator that actually owns the drawer.
 */
export function useOpenDrawer() {
  const navigation = useNavigation();

  return () => {
    let current = navigation;
    while (current) {
      if (typeof current.openDrawer === 'function') {
        current.openDrawer();
        return;
      }
      current = typeof current.getParent === 'function' ? current.getParent() : undefined;
    }
    // Fallback: dispatch bubbles up to the drawer navigator
    navigation.dispatch({ type: 'OPEN_DRAWER' });
  };
}
