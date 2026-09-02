import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';

export const LoadingScreen = ({ message = 'Loading...', size = 'large' }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: (t) => t,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
          easing: (t) => t,
        }),
      ])
    ).start();
  }, []);

  const spinnerSize = size === 'small' ? 24 : size === 'large' ? 48 : 36;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinnerWrapper,
          {
            opacity: pulseAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.5, 1, 0.5],
            }),
            transform: [
              {
                scale: pulseAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.9, 1.05, 0.9],
                }),
              },
            ],
          },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </Animated.View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  spinnerWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.2,
    maxWidth: 280,
  },
});

export default LoadingScreen;