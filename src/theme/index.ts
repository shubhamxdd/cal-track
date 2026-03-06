import { ThemeMode } from '../types';

export const colors = {
  primary: '#4CAF50',
  primaryDark: '#2E7D32',
  primaryLight: '#A5D6A7',
  primaryFaint: '#E8F5E9',

  accent: '#FF8F00',
  accentLight: '#FFE0B2',

  protein: '#42A5F5',
  carbs: '#FFA726',
  fat: '#EF5350',

  success: '#66BB6A',
  warning: '#FFA726',
  error: '#EF5350',

  light: {
    background: '#F4FAF4',
    surface: '#FFFFFF',
    surfaceSecondary: '#F0F7F0',
    border: '#D7ECD7',
    text: '#1B2E1C',
    textSecondary: '#4A6741',
    textMuted: '#8AAF87',
    card: '#FFFFFF',
    tabBar: '#FFFFFF',
  },
  dark: {
    background: '#0F1A10',
    surface: '#1A2E1B',
    surfaceSecondary: '#1F3520',
    border: '#2D4A2E',
    text: '#E8F5E9',
    textSecondary: '#A5D6A7',
    textMuted: '#5D8A5E',
    card: '#1A2E1B',
    tabBar: '#142015',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  h4: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyMd: { fontSize: 15, fontWeight: '400' as const },
  bodyLg: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.5 },
};

export const getThemeColors = (mode: ThemeMode) =>
  mode === 'dark' ? colors.dark : colors.light;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};
