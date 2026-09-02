import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

// Displays evidence image (if any)
export const TicketEvidence = ({ ticket }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const hasImage = ticket.evidenceImage && ticket.evidenceImage.length > 0;

  if (!hasImage) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionHeader}>Evidence</Text>

      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Ionicons name="image-outline" size={16} color={COLORS.primaryLight} />
          <Text style={styles.label}>Evidence Photo</Text>
        </View>
        <Pressable onPress={() => setModalVisible(true)} style={styles.imageWrapper}>
          <Image source={{ uri: ticket.evidenceImage }} style={styles.image} resizeMode="cover" />
          <View style={styles.zoomPill}>
            <Ionicons name="expand-outline" size={14} color={COLORS.white} />
            <Text style={styles.zoomText}>Tap to expand</Text>
          </View>
        </Pressable>

        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <Image source={{ uri: ticket.evidenceImage }} style={styles.modalImage} resizeMode="contain" />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </Pressable>
        </Modal>
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
  cardSectionHeader: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: SPACING.md },
  section: { marginBottom: SPACING.md },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.xs },
  label: { ...TYPOGRAPHY.captionBold, color: COLORS.primaryLight, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11 },
  imageWrapper: { borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  image: { width: '100%', height: 200, backgroundColor: COLORS.surfaceElevated },
  zoomPill: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  zoomText: { ...TYPOGRAPHY.small, color: COLORS.white, fontSize: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  modalImage: { width: '100%', height: '80%' },
  closeBtn: { position: 'absolute', top: 40, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
});

export default TicketEvidence;
