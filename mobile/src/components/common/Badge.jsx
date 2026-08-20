import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export const Badge = ({
  label,
  variant = 'default', // pending | inProgress | resolved | primary | danger | default
  size = 'md', // sm | md
  style,
  textStyle,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'pending':
      case 'Pending':
        return {
          bg: COLORS.pendingBg,
          text: COLORS.pending,
          border: 'rgba(245, 158, 11, 0.3)',
        };
      case 'inProgress':
      case 'In Progress':
        return {
          bg: COLORS.inProgressBg,
          text: COLORS.inProgress,
          border: 'rgba(59, 130, 246, 0.3)',
        };
      case 'resolved':
      case 'Resolved':
        return {
          bg: COLORS.resolvedBg,
          text: COLORS.resolved,
          border: 'rgba(16, 185, 129, 0.3)',
        };
      case 'Admin':
        return {
          bg: 'rgba(239, 68, 68, 0.12)',
          text: '#F87171',
          border: 'rgba(239, 68, 68, 0.3)',
        };
      case 'Manager':
        return {
          bg: 'rgba(6, 182, 212, 0.12)',
          text: '#22D3EE',
          border: 'rgba(6, 182, 212, 0.3)',
        };
      case 'Member':
        return {
          bg: 'rgba(99, 102, 241, 0.12)',
          text: '#818CF8',
          border: 'rgba(99, 102, 241, 0.3)',
        };
      case 'danger':
      case 'Urgent':
      case 'High':
        return {
          bg: COLORS.dangerBg,
          text: COLORS.danger,
          border: 'rgba(239, 68, 68, 0.3)',
        };
      case 'Medium':
        return {
          bg: COLORS.pendingBg,
          text: COLORS.pending,
          border: 'rgba(245, 158, 11, 0.3)',
        };
      case 'Low':
        return {
          bg: COLORS.resolvedBg,
          text: COLORS.resolved,
          border: 'rgba(16, 185, 129, 0.3)',
        };
      default:
        return {
          bg: COLORS.surfaceElevated,
          text: COLORS.textSecondary,
          border: COLORS.border,
        };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: size === 'sm' ? 2 : 4,
          paddingHorizontal: size === 'sm' ? 8 : 12,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: size === 'sm' ? 11 : 12,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default Badge;
