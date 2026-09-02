import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

export const ScreenWrapper = ({
  children,
  header,
  showHeader = true,
  style,
  contentContainerStyle,
  scrollEnabled = true,
  keyboardShouldPersistTaps = 'handled',
  avoidKeyboard = true,
  edges = ['top', 'left', 'right'],
}) => {
  const content = (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      scrollEnabled={scrollEnabled}
    >
      {children}
    </ScrollView>
  );

  const withKeyboardAvoiding = avoidKeyboard ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
      keyboardVerticalOffset={0}
    >
      {content}
    </KeyboardAvoidingView>
  ) : content;

  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
      {showHeader && header}
      {withKeyboardAvoiding}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
});

export default ScreenWrapper;