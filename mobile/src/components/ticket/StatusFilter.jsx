import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export const StatusFilter = ({
  selectedStatus = 'All',
  onSelectStatus,
  options = ['All', 'Pending', 'In Progress', 'Resolved'],
  counts = {},
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((status) => {
        const isSelected = selectedStatus === status;
        const count = counts[status];

        return (
          <TouchableOpacity
            key={status}
            onPress={() => onSelectStatus(status)}
            activeOpacity={0.75}
            style={[
              styles.tab,
              isSelected && styles.selectedTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                isSelected && styles.selectedTabText,
              ]}
            >
              {status}
            </Text>
            {count !== undefined && (
              <View
                style={[
                  styles.countBadge,
                  isSelected && styles.selectedCountBadge,
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    isSelected && styles.selectedCountText,
                  ]}
                >
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  tabText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
  },
  selectedTabText: {
    color: COLORS.white,
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
  },
  selectedCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  selectedCountText: {
    color: COLORS.white,
  },
});

export default StatusFilter;
