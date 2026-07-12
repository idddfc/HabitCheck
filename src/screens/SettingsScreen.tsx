// 设置 Tab — 最终版

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Paths, Directory, File } from 'expo-file-system';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../theme';
import { getHabits, updateHabit } from '../utils/storage';
import type { Habit } from '../types';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([]);

  useFocusEffect(
    useCallback(() => {
      setArchivedHabits(getHabits(true).filter((h) => h.archived));
    }, []),
  );

  const handleRestore = (habit: Habit) => {
    updateHabit(habit.id, { archived: false });
    setArchivedHabits((prev) => prev.filter((h) => h.id !== habit.id));
  };

  const handleClearData = () => {
    Alert.alert('清除所有数据', '此操作将删除所有习惯和打卡记录，不可恢复。确定继续？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清除', style: 'destructive',
        onPress: () => {
          try {
            const dir = new Directory(Paths.document, 'habitcheck');
            if (dir.exists) dir.delete();
            // 重建 initialized 标记，防止下次启动重新写入示例数据
            dir.create();
            new File(dir, 'initialized').create();
          } catch {}
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 头部 */}
        <Text style={styles.appName}>HabitCheck</Text>
        <Text style={styles.version}>v1.0.0</Text>

        {/* 归档任务 */}
        <Text style={styles.sectionTitle}>已归档任务</Text>
        {archivedHabits.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>暂无已归档任务</Text>
          </View>
        ) : (
          archivedHabits.map((habit) => (
            <View key={habit.id} style={styles.card}>
              <Text style={styles.emoji}>{habit.emoji}</Text>
              <Text style={styles.name}>{habit.name}</Text>
              <TouchableOpacity style={styles.restoreBtn} onPress={() => handleRestore(habit)}>
                <Text style={styles.restoreText}>恢复</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <Text style={styles.hint}>归档后今日列表不显示，统计数据保留</Text>

        {/* 数据管理 */}
        <Text style={styles.sectionTitle}>数据管理</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
          <Text style={styles.dangerText}>清除所有数据</Text>
        </TouchableOpacity>

        {/* 关于 */}
        <Text style={styles.sectionTitle}>关于</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>
            HabitCheck 是一款简洁的每日打卡 App，帮助你追踪和养成好习惯。
          </Text>
          <Text style={styles.aboutMeta}>
            React Native + Expo  |  本地存储  |  无需网络
          </Text>
          <Text style={styles.aboutMeta}>
            开发者：idddfc、mangorange  |  https://github.com/idddfc/HabitCheck
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl * 2 },
  appName: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginTop: spacing.xl },
  version: { fontSize: fontSizes.small, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSizes.caption, fontWeight: '600', color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.cardBackground, borderRadius: borderRadius.md, padding: spacing.md,
    marginBottom: spacing.sm, ...shadows.card,
  },
  emptyText: { fontSize: fontSizes.body, color: colors.textSecondary, textAlign: 'center' },
  emoji: { fontSize: 22, marginRight: spacing.sm },
  name: { fontSize: fontSizes.body, color: colors.textPrimary },
  restoreBtn: { backgroundColor: colors.primary + '15', paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: borderRadius.sm, alignSelf: 'flex-start', marginTop: spacing.sm },
  restoreText: { fontSize: fontSizes.caption, color: colors.primary, fontWeight: '600' },
  hint: { fontSize: fontSizes.small, color: colors.textSecondary, marginTop: spacing.xs },
  dangerBtn: {
    backgroundColor: colors.cardBackground, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.danger, ...shadows.card,
  },
  dangerText: { fontSize: fontSizes.body, color: colors.danger, textAlign: 'center', fontWeight: '600' },
  aboutText: { fontSize: fontSizes.caption, color: colors.textSecondary, lineHeight: 20 },
  aboutMeta: { fontSize: fontSizes.small, color: colors.textSecondary, marginTop: spacing.sm },
});
