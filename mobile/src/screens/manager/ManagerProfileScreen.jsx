import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import Header from '../../components/common/Header';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ModalDialog from '../../components/common/ModalDialog';
import { getErrorMessage } from '../../services/api';

export const ManagerProfileScreen = () => {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated.');
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header title="Manager Profile" subtitle="Operations account settings" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name[0].toUpperCase() : 'M'}
              </Text>
            </View>
            <View style={styles.userHeadings}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Badge label="Operations Manager" variant="Manager" size="sm" style={styles.roleBadge} />
            </View>
          </View>
        </View>

        {/* Manager Details */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionHeader}>Staff Account Details</Text>
            <TouchableOpacity
              onPress={() => {
                if (isEditing) {
                  setName(user?.name || '');
                  setPhone(user?.phone || '');
                }
                setIsEditing(!isEditing);
              }}
            >
              <Text style={styles.editToggleText}>
                {isEditing ? 'Cancel' : 'Edit Info'}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <Input
                label="Full Name"
                value={name}
                onChangeText={setName}
                icon="person-outline"
                required
              />

              <Input
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                icon="call-outline"
                keyboardType="phone-pad"
              />

              <Button
                title="Save Profile"
                onPress={handleSaveProfile}
                loading={loading}
                size="md"
                style={styles.saveButton}
              />
            </View>
          ) : (
            <View>
              <View style={styles.detailRow}>
                <Ionicons name="mail-outline" size={18} color="#06B6D4" />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Official Email</Text>
                  <Text style={styles.detailValue}>{user?.email}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={18} color="#06B6D4" />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Contact Phone</Text>
                  <Text style={styles.detailValue}>{user?.phone || 'Not Provided'}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Guidelines */}
        <View style={styles.card}>
          <Text style={styles.cardSectionHeader}>Manager Responsibilities</Text>
          <Text style={styles.noticeText}>
            • Inspect pending complaints within 2 hours of submission.{'\n'}
            • Update status to 'In Progress' when a technician has been dispatched.{'\n'}
            • Add maintenance notes explaining replacement parts or technician arrival time.{'\n'}
            • Mark tickets 'Resolved' only after resident satisfaction is verified.
          </Text>
        </View>

        <Button
          title="Sign Out"
          variant="danger"
          icon="log-out-outline"
          onPress={() => setLogoutModalVisible(true)}
          style={styles.logoutButton}
        />
      </ScrollView>

      <ModalDialog
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        title="Sign Out"
        message="Are you sure you want to sign out of the manager desk?"
        confirmText="Sign Out"
        confirmVariant="danger"
        onConfirm={handleConfirmLogout}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0891B2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: '#22D3EE',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  userHeadings: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  userEmail: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  cardSectionHeader: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  editToggleText: {
    ...TYPOGRAPHY.captionBold,
    color: '#06B6D4',
  },
  editForm: {
    marginTop: SPACING.xs,
  },
  saveButton: {
    marginTop: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailTextContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  detailLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
  },
  detailValue: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
    marginTop: 1,
  },
  noticeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  logoutButton: {
    marginTop: SPACING.md,
  },
});

export default ManagerProfileScreen;
