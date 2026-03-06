import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows, getThemeColors } from '../theme';
import { useApp } from '../context/AppContext';
import { calculateTDEE } from '../utils/tdee';
import { getGoalLabel, getActivityLevelLabel } from '../utils/helpers';
import { UserProfile } from '../types';

export const ProfileScreen: React.FC = () => {
  const { state, toggleTheme, saveProfile } = useApp();
  const theme = getThemeColors(state.settings.themeMode);
  const { userProfile, settings } = state;
  const [isEditing, setIsEditing] = useState(false);

  // Edit state
  const [editWeight, setEditWeight] = useState(String(userProfile?.weightKg ?? ''));
  const [editGoalWeight, setEditGoalWeight] = useState(String(userProfile?.goalWeightKg ?? ''));

  const handleSaveEdit = async () => {
    if (!userProfile) return;
    const newWeight = parseFloat(editWeight);
    const newGoalWeight = parseFloat(editGoalWeight);
    if (isNaN(newWeight) || isNaN(newGoalWeight)) {
      Alert.alert('Invalid input', 'Please enter valid numbers for weight');
      return;
    }
    const tdee = calculateTDEE(
      newWeight,
      userProfile.heightCm,
      userProfile.age,
      userProfile.gender,
      userProfile.activityLevel,
      userProfile.goal
    );
    const updated: UserProfile = {
      ...userProfile,
      weightKg: newWeight,
      goalWeightKg: newGoalWeight,
      dailyCalorieTarget: tdee.dailyCalorieTarget,
      dailyProteinTarget: tdee.dailyProteinTarget,
      dailyCarbsTarget: tdee.dailyCarbsTarget,
      dailyFatTarget: tdee.dailyFatTarget,
    };
    await saveProfile(updated);
    setIsEditing(false);
  };

  if (!userProfile) return null;

  const progress = Math.max(
    0,
    Math.min(
      1,
      (userProfile.weightKg - userProfile.goalWeightKg) /
        (userProfile.weightKg - userProfile.goalWeightKg || 1)
    )
  );

  const weightDiff = userProfile.weightKg - userProfile.goalWeightKg;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileCard, { backgroundColor: colors.primary }, shadows.md]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>🌿</Text>
          </View>
          <Text style={styles.profileName}>{userProfile.name}</Text>
          <Text style={styles.profileSub}>
            {userProfile.age} yrs • {userProfile.gender} • {userProfile.heightCm}cm
          </Text>
        </View>

        {/* Weight Progress */}
        <View style={[styles.section, { backgroundColor: theme.surface }, shadows.sm]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Weight Progress</Text>
            <TouchableOpacity
              onPress={() => {
                if (isEditing) handleSaveEdit();
                else setIsEditing(true);
              }}
              style={[styles.editBtn, { backgroundColor: isEditing ? colors.primary : colors.primaryFaint }]}
            >
              <Text style={[styles.editBtnText, { color: isEditing ? '#fff' : colors.primaryDark }]}>
                {isEditing ? 'Save' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weightRow}>
            <View style={styles.weightItem}>
              <Text style={[styles.weightLabel, { color: theme.textMuted }]}>Current</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.weightInput, { color: theme.text, borderColor: colors.primary }]}
                  value={editWeight}
                  onChangeText={setEditWeight}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={[styles.weightValue, { color: theme.text }]}>
                  {userProfile.weightKg}kg
                </Text>
              )}
            </View>
            <Ionicons name="arrow-forward" size={20} color={theme.textMuted} />
            <View style={styles.weightItem}>
              <Text style={[styles.weightLabel, { color: theme.textMuted }]}>Goal</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.weightInput, { color: theme.text, borderColor: colors.primary }]}
                  value={editGoalWeight}
                  onChangeText={setEditGoalWeight}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={[styles.weightValue, { color: colors.primary }]}>
                  {userProfile.goalWeightKg}kg
                </Text>
              )}
            </View>
          </View>

          <Text style={[styles.weightDiffText, { color: theme.textSecondary }]}>
            {Math.abs(weightDiff).toFixed(1)}kg to {weightDiff > 0 ? 'lose' : 'gain'}
          </Text>
        </View>

        {/* Daily Targets */}
        <View style={[styles.section, { backgroundColor: theme.surface }, shadows.sm]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Targets</Text>
          <View style={styles.targetsGrid}>
            {[
              { label: 'Calories', value: `${userProfile.dailyCalorieTarget}`, unit: 'kcal', color: colors.primary },
              { label: 'Protein', value: `${userProfile.dailyProteinTarget}`, unit: 'g', color: colors.protein },
              { label: 'Carbs', value: `${userProfile.dailyCarbsTarget}`, unit: 'g', color: colors.carbs },
              { label: 'Fat', value: `${userProfile.dailyFatTarget}`, unit: 'g', color: colors.fat },
            ].map((t) => (
              <View
                key={t.label}
                style={[styles.targetBox, { backgroundColor: t.color + '15', borderColor: t.color + '30' }]}
              >
                <Text style={[styles.targetValue, { color: t.color }]}>{t.value}</Text>
                <Text style={[styles.targetUnit, { color: t.color }]}>{t.unit}</Text>
                <Text style={[styles.targetLabel, { color: theme.textSecondary }]}>{t.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Goal & Activity */}
        <View style={[styles.section, { backgroundColor: theme.surface }, shadows.sm]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile Details</Text>
          {[
            { label: 'Goal', value: getGoalLabel(userProfile.goal), icon: '🎯' },
            { label: 'Activity Level', value: getActivityLevelLabel(userProfile.activityLevel), icon: '🏃' },
          ].map((item) => (
            <View key={item.label} style={[styles.detailRow, { borderBottomColor: theme.border }]}>
              <Text style={styles.detailEmoji}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailLabel, { color: theme.textMuted }]}>{item.label}</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={[styles.section, { backgroundColor: theme.surface }, shadows.sm]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={settings.themeMode === 'dark' ? 'moon' : 'sunny'}
                size={20}
                color={theme.text}
              />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={settings.themeMode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: colors.primaryLight }}
              thumbColor={settings.themeMode === 'dark' ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.md },
  profileCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  avatarEmoji: { fontSize: 40 },
  profileName: { ...typography.h2, color: '#fff' },
  profileSub: { ...typography.body, color: 'rgba(255,255,255,0.8)' },
  section: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { ...typography.h4 },
  editBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  editBtnText: { ...typography.label },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  weightItem: { alignItems: 'center', gap: 4 },
  weightLabel: { ...typography.caption },
  weightValue: { ...typography.h2, fontWeight: '700' },
  weightInput: {
    ...typography.h3,
    borderBottomWidth: 2,
    paddingHorizontal: spacing.sm,
    minWidth: 80,
    textAlign: 'center',
  },
  weightDiffText: { ...typography.caption, textAlign: 'center' },
  targetsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  targetBox: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  targetValue: { ...typography.h3, fontWeight: '700' },
  targetUnit: { ...typography.caption },
  targetLabel: { ...typography.caption },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  detailEmoji: { fontSize: 20 },
  detailLabel: { ...typography.caption },
  detailValue: { ...typography.body, fontWeight: '500' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  settingLabel: { ...typography.body },
});
