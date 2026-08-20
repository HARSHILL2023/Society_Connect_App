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

export const AdminProfileScreen = () => {
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
      Alert.alert('Success', 'Admin profile saved.');
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
      <Header title="Super Admin Profile" subtitle="System administrator settings" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </Text>
            </View>
            <View style={styles.userHeadings}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Badge label="Super Administrator" variant="Admin" size="sm" style={styles.roleBadge} />
            </View>
          </View>
        </View>

        {/* Administrator Details */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionHeader}>Admin Profile Info</Text>
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
                <Ionicons name="mail-outline" size={18} color="#EF4444" />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Root Admin Email</Text>
                  <Text style={styles.detailValue}>{user?.email}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={18} color="#EF4444" />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Direct Line</Text>
                  <Text style={styles.detailValue}>{user?.phone || 'Not Provided'}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Server & DB Information */}
        <View style={styles.card}>
          <Text style={styles.cardSectionHeader}>Platform Connectivity</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Connected to Society Connect Database</Text>
          </View>
          <Text style={styles.noticeText}>
            Full authorization enabled: create/edit users, oversee maintenance staff, and manage society configurations.
          </Text>
        </View>

        <Button
          title="Sign Out of Admin Console"
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
        message="Are you sure you want to sign out of the Admin Console?"
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
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: '#EF4444',
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
    color: '#EF4444',
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.resolved,
    marginRight: SPACING.sm,
  },
  statusText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.resolved,
  },
  noticeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  logoutButton: {
    marginTop: SPACING.md,
  },
});

export default AdminProfileScreen;
