import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { userAPI, getErrorMessage } from '../../../src/services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../src/constants/theme';
import Header from '../../../src/components/common/Header';
import Input from '../../../src/components/common/Input';
import Button from '../../../src/components/common/Button';

export default function CreateUser() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const [flatNumber, setFlatNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setErrorMessage('Full name is required.'); return; }
    if (!email.trim()) { setErrorMessage('Email address is required.'); return; }
    if (!password) { setErrorMessage('Password is required for new accounts.'); return; }
    if (role === 'Member' && !flatNumber.trim()) { setErrorMessage('Flat number is required for Member accounts.'); return; }

    setErrorMessage('');
    setLoading(true);

    try {
      await userAPI.createUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        flatNumber: role === 'Member' ? flatNumber.trim() : '',
        phone: phone.trim(),
      });
      Alert.alert('Success', `New ${role} account registered.`, [{ text: 'Done', onPress: () => router.back() }]);
    } catch (error) {
      const msg = getErrorMessage(error);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header title="Register New Account" subtitle="Create society member or staff" showDrawer onDrawerPress={openDrawer} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.roleGroup}>
              <Text style={styles.roleLabel}>System Role *</Text>
              <View style={styles.roleRow}>
                {['Member', 'Manager', 'Admin'].map((r) => {
                  const isSelected = role === r;
                  return (
                    <TouchableOpacity key={r} onPress={() => setRole(r)} style={[styles.rolePill, isSelected && styles.selectedRolePill]} activeOpacity={0.75}>
                      <Text style={[styles.rolePillText, isSelected && styles.selectedRolePillText]}>{r}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Input label="Full Name" placeholder="e.g. Robert Miles" value={name} onChangeText={(text) => { setName(text); if (errorMessage) setErrorMessage(''); }} icon="person-outline" required />
            <Input label="Email Address" placeholder="robert@societyconnect.com" value={email} onChangeText={(text) => { setEmail(text); if (errorMessage) setErrorMessage(''); }} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" required />
            {role === 'Member' && (
              <Input label="Flat / Unit Number" placeholder="e.g. Tower A - 204" value={flatNumber} onChangeText={(text) => { setFlatNumber(text); if (errorMessage) setErrorMessage(''); }} icon="business-outline" required />
            )}
            <Input label="Phone Number" placeholder="+1 555-0155" value={phone} onChangeText={setPhone} icon="call-outline" keyboardType="phone-pad" />
            <Input label="Password *" placeholder="Min. 6 characters" value={password} onChangeText={(text) => { setPassword(text); if (errorMessage) setErrorMessage(''); }} icon="lock-closed-outline" secureTextEntry required />

            <Button title="Register Account" onPress={handleSubmit} loading={loading} size="lg" style={styles.submitButton} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.border },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.dangerBg, borderColor: 'rgba(239,68,68,0.3)', borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, gap: SPACING.sm },
  errorBannerText: { ...TYPOGRAPHY.caption, color: COLORS.danger, flex: 1, fontWeight: '500' },
  roleGroup: { marginBottom: SPACING.md + 2 },
  roleLabel: { ...TYPOGRAPHY.captionBold, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11, marginBottom: SPACING.xs + 2 },
  roleRow: { flexDirection: 'row', gap: SPACING.sm },
  rolePill: { flex: 1, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border },
  selectedRolePill: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryLight },
  rolePillText: { ...TYPOGRAPHY.captionBold, color: COLORS.textSecondary },
  selectedRolePillText: { color: COLORS.white },
  submitButton: { marginTop: SPACING.md },
});
