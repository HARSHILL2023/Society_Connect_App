import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

import AuthNavigator from './AuthNavigator';
import MemberNavigator from './MemberNavigator';
import ManagerNavigator from './ManagerNavigator';
import AdminNavigator from './AdminNavigator';
import LoadingScreen from '../components/common/LoadingScreen';

const SocietyTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primaryLight,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
    notification: COLORS.primary,
  },
};

export const AppNavigator = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Connecting to Society Connect..." />;
  }

  const renderRoleNavigator = () => {
    if (!isAuthenticated) {
      return <AuthNavigator />;
    }

    switch (role) {
      case 'Admin':
        return <AdminNavigator />;
      case 'Manager':
        return <ManagerNavigator />;
      case 'Member':
      default:
        return <MemberNavigator />;
    }
  };

  return (
    <NavigationContainer theme={SocietyTheme}>
      {renderRoleNavigator()}
    </NavigationContainer>
  );
};

export default AppNavigator;
