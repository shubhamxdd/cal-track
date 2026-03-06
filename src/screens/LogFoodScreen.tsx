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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography, shadows, getThemeColors } from '../theme';
import { useApp } from '../context/AppContext';
import { getNutritionFromGemini } from '../api/gemini';
import { GeminiNutritionResponse, MealType, FavoriteFood } from '../types';
import { generateId, getMealTypeLabel, getMealTypeEmoji } from '../utils/helpers';

interface Props {
  navigation: any;
  route: RouteProp<any>;
}

type LogState = 'idle' | 'loading' | 'result';

export const LogFoodScreen: React.FC<Props> = ({ navigation, route }) => {
  const { state, logFood, saveFavoriteFood, favorites } = useApp() as any;
  const theme = getThemeColors(state.settings.themeMode);
  const initialMealType: MealType = (route.params as any)?.mealType ?? 'lunch';

  const [inputText, setInputText] = useState('');
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [logState, setLogState] = useState<LogState>('idle');
  const [nutritionResult, setNutritionResult] = useState<GeminiNutritionResponse | null>(null);
  const [saveAsFav, setSaveAsFav] = useState(false);

  // Editable nutrition fields
  const [editCal, setEditCal] = useState('');
  const [editProtein, setEditProtein] = useState('');
  const [editCarbs, setEditCarbs] = useState('');
  const [editFat, setEditFat] = useState('');

  const handleSearch = async () => {
    if (!inputText.trim()) return;
    setLogState('loading');
    try {
      const result = await getNutritionFromGemini(inputText.trim());
      setNutritionResult(result);
      setEditCal(String(Math.round(result.calories)));
      setEditProtein(String(Math.round(result.proteinG)));
      setEditCarbs(String(Math.round(result.carbsG)));
      setEditFat(String(Math.round(result.fatG)));
      setLogState('result');
    } catch (err: any) {
      setLogState('idle');
      Alert.alert(
        'Could not fetch nutrition',
        err.message || 'Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLog = async () => {
    if (!nutritionResult) return;
    const food = {
      name: nutritionResult.foodName,
      portionDescription: nutritionResult.portionDescription,
      calories: parseFloat(editCal) || nutritionResult.calories,
      proteinG: parseFloat(editProtein) || nutritionResult.proteinG,
      carbsG: parseFloat(editCarbs) || nutritionResult.carbsG,
      fatG: parseFloat(editFat) || nutritionResult.fatG,
      mealType,
    };
    await logFood(food, mealType);
    if (saveAsFav) {
      await saveFavoriteFood({ ...food, id: generateId() });
    }
    navigation.goBack();
  };

  const handleUseFavorite = async (fav: FavoriteFood) => {
    const food = {
      name: fav.name,
      portionDescription: fav.portionDescription,
      calories: fav.calories,
      proteinG: fav.proteinG,
      carbsG: fav.carbsG,
      fatG: fav.fatG,
      mealType,
    };
    await logFood(food, mealType);
    navigation.goBack();
  };

  const reset = () => {
    setLogState('idle');
    setNutritionResult(null);
  };

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Log Food</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Meal Type Selector */}
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Meal</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mealScroll}>
            {mealTypes.map((mt) => (
              <TouchableOpacity
                key={mt}
                onPress={() => setMealType(mt)}
                style={[
                  styles.mealChip,
                  {
                    backgroundColor: mealType === mt ? colors.primary : theme.surface,
                    borderColor: mealType === mt ? colors.primary : theme.border,
                  },
                ]}
              >
                <Text style={styles.mealChipEmoji}>{getMealTypeEmoji(mt)}</Text>
                <Text style={[styles.mealChipLabel, { color: mealType === mt ? '#fff' : theme.text }]}>
                  {getMealTypeLabel(mt)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search Input */}
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            What did you eat?
          </Text>
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder="e.g. 2 rotis with dal makhani"
              placeholderTextColor={theme.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              editable={logState !== 'loading'}
            />
            <TouchableOpacity
              onPress={logState === 'result' ? reset : handleSearch}
              style={[styles.searchBtn, { backgroundColor: logState === 'result' ? theme.surfaceSecondary : colors.primary }]}
              disabled={logState === 'loading'}
            >
              {logState === 'loading' ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : logState === 'result' ? (
                <Ionicons name="refresh" size={22} color={theme.text} />
              ) : (
                <Ionicons name="sparkles" size={22} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {logState === 'loading' && (
            <Text style={[styles.loadingText, { color: theme.textMuted }]}>
              Analyzing with Gemini AI...
            </Text>
          )}

          {/* Result Card */}
          {logState === 'result' && nutritionResult && (
            <View style={[styles.resultCard, { backgroundColor: theme.surface }, shadows.md]}>
              <View style={styles.resultHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.foodName, { color: theme.text }]}>{nutritionResult.foodName}</Text>
                  <Text style={[styles.portionText, { color: theme.textMuted }]}>
                    {nutritionResult.portionDescription}
                  </Text>
                </View>
                <View style={[styles.confidenceBadge, { backgroundColor: colors.primaryFaint }]}>
                  <Text style={[styles.confidenceText, { color: colors.primaryDark }]}>
                    {nutritionResult.confidence === 'high' ? '✓' : '~'} {nutritionResult.confidence}
                  </Text>
                </View>
              </View>

              <Text style={[styles.editNote, { color: theme.textMuted }]}>
                Tap to edit values if needed:
              </Text>

              <View style={styles.macroGrid}>
                {[
                  { label: 'Calories', value: editCal, setter: setEditCal, unit: 'kcal', color: colors.primary },
                  { label: 'Protein', value: editProtein, setter: setEditProtein, unit: 'g', color: colors.protein },
                  { label: 'Carbs', value: editCarbs, setter: setEditCarbs, unit: 'g', color: colors.carbs },
                  { label: 'Fat', value: editFat, setter: setEditFat, unit: 'g', color: colors.fat },
                ].map((item) => (
                  <View key={item.label} style={[styles.macroBox, { borderColor: item.color }]}>
                    <Text style={[styles.macroBoxLabel, { color: item.color }]}>{item.label}</Text>
                    <View style={styles.macroInputRow}>
                      <TextInput
                        style={[styles.macroInput, { color: theme.text }]}
                        value={item.value}
                        onChangeText={item.setter}
                        keyboardType="numeric"
                      />
                      <Text style={[styles.macroUnit, { color: theme.textMuted }]}>{item.unit}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Save as favorite toggle */}
              <TouchableOpacity
                onPress={() => setSaveAsFav(!saveAsFav)}
                style={styles.favRow}
              >
                <Ionicons
                  name={saveAsFav ? 'heart' : 'heart-outline'}
                  size={20}
                  color={saveAsFav ? colors.error : theme.textMuted}
                />
                <Text style={[styles.favLabel, { color: theme.textSecondary }]}>
                  Save as favorite
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.logBtn} onPress={handleLog}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.logBtnText}>Add to {getMealTypeLabel(mealType)}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Favorites */}
          {logState === 'idle' && state.favorites.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: spacing.lg }]}>
                ❤️ Favorites
              </Text>
              {state.favorites.slice(0, 5).map((fav: FavoriteFood) => (
                <TouchableOpacity
                  key={fav.id}
                  onPress={() => handleUseFavorite(fav)}
                  style={[styles.favCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.favCardName, { color: theme.text }]}>{fav.name}</Text>
                    <Text style={[styles.favCardPortion, { color: theme.textMuted }]}>
                      {fav.portionDescription}
                    </Text>
                  </View>
                  <Text style={[styles.favCardCal, { color: colors.primary }]}>
                    {Math.round(fav.calories)} kcal
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'space-between',
  },
  backBtn: { width: 40 },
  headerTitle: { ...typography.h3 },
  scrollContent: { padding: spacing.md },
  sectionLabel: { ...typography.label, marginBottom: spacing.sm },
  mealScroll: { marginBottom: spacing.lg },
  mealChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    marginRight: spacing.sm,
  },
  mealChipEmoji: { fontSize: 16 },
  mealChipLabel: { ...typography.body, fontWeight: '600' },
  searchRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  searchInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.bodyLg,
    minHeight: 56,
    textAlignVertical: 'top',
  },
  searchBtn: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { ...typography.body, textAlign: 'center', marginTop: spacing.md, fontStyle: 'italic' },
  resultCard: { borderRadius: borderRadius.lg, padding: spacing.md, marginTop: spacing.md, gap: spacing.md },
  resultHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  foodName: { ...typography.h4 },
  portionText: { ...typography.caption, marginTop: 2 },
  confidenceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  confidenceText: { ...typography.caption, fontWeight: '600' },
  editNote: { ...typography.caption },
  macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  macroBox: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  macroBoxLabel: { ...typography.label, marginBottom: 4 },
  macroInputRow: { flexDirection: 'row', alignItems: 'baseline' },
  macroInput: { ...typography.h4, flex: 1 },
  macroUnit: { ...typography.caption },
  favRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  favLabel: { ...typography.body },
  logBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  logBtnText: { color: '#fff', ...typography.h4, fontWeight: '700' },
  favCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  favCardName: { ...typography.body, fontWeight: '500' },
  favCardPortion: { ...typography.caption, marginTop: 2 },
  favCardCal: { ...typography.body, fontWeight: '700' },
});
