import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { useApp } from '../context/AppContext';
import { FoodItem, MealType } from '../types';
import { getMealTypeEmoji, getMealTypeLabel } from '../utils/helpers';

interface MealCardProps {
  mealType: MealType;
  items: FoodItem[];
  onAddPress: () => void;
  onDeleteFood: (id: string, mealType: MealType) => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  mealType,
  items,
  onAddPress,
  onDeleteFood,
}) => {
  const { state } = useApp();
  const theme = state.settings.themeMode === 'dark' ? colors.dark : colors.light;

  const totalCals = items.reduce((s, f) => s + f.calories, 0);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }, shadows.sm]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.emoji}>{getMealTypeEmoji(mealType)}</Text>
          <View>
            <Text style={[styles.mealTitle, { color: theme.text }]}>
              {getMealTypeLabel(mealType)}
            </Text>
            <Text style={[styles.calCount, { color: theme.textSecondary }]}>
              {Math.round(totalCals)} kcal
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onAddPress}
          style={[styles.addBtn, { backgroundColor: colors.primaryFaint }]}
        >
          <Ionicons name="add" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {items.length > 0 && (
        <View style={[styles.itemList, { borderTopColor: theme.border }]}>
          {items.map((food) => (
            <View key={food.id} style={styles.foodRow}>
              <View style={styles.foodInfo}>
                <Text style={[styles.foodName, { color: theme.text }]} numberOfLines={1}>
                  {food.name}
                </Text>
                <Text style={[styles.foodPortion, { color: theme.textMuted }]}>
                  {food.portionDescription}
                </Text>
              </View>
              <View style={styles.foodRight}>
                <Text style={[styles.foodCal, { color: theme.text }]}>
                  {Math.round(food.calories)}
                </Text>
                <Text style={[styles.kcalLabel, { color: theme.textMuted }]}>kcal</Text>
                <TouchableOpacity
                  onPress={() => onDeleteFood(food.id, mealType)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={14} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {items.length === 0 && (
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          Tap + to log your {getMealTypeLabel(mealType).toLowerCase()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 28,
  },
  mealTitle: {
    ...typography.h4,
  },
  calCount: {
    ...typography.caption,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemList: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  foodName: {
    ...typography.body,
    fontWeight: '500',
  },
  foodPortion: {
    ...typography.caption,
  },
  foodRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  foodCal: {
    ...typography.body,
    fontWeight: '600',
  },
  kcalLabel: {
    ...typography.caption,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 4,
  },
  emptyText: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});
