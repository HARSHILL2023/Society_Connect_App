import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import Badge from '../common/Badge';

export const TicketHeader = ({ ticket }) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Badge label={ticket.category} size="md" />
        <Badge label={ticket.status} variant={ticket.status} size="md" />
      </View>

      <Text style={styles.title}>{ticket.title}</Text>

      <Text style={styles.sectionLabel}>Complaint Description</Text>
      <Text style={styles.description}>{ticket.description}</Text>

      {ticket.statusNote ? (
        <View style={styles.noteBox}>
          <View style={styles.noteHeader}>
            <Ionicons name="clipboard-outline" size={15} color={COLORS.textSecondary} />
            <Text style={styles.noteTitle}>Staff Maintenance Note</Text>
          </View>
          <Text style={styles.noteText}>{ticket.statusNote}</Text>
        </View>
      ) : null}
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    fontSize: 22,
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  noteBox: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  noteTitle: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  noteText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    lineHeight: 19,
  },
});

export default TicketHeader;
