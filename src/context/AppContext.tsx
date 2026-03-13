import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { UserProfile, DailyLog, FavoriteFood, AppSettings, FoodItem, MealType, RecentFood } from '../types';
import * as storage from '../services/storage';
import { getTodayDate, generateId } from '../utils/helpers';

// ─── State ────────────────────────────────────────────────────────────────────

interface AppState {
  settings: AppSettings;
  userProfile: UserProfile | null;
  todayLog: DailyLog | null;
  favorites: FavoriteFood[];
  recentFoods: RecentFood[];
  isLoading: boolean;
}

const initialState: AppState = {
  settings: { themeMode: 'light', onboardingCompleted: false },
  userProfile: null,
  todayLog: null,
  favorites: [],
  recentFoods: [],
  isLoading: true,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'SET_USER_PROFILE'; payload: UserProfile }
  | { type: 'SET_TODAY_LOG'; payload: DailyLog }
  | { type: 'SET_FAVORITES'; payload: FavoriteFood[] }
  | { type: 'SET_RECENT_FOODS'; payload: RecentFood[] }
  | { type: 'COMPLETE_ONBOARDING' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload };
    case 'SET_TODAY_LOG':
      return { ...state, todayLog: action.payload };
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    case 'SET_RECENT_FOODS':
      return { ...state, recentFoods: action.payload };
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        settings: { ...state.settings, onboardingCompleted: true },
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Helper actions
  saveProfile: (profile: UserProfile) => Promise<void>;
  toggleTheme: () => Promise<void>;
  logFood: (food: Omit<FoodItem, 'id' | 'loggedAt' | 'mealType'>, mealType: MealType) => Promise<void>;
  updateLoggedFood: (foodId: string, mealType: MealType, updatedFood: Partial<FoodItem>) => Promise<void>;
  removeFood: (foodId: string, mealType: MealType) => Promise<void>;
  refreshTodayLog: () => Promise<void>;
  refreshRecentFoods: () => Promise<void>;
  saveFavoriteFood: (food: Omit<FavoriteFood, 'timesUsed' | 'createdAt'>) => Promise<void>;
  removeFavoriteFood: (id: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load all data on startup
  useEffect(() => {
    const init = async () => {
      try {
        const [settings, profile, favorites, recent] = await Promise.all([
          storage.getSettings(),
          storage.getUserProfile(),
          storage.getFavorites(),
          storage.getRecentFoods(),
        ]);
        dispatch({ type: 'SET_SETTINGS', payload: settings });
        if (profile) dispatch({ type: 'SET_USER_PROFILE', payload: profile });
        dispatch({ type: 'SET_FAVORITES', payload: favorites });
        dispatch({ type: 'SET_RECENT_FOODS', payload: recent });

        const todayLog = await storage.getDailyLog(getTodayDate());
        dispatch({ type: 'SET_TODAY_LOG', payload: todayLog });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    init();
  }, []);

  const saveProfile = async (profile: UserProfile) => {
    await storage.saveUserProfile(profile);
    dispatch({ type: 'SET_USER_PROFILE', payload: profile });
  };

  const toggleTheme = async () => {
    const newMode = state.settings.themeMode === 'light' ? 'dark' : 'light';
    const newSettings = { ...state.settings, themeMode: newMode };
    await storage.saveSettings(newSettings as AppSettings);
    dispatch({ type: 'SET_SETTINGS', payload: newSettings as AppSettings });
  };

  const logFood = async (food: Omit<FoodItem, 'id' | 'loggedAt' | 'mealType'>, mealType: MealType) => {
    const fullFood: FoodItem = {
      ...food,
      id: generateId(),
      loggedAt: new Date().toISOString(),
      mealType,
    };
    const updated = await storage.addFoodToLog(getTodayDate(), fullFood, mealType);
    dispatch({ type: 'SET_TODAY_LOG', payload: updated });

    // Track as recent
    await storage.trackRecentFood({
      name: food.name,
      portionDescription: food.portionDescription,
      calories: food.calories,
      proteinG: food.proteinG,
      carbsG: food.carbsG,
      fatG: food.fatG,
    });
    const recent = await storage.getRecentFoods();
    dispatch({ type: 'SET_RECENT_FOODS', payload: recent });
  };

  const updateLoggedFood = async (foodId: string, mealType: MealType, updatedFood: Partial<FoodItem>) => {
    const updated = await storage.updateFoodInLog(getTodayDate(), foodId, mealType, updatedFood);
    dispatch({ type: 'SET_TODAY_LOG', payload: updated });
  };

  const removeFood = async (foodId: string, mealType: MealType) => {
    const updated = await storage.removeFoodFromLog(getTodayDate(), foodId, mealType);
    dispatch({ type: 'SET_TODAY_LOG', payload: updated });
  };

  const refreshTodayLog = async () => {
    const log = await storage.getDailyLog(getTodayDate());
    dispatch({ type: 'SET_TODAY_LOG', payload: log });
  };

  const refreshRecentFoods = async () => {
    const recent = await storage.getRecentFoods();
    dispatch({ type: 'SET_RECENT_FOODS', payload: recent });
  };

  const saveFavoriteFood = async (food: Omit<FavoriteFood, 'timesUsed' | 'createdAt'>) => {
    await storage.saveFavorite(food);
    const favorites = await storage.getFavorites();
    dispatch({ type: 'SET_FAVORITES', payload: favorites });
  };

  const removeFavoriteFood = async (id: string) => {
    await storage.removeFavorite(id);
    const favorites = await storage.getFavorites();
    dispatch({ type: 'SET_FAVORITES', payload: favorites });
  };

  const completeOnboarding = async () => {
    const newSettings = { ...state.settings, onboardingCompleted: true };
    await storage.saveSettings(newSettings);
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        saveProfile,
        toggleTheme,
        logFood,
        updateLoggedFood,
        removeFood,
        refreshTodayLog,
        refreshRecentFoods,
        saveFavoriteFood,
        removeFavoriteFood,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
