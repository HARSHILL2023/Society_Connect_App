import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

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
        return { bg: COLORS.pendingBg, text: COLORS.pending };
      case 'inProgress':
      case 'In Progress':
        return { bg: COLORS.inProgressBg, text: COLORS.inProgress };
      case 'resolved':
      case 'Resolved':
        return { bg: COLORS.resolvedBg, text: COLORS.resolved };
      case 'Admin':
        return { bg: COLORS.primary, text: COLORS.white };
      case 'Manager':
      case 'Member':
        return { bg: COLORS.surfaceElevated, text: COLORS.text };
      case 'danger':
      case 'Urgent':
      case 'High':
        return { bg: COLORS.dangerBg, text: COLORS.danger };
      case 'Medium':
        return { bg: COLORS.pendingBg, text: COLORS.pending };
      case 'Low':
        return { bg: COLORS.resolvedBg, text: COLORS.resolved };
      default:
        return { bg: COLORS.surfaceElevated, text: COLORS.textSecondary };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          paddingVertical: size === 'sm' ? 3 : 5,
          paddingHorizontal: size === 'sm' ? 9 : 11,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: size === 'sm' ? 10.5 : 12,
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
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

export default Badge;
