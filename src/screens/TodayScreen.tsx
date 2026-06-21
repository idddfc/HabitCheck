// 今日 Tab — 第 6 步：FAB + 添加任务弹窗

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSizes, spacing } from '../theme';
import RingProgress from '../components/RingProgress';
import HabitCard from '../components/HabitCard';
import AddTaskSheet from '../components/AddTaskSheet';
import { useTodayHabits } from '../hooks/useTodayHabits';
import { updateHabit, deleteHabit } from '../utils/storage';
import { cancelNotification } from '../utils/notifications';

export default function TodayScreen() {
  const { habits, completed, total, loading, checkIn, refresh } = useTodayHabits();
  const insets = useSafeAreaInsets();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editHabit, setEditHabit] = useState<typeof habits[number] | undefined>(undefined);
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  // 每次切到此 Tab 时刷新数据
  useFocusEffect(
    useCallback(() => { refresh(); }, [refresh]),
  );

  const handleCloseAll = () => setOpenCardId(null);

  const handleEdit = (habit: typeof habits[number]) => {
    setEditHabit(habit);
  };

  const closeSheet = () => {
    setShowAddSheet(false);
    setEditHabit(undefined);
  };

  const handleArchive = (habitId: string) => {
    updateHabit(habitId, { archived: true });
    cancelNotification(habitId);
    refresh();
  };
  const handleDelete = (habitId: string) => {
    deleteHabit(habitId);
    cancelNotification(habitId);
    refresh();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        onTouchStart={handleCloseAll}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <RingProgress completed={completed} total={total} />
            <Text style={styles.headerTitle}>今日任务</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>今天没有任务，去添加一个吧</Text>
          </View>
        }
        renderItem={({ item }) => (
          <HabitCard habit={item} onCheckIn={checkIn} onEdit={handleEdit} onArchive={handleArchive} onDelete={handleDelete}
            isOpen={openCardId === item.id}
            onOpenChange={(open) => setOpenCardId(open ? item.id : null)}
          />
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddSheet(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* 添加/编辑任务弹窗 */}
      <AddTaskSheet
        visible={showAddSheet || !!editHabit}
        onClose={closeSheet}
        onSaved={refresh}
        editHabit={editHabit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSizes.h2,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 30,
  },
});
