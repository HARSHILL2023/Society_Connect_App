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
        };
      case 'action':
        return {
          iconName: 'add-circle-outline',
          iconColor: COLORS.text,
          bgColor: COLORS.surface,
        };
      default:
        return {
          iconName: icon,
          iconColor: COLORS.textMuted,
          bgColor: COLORS.surfaceElevated,
        };
    }
  };

  const { iconName, iconColor, bgColor } = getIconConfig();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
        <Ionicons name={iconName} size={30} color={iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {actionTitle && onActionPress && (
        <Button
          title={actionTitle}
          onPress={onActionPress}
          size="md"
          variant={variant === 'action' ? 'primary' : 'secondary'}
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
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  description: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
    marginBottom: SPACING.xl,
  },
  button: {
    minWidth: 180,
  },
});

export default EmptyState;
