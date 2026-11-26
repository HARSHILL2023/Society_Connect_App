import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import Badge from '../common/Badge';

export const TicketCard = ({
  ticket,
  onPress,
  showResident = true,
  style,
}) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Plumbing':
        return 'water-outline';
      case 'Electrical':
        return 'flash-outline';
      case 'Security':
        return 'shield-checkmark-outline';
      case 'Cleaning':
        return 'sparkles-outline';
      case 'Carpentry':
        return 'hammer-outline';
      case 'Elevator':
        return 'swap-vertical-outline';
      case 'Gardening':
        return 'leaf-outline';
      default:
        return 'construct-outline';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, style]}
    >
      <View style={styles.topRow}>
        <View style={styles.categoryPill}>
          <Ionicons
            name={getCategoryIcon(ticket.category)}
            size={13}
            color={COLORS.text}
            style={styles.categoryIcon}
          />
          <Text style={styles.categoryText}>{ticket.category}</Text>
        </View>

        <Badge label={ticket.status} variant={ticket.status} size="sm" />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {ticket.title}
      </Text>

      <Text style={styles.description} numberOfLines={2}>
        {ticket.description}
      </Text>

      {ticket.evidenceImage ? (
        <View style={styles.evidencePill}>
          <Ionicons name="image-outline" size={12} color={COLORS.textSecondary} />
          <Text style={styles.evidencePillText}>Photo attached</Text>
        </View>
      ) : null}

      <View style={styles.footerRow}>
        <View style={styles.flatTag}>
          <Ionicons name="business-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.flatText}>
            {ticket.flatNumber || ticket.raisedBy?.flatNumber || 'Flat N/A'}
          </Text>
        </View>

        {showResident && ticket.raisedBy?.name && (
          <View style={styles.residentTag}>
            <Ionicons name="person-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.residentText} numberOfLines={1}>
              {ticket.raisedBy.name}
            </Text>
          </View>
        )}

        <View style={styles.dateTag}>
          <Text style={styles.dateText}>{formatDate(ticket.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  categoryIcon: {
    marginRight: 5,
  },
  categoryText: {
    ...TYPOGRAPHY.small,
    color: COLORS.text,
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: 5,
  },
  description: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 19,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  flatTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  flatText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  residentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: 110,
  },
  residentText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
  },
  dateTag: {
    marginLeft: 'auto',
  },
  dateText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
  },
  evidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  evidencePillText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontSize: 10.5,
  },
});

export default TicketCard;
