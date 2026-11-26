import 'react-native-gesture-handler';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { COLORS } from '../src/constants/theme';

// Root layout - wraps app with providers and defines top-level routes
// Beginner: Stack = stack navigation. headerShown false = no default header
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={COLORS.background} />
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.background },
              animation: 'fade',
            }}
          >
            {/* index.jsx handles auth redirect */}
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            {/* Drawer group contains tabs + role routes */}
            <Stack.Screen name="(drawer)" />
            {/* Dynamic ticket detail */}
            <Stack.Screen
              name="ticket/[id]"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="camera/index"
              options={{ animation: 'slide_from_bottom' }}
            />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
