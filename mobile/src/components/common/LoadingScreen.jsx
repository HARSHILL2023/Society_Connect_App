import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';

export const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.spinnerWrapper}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  spinnerWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  message: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', maxWidth: 280 },
});

export default LoadingScreen;
