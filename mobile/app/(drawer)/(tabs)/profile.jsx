import { useOpenDrawer } from '../../../src/utils/navigation';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/context/AuthContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../../src/constants/theme';
import Header from '../../../src/components/common/Header';
import Badge from '../../../src/components/common/Badge';
import Button from '../../../src/components/common/Button';
import Input from '../../../src/components/common/Input';
import ModalDialog from '../../../src/components/common/ModalDialog';
import { getErrorMessage } from '../../../src/services/api';

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) { Alert.alert('Validation Error', 'Name cannot be empty.'); return; }
    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      setIsEditing(false);
      Alert.alert('Success', 'Your profile details have been saved.');
    } catch (error) {
      Alert.alert('Update Failed', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
  };

  const openDrawer = useOpenDrawer();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header title="My Profile" subtitle="Account details & preferences" showDrawer onDrawerPress={openDrawer} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name ? user.name[0].toUpperCase() : 'U'}</Text>
            </View>
            <View style={styles.userHeadings}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Badge label={user?.role || 'Member'} variant={user?.role} size="sm" style={styles.roleBadge} />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionHeader}>Resident Information</Text>
            <TouchableOpacity onPress={() => { if (isEditing) { setName(user?.name || ''); setPhone(user?.phone || ''); } setIsEditing(!isEditing); }}>
              <Text style={styles.editToggleText}>{isEditing ? 'Cancel' : 'Edit Info'}</Text>
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <Input label="Full Name" value={name} onChangeText={setName} icon="person-outline" required />
              <Input label="Phone Number" value={phone} onChangeText={setPhone} icon="call-outline" keyboardType="phone-pad" />
              <Button title="Save Changes" onPress={handleSaveProfile} loading={loading} size="md" style={styles.saveButton} />
            </View>
          ) : (
            <View>
              <View style={styles.detailRow}>
                <Ionicons name="business-outline" size={17} color={COLORS.textSecondary} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Assigned Flat</Text>
                  <Text style={styles.detailValue}>{user?.flatNumber || 'Not Set'}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="mail-outline" size={17} color={COLORS.textSecondary} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Email Address</Text>
                  <Text style={styles.detailValue}>{user?.email}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={17} color={COLORS.textSecondary} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Phone Number</Text>
                  <Text style={styles.detailValue}>{user?.phone || 'Not Provided'}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSectionHeader}>Society Notice</Text>
          <Text style={styles.noticeText}>For emergency maintenance or building security access, please contact the security cabin directly or file a ticket under the Urgent priority.</Text>
        </View>

        <Button title="Sign Out of Society Connect" variant="danger" icon="log-out-outline" onPress={() => setLogoutModalVisible(true)} style={styles.logoutButton} />
      </ScrollView>

      <ModalDialog visible={logoutModalVisible} onClose={() => setLogoutModalVisible(false)} title="Sign Out" message="Are you sure you want to sign out of your account?" confirmText="Sign Out" confirmVariant="danger" onConfirm={handleConfirmLogout} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.card },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 62, height: 62, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  avatarText: { fontSize: 24, fontWeight: '700', color: COLORS.white },
  userHeadings: { flex: 1 },
  userName: { ...TYPOGRAPHY.h2, color: COLORS.text },
  userEmail: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  roleBadge: { marginTop: 6 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  cardSectionHeader: { ...TYPOGRAPHY.h3, color: COLORS.text },
  editToggleText: { ...TYPOGRAPHY.captionBold, color: COLORS.textSecondary },
  editForm: { marginTop: SPACING.xs },
  saveButton: { marginTop: SPACING.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  detailTextContainer: { marginLeft: SPACING.md, flex: 1 },
  detailLabel: { ...TYPOGRAPHY.small, color: COLORS.textMuted },
  detailValue: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, marginTop: 1 },
  noticeText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, lineHeight: 21 },
  logoutButton: { marginTop: SPACING.md },
});
