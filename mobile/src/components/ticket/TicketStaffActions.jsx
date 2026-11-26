import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import Button from '../common/Button';

export const TicketStaffActions = ({
  ticket,
  isStaff,
  onOpenStatusModal,
}) => {
  if (!isStaff) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionHeader}>Staff Action Desk</Text>
      <Text style={styles.actionPrompt}>
        Update progress or close the ticket once the work is complete.
      </Text>

      <View style={styles.staffButtonsRow}>
        {ticket.status !== 'In Progress' && (
          <Button
            title="In Progress"
            onPress={() => onOpenStatusModal('In Progress')}
            variant="secondary"
            icon="construct-outline"
            style={styles.staffButton}
          />
        )}

        {ticket.status !== 'Resolved' && (
          <Button
            title="Resolve"
            onPress={() => onOpenStatusModal('Resolved')}
            variant="primary"
            icon="checkmark-circle-outline"
            style={styles.staffButton}
          />
        )}

        {ticket.status === 'Resolved' && (
          <Button
            title="Reopen Ticket"
            onPress={() => onOpenStatusModal('Pending')}
            variant="secondary"
            icon="refresh-outline"
            style={styles.staffButton}
          />
        )}
      </View>
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
    marginBottom: SPACING.xs,
  },
  actionPrompt: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  staffButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  staffButton: {
    flex: 1,
  },
});

export default TicketStaffActions;
