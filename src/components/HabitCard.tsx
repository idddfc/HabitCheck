// 任务卡片 — 左滑操作（归档/删除）+ 打卡动画 + 震动

import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, PanResponder, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../theme';
import type { HabitWithStatus } from '../types';

const SWIPE_THRESHOLD = -60;
const ACTION_WIDTH = 140;

interface HabitCardProps {
  habit: HabitWithStatus;
  onCheckIn: (habitId: string) => void;
  onEdit: (habit: HabitWithStatus) => void;
  onArchive: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HabitCard({ habit, onCheckIn, onEdit, onArchive, onDelete, isOpen, onOpenChange }: HabitCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  // 打卡弹簧
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCompleted = useRef(habit.isCompleted);
  useEffect(() => {
    if (habit.isCompleted && !prevCompleted.current) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 0.85, stiffness: 400, damping: 8, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, stiffness: 400, damping: 12, useNativeDriver: true }),
      ]).start();
    }
    prevCompleted.current = habit.isCompleted;
  }, [habit.isCompleted, scaleAnim]);

  // 监听 isOpen 变化
  useEffect(() => {
    Animated.spring(translateX, {
      toValue: isOpen ? -ACTION_WIDTH : 0,
      stiffness: 300,
      damping: 30,
      useNativeDriver: true,
    }).start();
  }, [isOpen, translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
      onPanResponderMove: (_, gs) => {
        const offset = isOpen ? ACTION_WIDTH : 0;
        translateX.setValue(Math.min(0, Math.max(-ACTION_WIDTH, gs.dx + offset)));
      },
      onPanResponderRelease: (_, gs) => {
        const totalMove = Math.abs(gs.dx) + Math.abs(gs.dy);
        // 几乎没移动 → 点击 → 打开编辑
        if (totalMove < 10 && !isOpen) {
          onEdit(habit);
          return;
        }
        if (gs.dx < SWIPE_THRESHOLD) {
          onOpenChange(true);
        } else if (gs.dx > 10) {
          onOpenChange(false);
        } else if (!isOpen) {
          onOpenChange(false);
        }
      },
    }),
  ).current;

  const handleCheckIn = () => {
    if (habit.isCompleted) return;
    if (isOpen) { onOpenChange(false); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCheckIn(habit.id);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.actions}>
        <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => { onOpenChange(false); onArchive(habit.id); }}>
          <Text style={styles.actionText}>归档</Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, { backgroundColor: colors.danger }]} onPress={() => { onOpenChange(false); onDelete(habit.id); }}>
          <Text style={styles.actionText}>删除</Text>
        </Pressable>
      </View>
      <Animated.View style={[styles.card, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        <Text style={styles.emoji}>{habit.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{habit.name}</Text>
          <Text style={styles.streak}>🔥 {habit.streak} 天连续</Text>
        </View>
        <AnimatedPressable
          style={[styles.checkButton, habit.isCompleted && styles.checkButtonDone, { transform: [{ scale: scaleAnim }] }]}
          onPress={handleCheckIn}
        >
          <Text style={styles.checkMark}>{habit.isCompleted ? '√' : '○'}</Text>
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderRadius: borderRadius.md, overflow: 'hidden' },
  actions: { position: 'absolute', right: 0, top: 0, bottom: 0, width: ACTION_WIDTH, flexDirection: 'row' },
  actionBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: '#FFFFFF', fontSize: fontSizes.caption, fontWeight: '600' },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.cardBackground, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, minHeight: 64,
    ...shadows.card,
  },
  emoji: { fontSize: 28, marginRight: spacing.md },
  info: { flex: 1 },
  name: { fontSize: fontSizes.body, fontWeight: '600', color: colors.textPrimary },
  streak: { fontSize: fontSizes.caption, color: colors.textSecondary, marginTop: 2 },
  checkButton: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkButtonDone: { backgroundColor: colors.success, borderColor: colors.success },
  checkMark: { fontSize: 18 },
});
