// 统计 Tab — 每任务统计 + 鼓励文案

import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../theme';
import { useStats } from '../hooks/useStats';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { stats, overallRate, encouragement, refresh } = useStats();

  useFocusEffect(
    useCallback(() => { refresh(); }, []),
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={stats}
        keyExtractor={(item) => item.habit.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.encourageBox}>
            <Text style={styles.encourageEmoji}>
              {overallRate >= 0.8 ? '🎉' : overallRate >= 0.5 ? '💪' : '🌱'}
            </Text>
            <Text style={styles.encourageText}>{encouragement}</Text>
            <Text style={styles.encourageSub}>
              本周完成率 {Math.round(overallRate * 100)}%
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>还没有习惯数据</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.emoji}>{item.habit.emoji}</Text>
              <Text style={styles.name}>{item.habit.name}</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.streak}</Text>
                <Text style={styles.statLabel}>当前连续</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.longestStreak}</Text>
                <Text style={styles.statLabel}>最长连续</Text>
              </View>
            </View>

            <View style={styles.barContainer}>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.round(item.weeklyRate * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>
                本周 {item.weeklyDone}/{item.weeklyTotal}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: spacing.xl },
  encourageBox: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  encourageEmoji: { fontSize: 48, marginBottom: spacing.sm },
  encourageText: {
    fontSize: fontSizes.h2,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  encourageSub: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: fontSizes.body, color: colors.textSecondary },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emoji: { fontSize: 24, marginRight: spacing.sm },
  name: { fontSize: fontSizes.body, fontWeight: '600', color: colors.textPrimary },
  statsRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.md },
  statItem: {},
  statValue: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: fontSizes.small, color: colors.textSecondary, marginTop: 2 },
  barContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  barBg: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, backgroundColor: colors.primary },
  barLabel: { fontSize: fontSizes.small, color: colors.textSecondary, width: 50, textAlign: 'right' },
});
