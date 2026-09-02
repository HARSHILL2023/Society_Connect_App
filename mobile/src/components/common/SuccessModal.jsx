import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

const successSound = require('../../../assets/sounds/success.wav');

export const SuccessModal = ({
  visible,
  onClose,
  title = 'Complaint Raised Successfully!',
  message = 'Your complaint has been submitted successfully.',
  onViewTickets,
  onDone,
  onPrimaryPress,
  onSecondaryPress,
  primaryButtonText = 'View My Tickets',
  secondaryButtonText = 'Done',
}) => {
  const handlePrimary = onViewTickets || onPrimaryPress;
  const handleSecondary = onDone || onSecondaryPress;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const player = useAudioPlayer(successSound);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        try {
          player.seekTo(0);
          player.volume = 0.6;
          player.play();
        } catch {}
      }, 300);

      return () => clearTimeout(timer);
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  if (!visible) return null;

  const onPrimary = () => {
    handlePrimary?.();
    onClose();
  };

  const onSecondary = () => {
    handleSecondary?.();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.dialog, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={56} color={COLORS.resolved} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.primaryButton} onPress={onPrimary} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
            <Ionicons name="chevron-forward-outline" size={18} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onSecondary} activeOpacity={0.7}>
            <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.resolvedBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.xs, textAlign: 'center' },
  message: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.lg, textAlign: 'center', lineHeight: 22 },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: COLORS.resolved,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  primaryButtonText: { ...TYPOGRAPHY.bodyBold, color: COLORS.white, fontSize: 16 },
  secondaryButton: { width: '100%', height: 44, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { ...TYPOGRAPHY.bodyBold, color: COLORS.textSecondary, fontSize: 15 },
});

export default SuccessModal;
