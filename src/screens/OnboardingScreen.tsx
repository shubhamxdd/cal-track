import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows, getThemeColors } from '../theme';
import { useApp } from '../context/AppContext';
import { calculateTDEE } from '../utils/tdee';
import { generateId } from '../utils/helpers';
import { UserProfile, Gender, ActivityLevel, Goal } from '../types';

type OnboardingNavProp = StackNavigationProp<any>;

interface Props {
  navigation: OnboardingNavProp;
}

const STEPS = 6;

// Step 1 content
const GenderOption = ({
  label, emoji, value, selected, onPress, theme
}: any) => (
  <TouchableOpacity
    onPress={() => onPress(value)}
    style={[
      styles.optionCard,
      { backgroundColor: selected ? colors.primaryFaint : theme.surface, borderColor: selected ? colors.primary : theme.border },
    ]}
  >
    <Text style={styles.optionEmoji}>{emoji}</Text>
    <Text style={[styles.optionLabel, { color: selected ? colors.primaryDark : theme.text }]}>{label}</Text>
  </TouchableOpacity>
);

const ActivityOption = ({ label, desc, value, selected, onPress, theme }: any) => (
  <TouchableOpacity
    onPress={() => onPress(value)}
    style={[
      styles.activityCard,
      { backgroundColor: selected ? colors.primaryFaint : theme.surface, borderColor: selected ? colors.primary : theme.border },
    ]}
  >
    <View style={styles.activityLeft}>
      <Text style={[styles.activityLabel, { color: selected ? colors.primaryDark : theme.text }]}>{label}</Text>
      <Text style={[styles.activityDesc, { color: theme.textMuted }]}>{desc}</Text>
    </View>
    {selected && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
  </TouchableOpacity>
);

const GoalOption = ({ label, emoji, desc, value, selected, onPress, theme }: any) => (
  <TouchableOpacity
    onPress={() => onPress(value)}
    style={[
      styles.goalCard,
      { backgroundColor: selected ? colors.primaryFaint : theme.surface, borderColor: selected ? colors.primary : theme.border },
    ]}
  >
    <Text style={styles.goalEmoji}>{emoji}</Text>
    <Text style={[styles.goalLabel, { color: selected ? colors.primaryDark : theme.text }]}>{label}</Text>
    <Text style={[styles.goalDesc, { color: theme.textMuted }]}>{desc}</Text>
    {selected && <Ionicons name="checkmark-circle" size={22} color={colors.primary} style={styles.goalCheck} />}
  </TouchableOpacity>
);

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { state, saveProfile, completeOnboarding } = useApp();
  const theme = getThemeColors(state.settings.themeMode);
  const [step, setStep] = useState(1);

  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [tdeeResult, setTdeeResult] = useState<any>(null);

  const nextStep = () => {
    if (step === 4) {
      const result = calculateTDEE(
        parseFloat(weight), parseFloat(height), parseInt(age), gender, activityLevel, goal
      );
      setTdeeResult(result);
    }
    setStep((s) => Math.min(s + 1, STEPS));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinish = async () => {
    const profile: UserProfile = {
      id: generateId(),
      name: name.trim(),
      age: parseInt(age),
      gender,
      heightCm: parseFloat(height),
      weightKg: parseFloat(weight),
      goalWeightKg: parseFloat(goalWeight),
      activityLevel,
      goal,
      dailyCalorieTarget: tdeeResult?.dailyCalorieTarget ?? 2000,
      dailyProteinTarget: tdeeResult?.dailyProteinTarget ?? 150,
      dailyCarbsTarget: tdeeResult?.dailyCarbsTarget ?? 225,
      dailyFatTarget: tdeeResult?.dailyFatTarget ?? 56,
      createdAt: new Date().toISOString(),
    };
    await saveProfile(profile);
    await completeOnboarding();
  };

  const progress = step / STEPS;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>👋</Text>
            <Text style={[styles.stepTitle, { color: theme.text }]}>What's your name?</Text>
            <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
              Let's personalise your experience
            </Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder="Your name"
              placeholderTextColor={theme.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Age</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  placeholder="25"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
              </View>
            </View>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Gender</Text>
            <View style={styles.genderRow}>
              <GenderOption label="Male" emoji="👨" value="male" selected={gender === 'male'} onPress={setGender} theme={theme} />
              <GenderOption label="Female" emoji="👩" value="female" selected={gender === 'female'} onPress={setGender} theme={theme} />
              <GenderOption label="Other" emoji="🧑" value="other" selected={gender === 'other'} onPress={setGender} theme={theme} />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>📏</Text>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Your body metrics</Text>
            <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
              We use this to calculate your calorie needs
            </Text>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Height (cm)</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  placeholder="170"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Current Weight (kg)</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  placeholder="70"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
            </View>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Goal Weight (kg)</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder="65"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={goalWeight}
              onChangeText={setGoalWeight}
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🏃</Text>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Activity level</Text>
            <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
              How active are you?
            </Text>
            {([
              { value: 'sedentary', label: 'Sedentary', desc: 'Desk job, little to no exercise' },
              { value: 'light', label: 'Light', desc: 'Light exercise 1-3 days/week' },
              { value: 'moderate', label: 'Moderate', desc: 'Exercise 3-5 days/week' },
              { value: 'active', label: 'Active', desc: 'Hard exercise 6-7 days/week' },
              { value: 'very_active', label: 'Very Active', desc: 'Physical job or 2x/day training' },
            ] as any[]).map((opt) => (
              <ActivityOption key={opt.value} {...opt} selected={activityLevel === opt.value} onPress={setActivityLevel} theme={theme} />
            ))}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🎯</Text>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Your goal</Text>
            <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
              What do you want to achieve?
            </Text>
            {([
              { value: 'lose', label: 'Lose Weight', emoji: '🔥', desc: '500 kcal deficit/day' },
              { value: 'maintain', label: 'Maintain', emoji: '⚖️', desc: 'Stay at current weight' },
              { value: 'gain', label: 'Build Muscle', emoji: '💪', desc: '300 kcal surplus/day' },
            ] as any[]).map((opt) => (
              <GoalOption key={opt.value} {...opt} selected={goal === opt.value} onPress={setGoal} theme={theme} />
            ))}
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🎉</Text>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Your daily targets</Text>
            <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
              Calculated just for you, {name}
            </Text>
            <View style={[styles.resultCard, { backgroundColor: theme.surface }, shadows.md]}>
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>Daily Calories</Text>
                <Text style={[styles.resultValue, { color: colors.primary }]}>
                  {tdeeResult?.dailyCalorieTarget?.toLocaleString()} kcal
                </Text>
              </View>
              <View style={[styles.resultDivider, { backgroundColor: theme.border }]} />
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>Protein</Text>
                <Text style={[styles.resultValue, { color: colors.protein }]}>
                  {tdeeResult?.dailyProteinTarget}g
                </Text>
              </View>
              <View style={[styles.resultDivider, { backgroundColor: theme.border }]} />
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>Carbs</Text>
                <Text style={[styles.resultValue, { color: colors.carbs }]}>
                  {tdeeResult?.dailyCarbsTarget}g
                </Text>
              </View>
              <View style={[styles.resultDivider, { backgroundColor: theme.border }]} />
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>Fat</Text>
                <Text style={[styles.resultValue, { color: colors.fat }]}>
                  {tdeeResult?.dailyFatTarget}g
                </Text>
              </View>
            </View>
            <Text style={[styles.disclaimer, { color: theme.textMuted }]}>
              You can always adjust these in your Profile settings.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return name.trim().length > 0 && age.length > 0;
      case 2: return height.length > 0 && weight.length > 0 && goalWeight.length > 0;
      default: return true;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        {/* Step counter */}
        <View style={styles.stepCounter}>
          {step > 1 && (
            <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={theme.text} />
            </TouchableOpacity>
          )}
          <Text style={[styles.stepIndicator, { color: theme.textMuted }]}>
            {step} of {STEPS - 1}
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.background }]}>
          <TouchableOpacity
            style={[styles.nextBtn, { opacity: canProceed() ? 1 : 0.5 }]}
            onPress={step < STEPS - 1 ? nextStep : handleFinish}
            disabled={!canProceed()}
          >
            <Text style={styles.nextBtnText}>
              {step < STEPS - 1 ? 'Continue' : "Let's Go! 🚀"}
            </Text>
            {step < STEPS - 1 && <Ionicons name="arrow-forward" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressTrack: { height: 4, width: '100%' },
  progressFill: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  stepCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: { marginRight: spacing.sm },
  stepIndicator: { ...typography.caption },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  stepContent: { gap: spacing.md },
  stepEmoji: { fontSize: 48, textAlign: 'center', marginBottom: spacing.sm },
  stepTitle: { ...typography.h2, textAlign: 'center' },
  stepSubtitle: { ...typography.bodyMd, textAlign: 'center', marginBottom: spacing.sm },
  textInput: {
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.bodyLg,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  halfInput: { flex: 1 },
  inputLabel: { ...typography.label, marginBottom: spacing.xs },
  genderRow: { flexDirection: 'row', gap: spacing.sm },
  optionCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  optionEmoji: { fontSize: 28 },
  optionLabel: { ...typography.label },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  activityLeft: { flex: 1 },
  activityLabel: { ...typography.body, fontWeight: '600' },
  activityDesc: { ...typography.caption, marginTop: 2 },
  goalCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    position: 'relative',
  },
  goalEmoji: { fontSize: 28, marginBottom: spacing.xs },
  goalLabel: { ...typography.h4 },
  goalDesc: { ...typography.caption, marginTop: 2 },
  goalCheck: { position: 'absolute', top: spacing.md, right: spacing.md },
  resultCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { ...typography.body },
  resultValue: { ...typography.h4, fontWeight: '700' },
  resultDivider: { height: 1 },
  disclaimer: { ...typography.caption, textAlign: 'center' },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  nextBtnText: { color: '#fff', ...typography.h4, fontWeight: '700' },
});
