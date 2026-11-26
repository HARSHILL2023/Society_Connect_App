import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

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

  const steps = [
    { title: 'Ticket Created', date: ticket.createdAt, color: COLORS.pending },
  ];

  if (ticket.status === 'In Progress' || ticket.status === 'Resolved') {
    steps.push({ title: 'Assigned / In Progress', date: ticket.updatedAt, color: COLORS.inProgress });
  }

  if (ticket.status === 'Resolved') {
    steps.push({
      title: 'Resolved & Closed',
      date: ticket.resolvedAt || ticket.updatedAt,
      color: COLORS.resolved,
    });
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionHeader}>Timeline</Text>

      {steps.map((step, index) => (
        <View key={step.title} style={styles.timelineItem}>
          <View style={styles.dotColumn}>
            <View style={[styles.timelineDot, { backgroundColor: step.color }]} />
            {index < steps.length - 1 && <View style={styles.timelineLine} />}
          </View>
          <View style={styles.timelineTextContainer}>
            <Text style={styles.timelineTitle}>{step.title}</Text>
            <Text style={styles.timelineDate}>{formatDate(step.date)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  cardSectionHeader: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dotColumn: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 26,
    backgroundColor: COLORS.surfaceMuted,
    marginVertical: 4,
  },
  timelineTextContainer: {
    flex: 1,
    paddingBottom: SPACING.lg,
  },
  timelineTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
    fontSize: 14.5,
  },
  timelineDate: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
    marginTop: 3,
  },
});

export default TicketTimeline;
