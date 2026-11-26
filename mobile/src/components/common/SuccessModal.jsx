import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

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
  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const player = useAudioPlayer(successSound);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 45, useNativeDriver: true }),
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
      scaleAnim.setValue(0.94);
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
            <Ionicons name="checkmark-circle" size={46} color={COLORS.resolved} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.primaryButton} onPress={onPrimary} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
            <Ionicons name="chevron-forward-outline" size={17} color={COLORS.white} />
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
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xxl,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.floating,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.resolvedBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.xs, textAlign: 'center' },
  message: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: SPACING.xl, textAlign: 'center', lineHeight: 20 },
  primaryButton: {
    width: '100%',
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  primaryButtonText: { ...TYPOGRAPHY.bodyBold, color: COLORS.white, fontSize: 15.5 },
  secondaryButton: { width: '100%', height: 44, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { ...TYPOGRAPHY.bodyBold, color: COLORS.textMuted, fontSize: 14.5 },
});

export default SuccessModal;
