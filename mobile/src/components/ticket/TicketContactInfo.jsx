import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

export const TicketContactInfo = ({ ticket }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionHeader}>Residence & Contact</Text>

      <View style={styles.infoRow}>
        <View style={styles.infoIconBox}>
          <Ionicons name="business-outline" size={17} color={COLORS.text} />
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoLabel}>Flat / Unit</Text>
          <Text style={styles.infoValue}>
            {ticket.flatNumber || ticket.raisedBy?.flatNumber || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoIconBox}>
          <Ionicons name="person-outline" size={17} color={COLORS.text} />
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoLabel}>Raised By</Text>
          <Text style={styles.infoValue}>
            {ticket.raisedBy?.name || 'Society Resident'}
          </Text>
        </View>
      </View>

      {ticket.raisedBy?.email && (
        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Ionicons name="mail-outline" size={17} color={COLORS.text} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{ticket.raisedBy.email}</Text>
          </View>
        </View>
      )}

      {ticket.raisedBy?.phone && (
        <View style={[styles.infoRow, styles.lastRow]}>
          <View style={styles.infoIconBox}>
            <Ionicons name="call-outline" size={17} color={COLORS.text} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{ticket.raisedBy.phone}</Text>
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
    ...SHADOWS.card,
  },
  cardSectionHeader: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  lastRow: {
    marginBottom: 0,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
  },
  infoValue: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
    marginTop: 1,
    fontSize: 14.5,
  },
});

export default TicketContactInfo;
