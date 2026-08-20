import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export const Card = ({
  children,
  onPress,
  style,
  elevated = false,
  bordered = true,
  activeOpacity = 0.75,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={activeOpacity}
      style={[
        styles.card,
        elevated && styles.elevated,
        bordered && styles.bordered,
        style,
      ]}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  elevated: {
    backgroundColor: COLORS.surfaceElevated,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bordered: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

export default Card;
