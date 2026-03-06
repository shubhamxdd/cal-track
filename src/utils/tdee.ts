import { Gender, ActivityLevel, Goal, UserProfile } from '../types';

/**
 * Mifflin-St Jeor BMR equation
 */
function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export interface TDEEResult {
  tdee: number;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatTarget: number;
}

export function calculateTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  goal: Goal
): TDEEResult {
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
  const dailyCalorieTarget = Math.max(1200, tdee + GOAL_ADJUSTMENTS[goal]);

  // Macro split: 30% protein, 45% carbs, 25% fat
  const dailyProteinTarget = Math.round((dailyCalorieTarget * 0.30) / 4);
  const dailyCarbsTarget = Math.round((dailyCalorieTarget * 0.45) / 4);
  const dailyFatTarget = Math.round((dailyCalorieTarget * 0.25) / 9);

  return {
    tdee,
    dailyCalorieTarget,
    dailyProteinTarget,
    dailyCarbsTarget,
    dailyFatTarget,
  };
}
