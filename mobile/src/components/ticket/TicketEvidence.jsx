import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

// Displays evidence image (if any)
export const TicketEvidence = ({ ticket }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const hasImage = ticket.evidenceImage && ticket.evidenceImage.length > 0;

  if (!hasImage) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionHeader}>Evidence</Text>

      <Pressable onPress={() => setModalVisible(true)} style={styles.imageWrapper}>
        <Image source={{ uri: ticket.evidenceImage }} style={styles.image} resizeMode="cover" />
        <View style={styles.zoomPill}>
          <Ionicons name="expand-outline" size={12} color={COLORS.text} />
          <Text style={styles.zoomText}>Tap to expand</Text>
        </View>
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Image source={{ uri: ticket.evidenceImage }} style={styles.modalImage} resizeMode="contain" />
          <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </Pressable>
      </Modal>
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
  cardSectionHeader: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: SPACING.md },
  imageWrapper: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  image: { width: '100%', height: 210, backgroundColor: COLORS.surfaceElevated },
  zoomPill: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  zoomText: { ...TYPOGRAPHY.small, color: COLORS.text, fontSize: 10.5, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 11, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalImage: { width: '100%', height: '80%' },
  closeBtn: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TicketEvidence;
