import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Easing,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

const successSound = require('../../assets/sounds/success.wav');

export const SuccessModal = ({
  visible,
  onClose,
  title = 'Complaint Raised Successfully!',
  message = 'Your complaint has been submitted successfully.',
  onViewTickets,
  onDone,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const checkmarkScaleAnim = React.useRef(new Animated.Value(0)).current;
  const checkmarkDrawAnim = React.useRef(new Animated.Value(0)).current;
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  const soundRef = React.useRef(null);
  const animationStarted = React.useRef(false);

  React.useEffect(() => {
    if (visible) {
      if (!animationStarted.current) {
        animationStarted.current = true;
        runEntranceAnimation();
      }
    } else {
      animationStarted.current = false;
      resetAnimations();
    }
  }, [visible]);

  const resetAnimations = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0);
    checkmarkScaleAnim.setValue(0);
    checkmarkDrawAnim.setValue(0);
    glowAnim.setValue(0);
  };

  const runEntranceAnimation = async () => {
    // 0ms: Overlay fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();

    // 100ms: Icon container scale
    setTimeout(() => {
      Animated.spring(checkmarkScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, 100);

    // 200ms: Checkmark draw animation
    setTimeout(() => {
      Animated.timing(checkmarkDrawAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    }, 200);

    // 250ms: Play success sound
    setTimeout(() => {
      playSuccessSound();
    }, 250);

    // 300ms: Glow pulse
    setTimeout(() => {
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    }, 300);

    // Scale the dialog container
    setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 35,
        useNativeDriver: true,
      }).start();
    }, 50);
  };

  const playSuccessSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(successSound, {
        shouldPlay: false,
        volume: 0.6,
      });
      soundRef.current = sound;
      await sound.playAsync();
      
      // Unload after playback to free resources
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish && !status.isPlaying) {
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch (error) {
      console.warn('Failed to play success sound:', error);
    }
  };

  // Cleanup sound on unmount
  React.useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  if (!visible) return null;

  const handleDonePress = () => {
    onDone?.();
    onClose();
  };

  const handleViewTicketsPress = () => {
    onViewTickets?.();
    onClose();
  };

  // Animated checkmark path - draws from 0 to 1
  const checkmarkPath = `
    M 18 42 
    L 36 60 
    L 66 24
  `;
  const pathLength = 72; // approximate total path length

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose} accessible={false}>
        <Animated.View
          style={[
            styles.overlay,
            { opacity: fadeAnim },
          ]}
        >
          <TouchableWithoutFeedback accessible={false}>
            <Animated.View
              style={[
                styles.dialog,
                {
                  opacity: scaleAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {/* Animated Success Icon */}
              <Animated.View style={styles.iconWrapper}>
                {/* Glow ring */}
                <Animated.View
                  style={[
                    styles.glowRing,
                    {
                      opacity: glowAnim,
                      transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.3] }) }],
                    },
                  ]}
                />
                
                {/* Checkmark circle background */}
                <Animated.View style={styles.iconContainer}>
                  {/* Checkmark SVG with stroke-dashoffset animation */}
                  <Animated.View style={styles.checkmarkWrapper}>
                    <Animated.View
                      style={[
                        styles.checkmarkStroke,
                        {
                          transform: [
                            { rotate: '-45deg' },
                            { scaleX: checkmarkDrawAnim },
                          ],
                          transformOrigin: '0 0',
                        },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.checkmarkStroke,
                        {
                          transform: [
                            { rotate: '45deg' },
                            { scaleX: checkmarkDrawAnim },
                          ],
                          transformOrigin: '100% 0',
                        },
                      ]}
                    />
                  </Animated.View>
                </Animated.View>
              </Animated.View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              {/* Primary CTA - Full Width */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleViewTicketsPress}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={title}
              >
                <Text style={styles.primaryButtonText}>
                  View My Tickets
                </Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={COLORS.white}
                  style={styles.arrowIcon}
                />
              </TouchableOpacity>

              {/* Secondary - Ghost button */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleDonePress}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Done"
              >
                <Text style={styles.secondaryButtonText}>Done</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xxxl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 15,
  },
  iconWrapper: {
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.resolvedBg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.resolved,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  glowRing: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: COLORS.resolved,
    opacity: 0,
  },
  checkmarkWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkStroke: {
    width: 28,
    height: 3,
    backgroundColor: COLORS.resolved,
    borderRadius: 2,
    shadowColor: COLORS.resolved,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
    lineHeight: 28,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxxl,
    textAlign: 'center',
    lineHeight: 22,
  },
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
    shadowColor: COLORS.resolved,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.white,
    fontSize: 16,
  },
  arrowIcon: {
    marginLeft: SPACING.xs,
  },
  secondaryButton: {
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textSecondary,
    fontSize: 15,
  },
});

export default SuccessModal;