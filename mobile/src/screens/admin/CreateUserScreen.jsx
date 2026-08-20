import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { userAPI, getErrorMessage } from '../../services/api';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const CreateUserScreen = ({ route, navigation }) => {
  const editUser = route.params?.editUser;
  const isEditMode = !!editUser;

  const [name, setName] = useState(editUser?.name || '');
  const [email, setEmail] = useState(editUser?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(editUser?.role || 'Member');
  const [flatNumber, setFlatNumber] = useState(editUser?.flatNumber || '');
  const [phone, setPhone] = useState(editUser?.phone || '');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }
    if (!isEditMode && !password) {
      setErrorMessage('Password is required for new accounts.');
      return;
    }
    if (role === 'Member' && !flatNumber.trim()) {
      setErrorMessage('Flat number is required for Member accounts.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      if (isEditMode) {
        await userAPI.updateUser(editUser.id || editUser._id, {
          name: name.trim(),
          email: email.trim(),
          role,
          flatNumber: role === 'Member' ? flatNumber.trim() : '',
          phone: phone.trim(),
          ...(password ? { password } : {}),
        });
        Alert.alert('Success', 'User profile updated successfully.', [
          { text: 'Done', onPress: () => navigation.goBack() },
        ]);
      } else {
        await userAPI.createUser({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          flatNumber: role === 'Member' ? flatNumber.trim() : '',
          phone: phone.trim(),
        });
        Alert.alert('Success', `New ${role} account registered.`, [
          { text: 'Done', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      const msg = getErrorMessage(error);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header
        title={isEditMode ? 'Edit User Account' : 'Register New Account'}
        subtitle={isEditMode ? `Updating ${editUser.name}` : 'Create society member or staff'}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Role Selector */}
            <View style={styles.roleGroup}>
              <Text style={styles.roleLabel}>System Role *</Text>
              <View style={styles.roleRow}>
                {['Member', 'Manager', 'Admin'].map((r) => {
                  const isSelected = role === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setRole(r)}
                      style={[
                        styles.rolePill,
                        isSelected && styles.selectedRolePill,
                      ]}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.rolePillText,
                          isSelected && styles.selectedRolePillText,
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Input
              label="Full Name"
              placeholder="e.g. Robert Miles"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errorMessage) setErrorMessage('');
              }}
              icon="person-outline"
              required
            />

            <Input
              label="Email Address"
              placeholder="robert@societyconnect.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage('');
              }}
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />

            {role === 'Member' && (
              <Input
                label="Flat / Unit Number"
                placeholder="e.g. Tower A - 204"
                value={flatNumber}
                onChangeText={(text) => {
                  setFlatNumber(text);
                  if (errorMessage) setErrorMessage('');
                }}
                icon="business-outline"
                required
              />
            )}

            <Input
              label="Phone Number"
              placeholder="+1 555-0155"
              value={phone}
              onChangeText={setPhone}
              icon="call-outline"
              keyboardType="phone-pad"
            />

            <Input
              label={isEditMode ? 'New Password (Leave empty to keep current)' : 'Password *'}
              placeholder={isEditMode ? '••••••••' : 'Min. 6 characters'}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
              icon="lock-closed-outline"
              secureTextEntry
              required={!isEditMode}
            />

            <Button
              title={isEditMode ? 'Update User Account' : 'Register Account'}
              onPress={handleSubmit}
              loading={loading}
              size="lg"
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerBg,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  errorBannerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    flex: 1,
    fontWeight: '500',
  },
  roleGroup: {
    marginBottom: SPACING.md + 2,
  },
  roleLabel: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
    marginBottom: SPACING.xs + 2,
  },
  roleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  rolePill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedRolePill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  rolePillText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
  },
  selectedRolePillText: {
    color: COLORS.white,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
});

export default CreateUserScreen;
