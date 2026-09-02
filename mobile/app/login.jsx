import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../src/constants/theme';
import Input from '../src/components/common/Input';
import Button from '../src/components/common/Button';
import { getErrorMessage } from '../src/services/api';
import ErrorBanner from '../src/components/common/ErrorBanner';

export default function Login() {
  const { login, isAuthenticated, role } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const user = await login(email.trim(), password);
      // Navigate based on role
      if (user.role === 'Admin') {
        router.replace('/(drawer)/admin/dashboard');
      } else if (user.role === 'Manager') {
        router.replace('/(drawer)/manager/dashboard');
      } else {
        router.replace('/(drawer)/(tabs)/home');
      }
    } catch (error) {
      const msg = getErrorMessage(error);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="business" size={38} color={COLORS.primaryLight} />
            </View>
            <Text style={styles.appTitle}>Society Connect</Text>
            <Text style={styles.appSubtitle}>
              Smart Community Management & Ticket Resolution
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>
              Enter your credentials to access your society dashboard
            </Text>

            {errorMessage ? (
              <ErrorBanner
                message={errorMessage}
                onDismiss={() => setErrorMessage('')}
              />
            ) : null}

            <Input
              label="Email Address"
              placeholder="resident@societyconnect.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage('');
              }}
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
              icon="lock-closed-outline"
              secureTextEntry
            />

            <Button
              title="Sign In to Account"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={styles.loginButton}
            />

            <View style={styles.quickAccessSection}>
              <Text style={styles.quickAccessTitle}>Quick Demo Switcher</Text>
              <View style={styles.demoButtonsRow}>
                <TouchableOpacity
                  style={styles.demoPill}
                  onPress={() => handleQuickLogin('admin@societyconnect.com')}
                >
                  <Text style={[styles.demoPillText, { color: '#F87171' }]}>Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.demoPill}
                  onPress={() => handleQuickLogin('manager@societyconnect.com')}
                >
                  <Text style={[styles.demoPillText, { color: '#22D3EE' }]}>Manager</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.demoPill}
                  onPress={() => handleQuickLogin('john@societyconnect.com')}
                >
                  <Text style={[styles.demoPillText, { color: '#818CF8' }]}>Member</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New resident in society? </Text>
            <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.7}>
              <Text style={styles.registerLink}>Register Flat</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: SPACING.lg, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  logoContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  appTitle: { ...TYPOGRAPHY.h1, color: COLORS.text, textAlign: 'center' },
  appSubtitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4, maxWidth: 280 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: 4 },
  cardSubtitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  loginButton: { marginTop: SPACING.sm },
  quickAccessSection: { marginTop: SPACING.lg, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'center' },
  quickAccessTitle: { ...TYPOGRAPHY.small, color: COLORS.textMuted, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  demoButtonsRow: { flexDirection: 'row', gap: SPACING.sm },
  demoPill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border },
  demoPillText: { ...TYPOGRAPHY.small, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: SPACING.xl },
  footerText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  registerLink: { ...TYPOGRAPHY.bodyBold, color: COLORS.primaryLight },
});
