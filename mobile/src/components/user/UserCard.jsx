import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import Badge from '../common/Badge';

export const UserCard = ({
  user,
  onPress,
  onEdit,
  onDelete,
  style,
}) => {
  const getAvatarColor = (role) => {
    switch (role) {
      case 'Admin':
        return '#EF4444';
      case 'Manager':
        return '#06B6D4';
      default:
        return '#6366F1';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.card, style]}
    >
      <View style={styles.contentRow}>
        {/* Avatar Circle */}
        <View
          style={[
            styles.avatar,
            { backgroundColor: `${getAvatarColor(user.role)}25`, borderColor: getAvatarColor(user.role) },
          ]}
        >
          <Text style={[styles.avatarText, { color: getAvatarColor(user.role) }]}>
            {getInitials(user.name)}
          </Text>
        </View>

        {/* User Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {user.name}
            </Text>
            <Badge label={user.role} variant={user.role} size="sm" />
          </View>

          <Text style={styles.email} numberOfLines={1}>
            {user.email}
          </Text>

          {user.role === 'Member' && user.flatNumber && (
            <View style={styles.metaRow}>
              <Ionicons name="business-outline" size={13} color={COLORS.textSecondary} />
              <Text style={styles.flatText}>{user.flatNumber}</Text>
            </View>
          )}

          {user.phone && (
            <View style={styles.metaRow}>
              <Ionicons name="call-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.phoneText}>{user.phone}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons (Edit / Delete) */}
      {(onEdit || onDelete) && user.role !== 'Admin' && (
        <View style={styles.actionRow}>
          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil-outline" size={16} color={COLORS.primaryLight} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              style={[styles.actionButton, styles.deleteButton]}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md + 2,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  email: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  flatText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  phoneText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
    gap: 4,
  },
  deleteButton: {
    backgroundColor: COLORS.dangerBg,
  },
  editText: {
    ...TYPOGRAPHY.small,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  deleteText: {
    ...TYPOGRAPHY.small,
    color: COLORS.danger,
    fontWeight: '600',
  },
});

export default UserCard;
