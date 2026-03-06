import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows, getThemeColors } from '../theme';
import { useApp } from '../context/AppContext';
import { getAllDailyLogs } from '../services/storage';
import { DailyLog } from '../types';
import { formatDate, getMealTypeEmoji } from '../utils/helpers';

export const HistoryScreen: React.FC = () => {
  const { state } = useApp();
  const theme = getThemeColors(state.settings.themeMode);
  const calorieTarget = state.userProfile?.dailyCalorieTarget ?? 2000;

  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getAllDailyLogs().then((all) =>
      setLogs(all.filter((l) => l.totalCalories > 0))
    );
  }, []);

  const toggleExpand = (date: string) => {
    setExpanded((prev) => (prev === date ? null : date));
  };

  const getBadgeColor = (calories: number) => {
    const ratio = calories / calorieTarget;
    if (ratio < 0.8) return colors.protein; // under — blue info
    if (ratio <= 1.1) return colors.primary; // on target — green
    return colors.error; // over — red
  };

  const renderItem = ({ item }: { item: DailyLog }) => {
    const isExpanded = expanded === item.date;
    const allFoods = [...item.breakfast, ...item.lunch, ...item.dinner, ...item.snacks];
    const badgeColor = getBadgeColor(item.totalCalories);

    return (
      <View style={[styles.logCard, { backgroundColor: theme.surface }, shadows.sm]}>
        <TouchableOpacity
          onPress={() => toggleExpand(item.date)}
          style={styles.logHeader}
        >
          <View style={styles.dateBlock}>
            <Text style={[styles.dateText, { color: theme.text }]}>{formatDate(item.date)}</Text>
            <Text style={[styles.fullDate, { color: theme.textMuted }]}>{item.date}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.calBadge, { backgroundColor: badgeColor + '20' }]}>
              <Text style={[styles.calBadgeText, { color: badgeColor }]}>
                {Math.round(item.totalCalories)} kcal
              </Text>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={theme.textMuted}
            />
          </View>
        </TouchableOpacity>

        {/* Macro summary mini */}
        <View style={styles.macroMiniRow}>
          {[
            { label: 'P', value: item.totalProtein, color: colors.protein },
            { label: 'C', value: item.totalCarbs, color: colors.carbs },
            { label: 'F', value: item.totalFat, color: colors.fat },
          ].map((m) => (
            <View key={m.label} style={styles.macroMini}>
              <Text style={[styles.macroMiniLabel, { color: m.color }]}>{m.label}</Text>
              <Text style={[styles.macroMiniValue, { color: theme.textSecondary }]}>
                {Math.round(m.value)}g
              </Text>
            </View>
          ))}
        </View>

        {/* Expanded food list */}
        {isExpanded && (
          <View style={[styles.expandedContent, { borderTopColor: theme.border }]}>
            {allFoods.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No foods logged</Text>
            ) : (
              allFoods.map((food) => (
                <View key={food.id} style={styles.foodRow}>
                  <Text style={styles.mealEmoji}>{getMealTypeEmoji(food.mealType)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.foodName, { color: theme.text }]} numberOfLines={1}>
                      {food.name}
                    </Text>
                    <Text style={[styles.foodPortion, { color: theme.textMuted }]}>
                      {food.portionDescription}
                    </Text>
                  </View>
                  <Text style={[styles.foodCal, { color: theme.text }]}>
                    {Math.round(food.calories)} kcal
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>History</Text>
        <Text style={[styles.entryCount, { color: theme.textMuted }]}>
          {logs.length} {logs.length === 1 ? 'day' : 'days'} logged
        </Text>
      </View>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.date}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No history yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              Start logging meals and your history will appear here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  screenTitle: { ...typography.h2 },
  entryCount: { ...typography.caption },
  listContent: { padding: spacing.md, gap: spacing.sm, paddingBottom: 80 },
  logCard: { borderRadius: borderRadius.lg, overflow: 'hidden' },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  dateBlock: {},
  dateText: { ...typography.h4 },
  fullDate: { ...typography.caption, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  calBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  calBadgeText: { ...typography.label },
  macroMiniRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.lg,
  },
  macroMini: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  macroMiniLabel: { ...typography.label },
  macroMiniValue: { ...typography.caption },
  expandedContent: {
    borderTopWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mealEmoji: { fontSize: 16 },
  foodName: { ...typography.body },
  foodPortion: { ...typography.caption, marginTop: 1 },
  foodCal: { ...typography.body, fontWeight: '600' },
  emptyText: { ...typography.caption, fontStyle: 'italic' },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 80, gap: spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...typography.h3 },
  emptySubtitle: { ...typography.body, textAlign: 'center', maxWidth: 240 },
});
