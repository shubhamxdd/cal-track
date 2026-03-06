import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography } from '../theme';
import { useApp } from '../context/AppContext';

interface CalorieRingProps {
  consumed: number;
  target: number;
  radius?: number;
  strokeWidth?: number;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  consumed,
  target,
  radius = 80,
  strokeWidth = 14,
}) => {
  const { state } = useApp();
  const theme = state.settings.themeMode === 'dark' ? colors.dark : colors.light;

  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(consumed / target, 1);
  const isOver = consumed > target;
  const remaining = target - consumed;

  const strokeDashoffset = circumference * (1 - progress);
  const strokeColor = isOver ? colors.error : colors.primary;

  const size = (radius + strokeWidth) * 2;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={[styles.centerContent, { width: size, height: size }]}>
        <Text style={[styles.mainValue, { color: theme.text }]}>
          {Math.round(consumed).toLocaleString()}
        </Text>
        <Text style={[styles.unitLabel, { color: theme.textMuted }]}>kcal eaten</Text>
        <View style={styles.divider} />
        <Text
          style={[
            styles.remainingValue,
            { color: isOver ? colors.error : colors.primary },
          ]}
        >
          {isOver ? '+' : ''}{Math.abs(Math.round(remaining)).toLocaleString()}
        </Text>
        <Text style={[styles.remainingLabel, { color: theme.textMuted }]}>
          {isOver ? 'over goal' : 'remaining'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainValue: {
    ...typography.h2,
    fontSize: 26,
  },
  unitLabel: {
    ...typography.caption,
    marginTop: 2,
  },
  divider: {
    width: 30,
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 6,
  },
  remainingValue: {
    ...typography.h4,
    fontWeight: '700',
  },
  remainingLabel: {
    ...typography.caption,
  },
});
