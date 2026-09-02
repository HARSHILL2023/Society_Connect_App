import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export const LocationSection = ({ location, onPick, onClear }) => {
  const hasLocation = location && location.latitude && location.longitude;

  if (hasLocation) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Complaint Location</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="location" size={18} color={COLORS.primaryLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.address} numberOfLines={2}>{location.address || `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`}</Text>
              <Text style={styles.coords}>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.editBtn} onPress={onPick}>
              <Ionicons name="pencil-outline" size={16} color={COLORS.text} />
              <Text style={styles.editText}>Change</Text>
            </Pressable>
            <Pressable style={styles.clearBtn} onPress={onClear}>
              <Ionicons name="close-outline" size={16} color={COLORS.danger} />
              <Text style={styles.clearText}>Remove</Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.hint}>Attached — helps technician find exact spot</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Location (Optional)</Text>
      <TouchableOpacity style={styles.pickCard} onPress={onPick} activeOpacity={0.85}>
        <View style={styles.pickIcon}>
          <Ionicons name="map-outline" size={22} color={COLORS.primaryLight} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.pickTitle}>Attach Complaint Location</Text>
          <Text style={styles.pickSubtitle}>Current location • Pick on map • Address auto-filled</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
      <Text style={styles.hint}>Optional — adds map + address to your complaint</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md + 2 },
  label: { ...TYPOGRAPHY.captionBold, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11, marginBottom: SPACING.xs + 2 },
  pickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  pickIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(52,211,153,0.15)', alignItems: 'center', justifyContent: 'center' },
  pickTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, fontSize: 14 },
  pickSubtitle: { ...TYPOGRAPHY.small, color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  card: { backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: 'row', gap: SPACING.md },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(52,211,153,0.15)', alignItems: 'center', justifyContent: 'center' },
  address: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, fontSize: 13 },
  coords: { ...TYPOGRAPHY.small, color: COLORS.textMuted, marginTop: 2, fontSize: 11 },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.surface, paddingVertical: 10, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  editText: { ...TYPOGRAPHY.captionBold, color: COLORS.text },
  clearBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.12)', paddingVertical: 10, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  clearText: { ...TYPOGRAPHY.captionBold, color: COLORS.danger },
  hint: { ...TYPOGRAPHY.small, color: COLORS.textMuted, marginTop: 6, fontSize: 11 },
});

export default LocationSection;
