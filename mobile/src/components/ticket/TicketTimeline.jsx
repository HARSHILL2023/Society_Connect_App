import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export const TicketTimeline = ({ ticket }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionHeader}>Timeline</Text>

      <View style={styles.timelineItem}>
        <View style={[styles.timelineDot, { backgroundColor: COLORS.pending }]} />
        <View style={styles.timelineTextContainer}>
          <Text style={styles.timelineTitle}>Ticket Created</Text>
          <Text style={styles.timelineDate}>{formatDate(ticket.createdAt)}</Text>
        </View>
      </View>

      {(ticket.status === 'In Progress' || ticket.status === 'Resolved') && (
        <View style={styles.timelineItem}>
          <View style={[styles.timelineDot, { backgroundColor: COLORS.inProgress }]} />
          <View style={styles.timelineTextContainer}>
            <Text style={styles.timelineTitle}>Assigned / In Progress</Text>
            <Text style={styles.timelineDate}>
              {formatDate(ticket.updatedAt)}
            </Text>
          </View>
        </View>
      )}

      {ticket.status === 'Resolved' && (
        <View style={styles.timelineItem}>
          <View style={[styles.timelineDot, { backgroundColor: COLORS.resolved }]} />
          <View style={styles.timelineTextContainer}>
            <Text style={styles.timelineTitle}>Resolved & Closed</Text>
            <Text style={styles.timelineDate}>
              {formatDate(ticket.resolvedAt || ticket.updatedAt)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardSectionHeader: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: SPACING.md,
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
  },
  timelineDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

export default TicketTimeline;