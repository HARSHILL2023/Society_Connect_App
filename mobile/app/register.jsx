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

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!name.trim()) { setErrorMessage('Full name is required.'); return; }
    if (!email.trim()) { setErrorMessage('Email address is required.'); return; }
    if (!flatNumber.trim()) { setErrorMessage('Flat / Unit number is required for society members.'); return; }
    if (!password) { setErrorMessage('Password is required.'); return; }
    if (password.length < 6) { setErrorMessage('Password must be at least 6 characters long.'); return; }
    if (password !== confirmPassword) { setErrorMessage('Passwords do not match.'); return; }

    setErrorMessage('');
    setLoading(true);

    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        flatNumber: flatNumber.trim(),
        phone: phone.trim(),
        password,
      });
      // After register, go to home
      router.replace('/(drawer)/(tabs)/home');
    } catch (error) {
      const msg = getErrorMessage(error);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Join Your Society</Text>
            <Text style={styles.subtitle}>
              Register as a verified flat member to raise complaints and stay connected
            </Text>
          </View>

          <View style={styles.card}>
            {errorMessage ? (
              <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage('')} />
            ) : null}

            <Input label="Full Name" placeholder="e.g. Alex Johnson" value={name} onChangeText={(text) => { setName(text); if (errorMessage) setErrorMessage(''); }} icon="person-outline" required />
            <Input label="Email Address" placeholder="alex@societyconnect.com" value={email} onChangeText={(text) => { setEmail(text); if (errorMessage) setErrorMessage(''); }} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" required />
            <Input label="Flat / Unit Number" placeholder="e.g. Tower B - 504" value={flatNumber} onChangeText={(text) => { setFlatNumber(text); if (errorMessage) setErrorMessage(''); }} icon="business-outline" required />
            <Input label="Phone Number (Optional)" placeholder="+1 555-0199" value={phone} onChangeText={setPhone} icon="call-outline" keyboardType="phone-pad" />
            <Input label="Password" placeholder="Min. 6 characters" value={password} onChangeText={(text) => { setPassword(text); if (errorMessage) setErrorMessage(''); }} icon="lock-closed-outline" secureTextEntry required />
            <Input label="Confirm Password" placeholder="Re-enter password" value={confirmPassword} onChangeText={(text) => { setConfirmPassword(text); if (errorMessage) setErrorMessage(''); }} icon="lock-closed-outline" secureTextEntry required />

            <Button title="Create Member Account" onPress={handleRegister} loading={loading} size="lg" style={styles.registerButton} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, paddingVertical: SPACING.xs },
  backText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginLeft: 4 },
  header: { marginBottom: SPACING.lg },
  title: { ...TYPOGRAPHY.h1, color: COLORS.text },
  subtitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 4, lineHeight: 18 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.border },
  registerButton: { marginTop: SPACING.sm },
});
