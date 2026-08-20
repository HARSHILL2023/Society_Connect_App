import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
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
      activeOpacity={0.75}
      style={[styles.card, style]}
    >
      {/* Top row: Category icon, Category name, and Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.categoryPill}>
          <Ionicons
            name={getCategoryIcon(ticket.category)}
            size={14}
            color={COLORS.primaryLight}
            style={styles.categoryIcon}
          />
          <Text style={styles.categoryText}>{ticket.category}</Text>
        </View>

        <Badge label={ticket.status} variant={ticket.status} size="sm" />
      </View>

      {/* Ticket Title */}
      <Text style={styles.title} numberOfLines={2}>
        {ticket.title}
      </Text>

      {/* Description Snippet */}
      <Text style={styles.description} numberOfLines={2}>
        {ticket.description}
      </Text>

      {/* Bottom Metadata row */}
      <View style={styles.footerRow}>
        {/* Flat info or Resident info */}
        <View style={styles.flatTag}>
          <Ionicons name="business-outline" size={13} color={COLORS.textSecondary} />
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
          <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
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
    padding: SPACING.md + 2,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: RADIUS.sm,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    ...TYPOGRAPHY.small,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  flatTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flatText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.text,
  },
  residentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 120,
  },
  residentText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },
  dateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  dateText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
  },
});

export default TicketCard;
