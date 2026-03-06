import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useApp } from '../context/AppContext';

interface MacroBadgeProps {
  protein: number;
  carbs: number;
  fat: number;
  target?: { protein: number; carbs: number; fat: number };
  size?: 'sm' | 'md';
}

export const MacroBadge: React.FC<MacroBadgeProps> = ({
  protein,
  carbs,
  fat,
  target,
  size = 'md',
}) => {
  const { state } = useApp();
  const theme = state.settings.themeMode === 'dark' ? colors.dark : colors.light;

  const macros = [
    { label: 'Protein', value: protein, color: colors.protein, target: target?.protein },
    { label: 'Carbs', value: carbs, color: colors.carbs, target: target?.carbs },
    { label: 'Fat', value: fat, color: colors.fat, target: target?.fat },
  ];

  return (
    <View style={styles.container}>
      {macros.map((m) => (
        <View key={m.label} style={styles.macroItem}>
          <View style={[styles.dot, { backgroundColor: m.color }]} />
          <View>
            <Text style={[styles.value, { color: theme.text }, size === 'sm' && styles.valueSm]}>
              {Math.round(m.value)}g
            </Text>
            {target && (
              <Text style={[styles.targetText, { color: theme.textMuted }]}>
                / {Math.round(m.target ?? 0)}g
              </Text>
            )}
            <Text style={[styles.label, { color: theme.textSecondary }]}>{m.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  value: {
    ...typography.h4,
    textAlign: 'center',
  },
  valueSm: {
    ...typography.body,
    fontWeight: '600',
  },
  targetText: {
    ...typography.caption,
    textAlign: 'center',
  },
  label: {
    ...typography.caption,
    textAlign: 'center',
  },
});
