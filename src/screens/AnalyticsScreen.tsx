import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { VictoryPie, VictoryBar, VictoryChart, VictoryLine, VictoryAxis } from 'victory-native';
// Using victory-native v36 (react-native-svg renderer, no Skia required)
import { colors, spacing, borderRadius, typography, shadows, getThemeColors } from '../theme';
import { useApp } from '../context/AppContext';
import { getAllDailyLogs } from '../services/storage';
import { DailyLog } from '../types';
import { format, parseISO, subDays } from 'date-fns';
import { getTodayDate } from '../utils/helpers';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - spacing.md * 2 - spacing.md * 2;

export const AnalyticsScreen: React.FC = () => {
  const { state } = useApp();
  const theme = getThemeColors(state.settings.themeMode);
  const { userProfile, todayLog } = state;
  const [historicalLogs, setHistoricalLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    getAllDailyLogs().then(setHistoricalLogs);
  }, []);

  const todayProtein = todayLog?.totalProtein ?? 0;
  const todayCarbs = todayLog?.totalCarbs ?? 0;
  const todayFat = todayLog?.totalFat ?? 0;
  const totalMacroGrams = todayProtein + todayCarbs + todayFat;

  const pieData = totalMacroGrams > 0 ? [
    { x: 'Protein', y: Math.round(todayProtein), color: colors.protein },
    { x: 'Carbs', y: Math.round(todayCarbs), color: colors.carbs },
    { x: 'Fat', y: Math.round(todayFat), color: colors.fat },
  ] : [
    { x: 'No data', y: 1, color: theme.border },
  ];

  // Last 7 days bar chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const log = historicalLogs.find((l) => l.date === date);
    return {
      x: format(parseISO(date), 'EEE'),
      y: Math.round(log?.totalCalories ?? 0),
      date,
    };
  });

  const calorieTarget = userProfile?.dailyCalorieTarget ?? 2000;

  // Streak calculation
  const streak = (() => {
    let count = 0;
    let d = new Date();
    while (true) {
      const dateStr = format(d, 'yyyy-MM-dd');
      const log = historicalLogs.find((l) => l.date === dateStr);
      if (log && log.totalCalories > 0) {
        count++;
        d = subDays(d, 1);
      } else break;
    }
    return count;
  })();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Analytics</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Streak 🔥', value: `${streak} days` },
            { label: 'Days Logged', value: `${historicalLogs.filter(l => l.totalCalories > 0).length}` },
            { label: 'Today', value: `${Math.round(todayLog?.totalCalories ?? 0)} kcal` },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: theme.surface }, shadows.sm]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Today's Macro Pie */}
        <View style={[styles.chartCard, { backgroundColor: theme.surface }, shadows.md]}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>Today's Macros</Text>
          {totalMacroGrams > 0 ? (
            <>
              <VictoryPie
                data={pieData}
                colorScale={pieData.map((d) => d.color)}
                width={CHART_WIDTH}
                height={220}
                innerRadius={55}
                labelRadius={90}
                style={{
                  labels: { fill: theme.text, fontSize: 10, fontWeight: '600' as const },
                }}
                labels={({ datum }: { datum: any }) => `${datum.x}\n${datum.y}g`}
              />
              {/* Legend */}
              <View style={styles.pieLegend}>
                {[
                  { label: `Protein  ${Math.round(todayProtein)}g`, color: colors.protein },
                  { label: `Carbs  ${Math.round(todayCarbs)}g`, color: colors.carbs },
                  { label: `Fat  ${Math.round(todayFat)}g`, color: colors.fat },
                ].map((item) => (
                  <View key={item.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.legendText, { color: theme.textSecondary }]}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                Log food today to see your macro breakdown
              </Text>
            </View>
          )}
        </View>

        {/* Weekly Calories Bar Chart */}
        <View style={[styles.chartCard, { backgroundColor: theme.surface }, shadows.md]}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>Last 7 Days — Calories</Text>
          <VictoryChart
            width={CHART_WIDTH}
            height={200}
            domainPadding={{ x: 20 }}
            padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
          >
            <VictoryAxis
              style={{
                tickLabels: { fill: theme.textSecondary, fontSize: 10 },
                axis: { stroke: theme.border },
                grid: { stroke: 'transparent' },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                tickLabels: { fill: theme.textSecondary, fontSize: 10 },
                axis: { stroke: theme.border },
                grid: { stroke: theme.border, strokeDasharray: '4,4' },
              }}
            />
            <VictoryBar
              data={last7Days}
              style={{
                data: {
                  fill: ({ datum }: any) =>
                    datum.y > calorieTarget ? colors.error : colors.primary,
                },
              }}
            />
            {/* Target line */}
            <VictoryLine
              data={last7Days.map((d) => ({ x: d.x, y: calorieTarget }))}
              style={{
                data: { stroke: colors.accent, strokeDasharray: '6,3', strokeWidth: 1.5 },
              }}
            />
          </VictoryChart>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>Calories consumed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendLine, { backgroundColor: colors.accent }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>Daily target</Text>
            </View>
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: spacing.md },
  screenTitle: { ...typography.h2, marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statValue: { ...typography.h3, fontWeight: '700' },
  statLabel: { ...typography.caption, textAlign: 'center', marginTop: 2 },
  chartCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  chartTitle: { ...typography.h4, alignSelf: 'flex-start', marginBottom: spacing.sm },
  pieLegend: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  chartLegend: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLine: { width: 16, height: 2, borderRadius: 1 },
  legendText: { ...typography.caption },
  emptyChart: { height: 160, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.body, textAlign: 'center', fontStyle: 'italic', maxWidth: 220 },
});
