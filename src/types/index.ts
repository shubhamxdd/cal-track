export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose' | 'maintain' | 'gain';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export type ThemeMode = 'light' | 'dark';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  goalWeightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  dailyCalorieTarget: number;
  dailyProteinTarget: number; // grams
  dailyCarbsTarget: number;   // grams
  dailyFatTarget: number;     // grams
  createdAt: string;          // ISO timestamp
}

export interface FoodItem {
  id: string;
  name: string;
  portionDescription: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  mealType: MealType;
  loggedAt: string; // ISO timestamp
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  breakfast: FoodItem[];
  lunch: FoodItem[];
  dinner: FoodItem[];
  snacks: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface FavoriteFood {
  id: string;
  name: string;
  portionDescription: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  timesUsed: number;
  createdAt: string;
}

export interface GeminiNutritionResponse {
  foodName: string;
  portionDescription: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface AppSettings {
  themeMode: ThemeMode;
  onboardingCompleted: boolean;
}
