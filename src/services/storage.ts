import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, DailyLog, FavoriteFood, AppSettings, FoodItem, MealType, RecentFood } from '../types';
import { getTodayDate } from '../utils/helpers';

// Storage keys — centralised so swapping to a DB only means changing this file
const KEYS = {
  USER_PROFILE: '@caltrack/user_profile',
  DAILY_LOG_PREFIX: '@caltrack/daily_log/',
  FAVORITES: '@caltrack/favorites',
  RECENT_FOODS: '@caltrack/recent_foods',
  SETTINGS: '@caltrack/settings',
  ALL_LOG_DATES: '@caltrack/all_log_dates',
};

// ─── Recent Foods ─────────────────────────────────────────────────────────────

const MAX_RECENT = 15;

export const getRecentFoods = async (): Promise<RecentFood[]> => {
  const raw = await AsyncStorage.getItem(KEYS.RECENT_FOODS);
  return raw ? JSON.parse(raw) : [];
};

export const trackRecentFood = async (food: Omit<RecentFood, 'id' | 'loggedAt'>): Promise<void> => {
  const recents = await getRecentFoods();
  // Remove duplicate by name (case-insensitive) and prepend new entry
  const filtered = recents.filter(
    (r) => r.name.toLowerCase() !== food.name.toLowerCase()
  );
  const newEntry: RecentFood = {
    ...food,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    loggedAt: new Date().toISOString(),
  };
  const updated = [newEntry, ...filtered].slice(0, MAX_RECENT);
  await AsyncStorage.setItem(KEYS.RECENT_FOODS, JSON.stringify(updated));
};

// ─── User Profile ─────────────────────────────────────────────────────────────

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  return raw ? JSON.parse(raw) : null;
};

// ─── App Settings ─────────────────────────────────────────────────────────────

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

export const getSettings = async (): Promise<AppSettings> => {
  const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
  return raw
    ? JSON.parse(raw)
    : { themeMode: 'light', onboardingCompleted: false };
};

// ─── Daily Log ────────────────────────────────────────────────────────────────

const buildEmptyDailyLog = (date: string): DailyLog => ({
  date,
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
  totalCalories: 0,
  totalProtein: 0,
  totalCarbs: 0,
  totalFat: 0,
});

const recalculateTotals = (log: DailyLog): DailyLog => {
  const allFoods = [...log.breakfast, ...log.lunch, ...log.dinner, ...log.snacks];
  return {
    ...log,
    totalCalories: allFoods.reduce((s, f) => s + f.calories, 0),
    totalProtein: allFoods.reduce((s, f) => s + f.proteinG, 0),
    totalCarbs: allFoods.reduce((s, f) => s + f.carbsG, 0),
    totalFat: allFoods.reduce((s, f) => s + f.fatG, 0),
  };
};

export const getDailyLog = async (date: string): Promise<DailyLog> => {
  const raw = await AsyncStorage.getItem(`${KEYS.DAILY_LOG_PREFIX}${date}`);
  return raw ? JSON.parse(raw) : buildEmptyDailyLog(date);
};

export const saveDailyLog = async (log: DailyLog): Promise<void> => {
  const updated = recalculateTotals(log);
  await AsyncStorage.setItem(
    `${KEYS.DAILY_LOG_PREFIX}${log.date}`,
    JSON.stringify(updated)
  );
  // Track all dates for history
  await _trackDate(log.date);
};

export const addFoodToLog = async (
  date: string,
  food: FoodItem,
  mealType: MealType
): Promise<DailyLog> => {
  const log = await getDailyLog(date);
  log[mealType] = [...log[mealType], food];
  const updated = recalculateTotals(log);
  await saveDailyLog(updated);
  return updated;
};

export const removeFoodFromLog = async (
  date: string,
  foodId: string,
  mealType: MealType
): Promise<DailyLog> => {
  const log = await getDailyLog(date);
  log[mealType] = log[mealType].filter((f) => f.id !== foodId);
  const updated = recalculateTotals(log);
  await saveDailyLog(updated);
  return updated;
};

export const updateFoodInLog = async (
  date: string,
  foodId: string,
  mealType: MealType,
  updatedFood: Partial<FoodItem>
): Promise<DailyLog> => {
  const log = await getDailyLog(date);
  log[mealType] = log[mealType].map((f) =>
    f.id === foodId ? { ...f, ...updatedFood } : f
  );
  const updated = recalculateTotals(log);
  await saveDailyLog(updated);
  return updated;
};

// ─── History ─────────────────────────────────────────────────────────────────

const _trackDate = async (date: string): Promise<void> => {
  const raw = await AsyncStorage.getItem(KEYS.ALL_LOG_DATES);
  const dates: string[] = raw ? JSON.parse(raw) : [];
  if (!dates.includes(date)) {
    dates.push(date);
    dates.sort().reverse(); // newest first
    await AsyncStorage.setItem(KEYS.ALL_LOG_DATES, JSON.stringify(dates));
  }
};

export const getAllLogDates = async (): Promise<string[]> => {
  const raw = await AsyncStorage.getItem(KEYS.ALL_LOG_DATES);
  return raw ? JSON.parse(raw) : [];
};

export const getAllDailyLogs = async (): Promise<DailyLog[]> => {
  const dates = await getAllLogDates();
  const logs = await Promise.all(dates.map((d) => getDailyLog(d)));
  return logs;
};

// ─── Favorite Foods ───────────────────────────────────────────────────────────

export const getFavorites = async (): Promise<FavoriteFood[]> => {
  const raw = await AsyncStorage.getItem(KEYS.FAVORITES);
  return raw ? JSON.parse(raw) : [];
};

export const saveFavorite = async (food: Omit<FavoriteFood, 'timesUsed' | 'createdAt'>): Promise<void> => {
  const favorites = await getFavorites();
  const existing = favorites.find((f) => f.id === food.id);
  if (existing) {
    existing.timesUsed += 1;
  } else {
    favorites.push({ ...food, timesUsed: 1, createdAt: new Date().toISOString() });
  }
  await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
};

export const removeFavorite = async (id: string): Promise<void> => {
  const favorites = await getFavorites();
  const updated = favorites.filter((f) => f.id !== id);
  await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(updated));
};

export const isFavorite = async (name: string): Promise<boolean> => {
  const favorites = await getFavorites();
  return favorites.some((f) => f.name.toLowerCase() === name.toLowerCase());
};
