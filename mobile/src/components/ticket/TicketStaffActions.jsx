import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
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
        Update the current progress or complete the maintenance service
      </Text>

      <View style={styles.staffButtonsRow}>
        {ticket.status !== 'In Progress' && (
          <Button
            title="Mark In Progress"
            onPress={() => onOpenStatusModal('In Progress')}
            variant="secondary"
            icon="construct-outline"
            style={styles.staffButton}
          />
        )}

        {ticket.status !== 'Resolved' && (
          <Button
            title="Mark Resolved"
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
            variant="outline"
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
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardSectionHeader: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionPrompt: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
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