import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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
            activeOpacity={0.8}
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
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontSize: 12,
  },
  selectedChipText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default CategoryFilter;
