import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, CATEGORIES } from '../../constants/theme';

export const CategoryFilter = ({
  selectedCategory = 'All',
  onSelectCategory,
}) => {
  const allCategories = ['All', ...CATEGORIES];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {allCategories.map((category) => {
        const isSelected = selectedCategory === category;

        return (
          <TouchableOpacity
            key={category}
            onPress={() => onSelectCategory(category)}
            activeOpacity={0.75}
            style={[
              styles.chip,
              isSelected && styles.selectedChip,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                isSelected && styles.selectedChipText,
              ]}
            >
              {category}
            </Text>
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
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedChip: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: COLORS.primaryLight,
  },
  chipText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  selectedChipText: {
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
});

export default CategoryFilter;
