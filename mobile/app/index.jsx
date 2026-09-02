import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import LoadingScreen from '../src/components/common/LoadingScreen';

// Entry route - redirects based on auth state and role
// This replaces AppNavigator's role logic
export default function Index() {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Connecting to Society Connect..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // Role-aware redirect
  if (role === 'Admin') return <Redirect href="/(drawer)/admin/dashboard" />;
  if (role === 'Manager') return <Redirect href="/(drawer)/manager/dashboard" />;
  return <Redirect href="/(drawer)/(tabs)/home" />;
}
