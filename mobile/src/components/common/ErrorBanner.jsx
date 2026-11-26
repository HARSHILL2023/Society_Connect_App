import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';

export const ErrorBanner = ({ message, onDismiss, variant = 'error' }) => {
  const getColors = () => {
    if (variant === 'warning') {
      return { bg: COLORS.pendingBg, icon: COLORS.pending };
    }
    if (variant === 'info') {
      return { bg: COLORS.surfaceElevated, icon: COLORS.text };
    }
    return { bg: COLORS.dangerBg, icon: COLORS.danger };
  };

  const { bg, icon } = getColors();

  if (!message) return null;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Ionicons name="alert-circle-outline" size={18} color={icon} />
      <Text style={[styles.text, { color: icon }]}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
          <Ionicons name="close" size={16} color={icon} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  text: {
    ...TYPOGRAPHY.caption,
    flex: 1,
    fontWeight: '500',
    lineHeight: 18,
  },
  closeButton: {
    padding: 2,
    marginLeft: SPACING.xs,
  },
});

export default ErrorBanner;
