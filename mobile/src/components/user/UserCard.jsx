import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import Badge from '../common/Badge';

export const UserCard = ({
  user,
  onPress,
  onEdit,
  onDelete,
  style,
}) => {
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
      activeOpacity={0.85}
      style={[styles.card, style]}
    >
      <View style={styles.contentRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
        </View>

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

          <View style={styles.metaRow}>
            {user.role === 'Member' && user.flatNumber && (
              <View style={styles.metaItem}>
                <Ionicons name="business-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{user.flatNumber}</Text>
              </View>
            )}
            {user.phone && (
              <View style={styles.metaItem}>
                <Ionicons name="call-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{user.phone}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {(onEdit || onDelete) && user.role !== 'Admin' && (
        <View style={styles.actionRow}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.actionButton} activeOpacity={0.7}>
              <Ionicons name="pencil-outline" size={15} color={COLORS.text} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionButton} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={15} color={COLORS.danger} />
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
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  name: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
    fontSize: 15.5,
  },
  email: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: 5,
    fontSize: 12.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
    gap: 5,
  },
  editText: {
    ...TYPOGRAPHY.small,
    color: COLORS.text,
    fontWeight: '600',
  },
  deleteText: {
    ...TYPOGRAPHY.small,
    color: COLORS.danger,
    fontWeight: '600',
  },
});

export default UserCard;
