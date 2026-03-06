import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows, getThemeColors } from '../theme';
import { useApp } from '../context/AppContext';
import { CalorieRing } from '../components/CalorieRing';
import { MealCard } from '../components/MealCard';
import { formatDateFull, getTodayDate } from '../utils/helpers';
import { MealType } from '../types';

interface Props {
  navigation: any;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { state, refreshTodayLog, removeFood } = useApp();
  const theme = getThemeColors(state.settings.themeMode);
  const { userProfile, todayLog } = state;

  // Refresh log when screen is focused (e.g., coming back from log screen)
  useFocusEffect(
    useCallback(() => {
      refreshTodayLog();
    }, [])
  );

  const calorieTarget = userProfile?.dailyCalorieTarget ?? 2000;
  const consumed = todayLog?.totalCalories ?? 0;

  const macroTarget = {
    protein: userProfile?.dailyProteinTarget ?? 150,
    carbs: userProfile?.dailyCarbsTarget ?? 225,
    fat: userProfile?.dailyFatTarget ?? 56,
  };

  const handleAddFood = (mealType: MealType) => {
    navigation.navigate('LogFood', { mealType });
  };

  const handleDeleteFood = async (foodId: string, mealType: MealType) => {
    await removeFood(foodId, mealType);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refreshTodayLog}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              {greeting()}, {userProfile?.name?.split(' ')[0] ?? 'there'} 👋
            </Text>
            <Text style={[styles.dateText, { color: theme.textMuted }]}>
              {formatDateFull(getTodayDate())}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={[styles.avatarBtn, { backgroundColor: colors.primaryFaint }]}
          >
            <Ionicons name="person" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Calorie Ring Card */}
        <View style={[styles.ringCard, { backgroundColor: theme.surface }, shadows.md]}>
          <CalorieRing consumed={consumed} target={calorieTarget} />

          {/* Macro summary */}
          <View style={[styles.macroDivider, { backgroundColor: theme.border }]} />
          <View style={styles.macroRow}>
            {[
              { label: 'Protein', value: todayLog?.totalProtein ?? 0, target: macroTarget.protein, color: colors.protein },
              { label: 'Carbs', value: todayLog?.totalCarbs ?? 0, target: macroTarget.carbs, color: colors.carbs },
              { label: 'Fat', value: todayLog?.totalFat ?? 0, target: macroTarget.fat, color: colors.fat },
            ].map((m) => (
              <View key={m.label} style={styles.macroItem}>
                <View style={styles.macroBarTrack}>
                  <View
                    style={[
                      styles.macroBarFill,
                      {
                        width: `${Math.min((m.value / m.target) * 100, 100)}%`,
                        backgroundColor: m.color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.macroValue, { color: theme.text }]}>
                  {Math.round(m.value)}g
                </Text>
                <Text style={[styles.macroTarget, { color: theme.textMuted }]}>
                  / {m.target}g
                </Text>
                <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>
                  {m.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Meals Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Meals</Text>

        {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map((mealType) => (
          <MealCard
            key={mealType}
            mealType={mealType}
            items={todayLog?.[mealType] ?? []}
            onAddPress={() => handleAddFood(mealType)}
            onDeleteFood={handleDeleteFood}
          />
        ))}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, shadows.lg]}
        onPress={() => navigation.navigate('LogFood', {})}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: { ...typography.h3 },
  dateText: { ...typography.caption, marginTop: 2 },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  macroDivider: { height: 1, width: '100%', marginVertical: spacing.md },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  macroItem: { alignItems: 'center', flex: 1 },
  macroBarTrack: {
    width: '70%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  macroBarFill: { height: 4, borderRadius: 2 },
  macroValue: { ...typography.body, fontWeight: '600' },
  macroTarget: { ...typography.caption },
  macroLabel: { ...typography.caption },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
