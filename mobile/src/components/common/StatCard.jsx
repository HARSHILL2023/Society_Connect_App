import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

export const StatCard = ({
  title,
  value,
  icon,
  iconColor = COLORS.text,
  bgColor = COLORS.surface,
  subtitle,
  onPress,
  style,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        { backgroundColor: bgColor },
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={styles.value}>
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
    flex: 1,
    minWidth: '45%',
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.8,
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
