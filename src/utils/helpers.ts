import { format, parseISO, isToday, isYesterday } from 'date-fns';

export const formatDate = (dateStr: string): string => {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEE, dd MMM');
};

export const formatDateFull = (dateStr: string): string => {
  return format(parseISO(dateStr), 'EEEE, dd MMMM yyyy');
};

export const getTodayDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const formatCalories = (cal: number): string => {
  return Math.round(cal).toLocaleString();
};

export const formatMacro = (grams: number): string => {
  return `${Math.round(grams)}g`;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getMealTypeLabel = (mealType: string): string => {
  const labels: Record<string, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snacks: 'Snacks',
  };
  return labels[mealType] || mealType;
};

export const getMealTypeEmoji = (mealType: string): string => {
  const emojis: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snacks: '🍎',
  };
  return emojis[mealType] || '🍽️';
};

export const getActivityLevelLabel = (level: string): string => {
  const labels: Record<string, string> = {
    sedentary: 'Sedentary (little/no exercise)',
    light: 'Light (1-3 days/week)',
    moderate: 'Moderate (3-5 days/week)',
    active: 'Active (6-7 days/week)',
    very_active: 'Very Active (twice/day)',
  };
  return labels[level] || level;
};

export const getGoalLabel = (goal: string): string => {
  const labels: Record<string, string> = {
    lose: 'Lose Weight',
    maintain: 'Maintain Weight',
    gain: 'Build Muscle',
  };
  return labels[goal] || goal;
};
