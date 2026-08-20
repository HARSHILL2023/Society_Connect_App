import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export const StatCard = ({
  title,
  value,
  icon,
  iconColor = COLORS.primaryLight,
  bgColor = COLORS.surface,
  subtitle,
  onPress,
  style,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.card,
        { backgroundColor: bgColor },
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
          ]}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <Text style={[styles.value, { color: iconColor }]}>
          {value !== undefined ? value : 0}
        </Text>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
    minWidth: '45%',
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  title: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
  },
  subtitle: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

export default StatCard;
