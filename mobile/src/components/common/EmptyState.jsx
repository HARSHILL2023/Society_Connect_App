import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';
import Button from './Button';

export const EmptyState = ({
  icon = 'file-tray-outline',
  title = 'No items found',
  description = 'There are no records to display at the moment.',
  actionTitle,
  onActionPress,
  style,
  variant = 'default', // 'default' | 'success' | 'action'
}) => {
  const getIconConfig = () => {
    switch (variant) {
      case 'success':
        return {
          iconName: 'checkmark-circle-outline',
          iconColor: COLORS.resolved,
          bgColor: COLORS.resolvedBg,
          borderColor: 'rgba(16, 185, 129, 0.3)',
        };
      case 'action':
        return {
          iconName: 'add-circle-outline',
          iconColor: COLORS.primary,
          bgColor: COLORS.primaryGlow,
          borderColor: 'rgba(16, 185, 129, 0.3)',
        };
      default:
        return {
          iconName: icon,
          iconColor: COLORS.textMuted,
          bgColor: COLORS.surface,
          borderColor: COLORS.border,
        };
    }
  };

  const { iconName, iconColor, bgColor, borderColor } = getIconConfig();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconCircle, { backgroundColor: bgColor, borderColor }]}>
        <Ionicons name={iconName} size={36} color={iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {actionTitle && onActionPress && (
        <Button
          title={actionTitle}
          onPress={onActionPress}
          size="md"
          variant={variant === 'action' ? 'primary' : 'outline'}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxxl,
    marginVertical: SPACING.lg,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: SPACING.lg,
  },
  button: {
    minWidth: 180,
  },
});

export default EmptyState;