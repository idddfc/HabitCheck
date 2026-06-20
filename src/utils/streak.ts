// Streak 计算 & 任务过滤 & 完成率
// 纯函数，不依赖任何 React / UI

import { Habit, CheckIn, HabitWithStatus } from '../types';
import { getToday } from './storage';

// --- 日期工具 ---

/** 获取星期几, 0=Sun, 1=Mon, ..., 6=Sat */
function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/** 获取指定日期的 YYYY-MM-DD 字符串 */
function formatDate(date: Date): string {
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/** 解析 YYYY-MM-DD 为 Date */
function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 日期加减天数 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// --- 任务过滤 ---

/**
 * 判断某个习惯在指定日期是否需要打卡
 */
export function isHabitDueOn(habit: Habit, date: Date): boolean {
  if (habit.archived) return false;

  const dow = getDayOfWeek(date);

  switch (habit.repeatType) {
    case 'daily':
      return true;
    case 'weekdays':
      return dow >= 1 && dow <= 5; // Mon-Fri
    case 'custom':
      return habit.repeatDays.includes(dow);
    default:
      return false;
  }
}

/**
 * 获取今日任务列表（含完成状态和 streak）
 * @param habits 所有活跃习惯
 * @param checkins 全部打卡记录
 * @param date 目标日期，默认今天
 */
export function getTodayHabits(
  habits: Habit[],
  checkins: CheckIn[],
  date?: Date,
): HabitWithStatus[] {
  const targetDate = date ?? new Date();
  const dateStr = formatDate(targetDate);

  // 该日期的打卡集合
  const todayCheckinSet = new Set(
    checkins.filter((c) => c.date === dateStr).map((c) => c.habitId),
  );

  const result: HabitWithStatus[] = [];

  for (const habit of habits) {
    if (!isHabitDueOn(habit, targetDate)) continue;

    const isCompleted = todayCheckinSet.has(habit.id);
    const streak = getStreak(checkins, habit.id, targetDate);

    result.push({ ...habit, isCompleted, streak });
  }

  // 排序：未完成在上，已完成在下
  result.sort((a, b) => {
    if (a.isCompleted === b.isCompleted) return 0;
    return a.isCompleted ? 1 : -1;
  });

  return result;
}

// --- Streak 计算 ---

/**
 * 计算当前连续打卡天数（从指定日期往回数）
 * @param checkins 该习惯的全部打卡记录
 * @param habitId 习惯 ID
 * @param date 截至日期，默认今天
 */
export function getStreak(
  checkins: CheckIn[],
  habitId: string,
  date?: Date,
): number {
  const endDate = date ?? new Date();
  const habitCheckins = checkins.filter((c) => c.habitId === habitId);
  const dateSet = new Set(habitCheckins.map((c) => c.date));

  let streak = 0;
  let current = endDate;

  // 检查今天是否打卡——如果没打，从昨天开始算
  const todayStr = formatDate(current);
  if (!dateSet.has(todayStr)) {
    current = addDays(current, -1);
  }

  // 往回数连续天数
  while (dateSet.has(formatDate(current))) {
    streak++;
    current = addDays(current, -1);
  }

  return streak;
}

/**
 * 计算历史最长连续打卡天数
 */
export function getLongestStreak(
  checkins: CheckIn[],
  habitId: string,
): number {
  const habitCheckins = checkins
    .filter((c) => c.habitId === habitId)
    .map((c) => c.date)
    .sort();

  if (habitCheckins.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < habitCheckins.length; i++) {
    const prev = parseDate(habitCheckins[i - 1]);
    const curr = parseDate(habitCheckins[i]);
    const diffDays =
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      current++;
    } else if (diffDays > 1) {
      longest = Math.max(longest, current);
      current = 1;
    }
    // diffDays === 0 表示同一天多次打卡（不计数）
  }

  return Math.max(longest, current);
}

// --- 完成率 ---

/**
 * 计算今日完成情况
 * @returns { completed, total, habits }
 */
export function getTodayCompletion(
  habits: Habit[],
  checkins: CheckIn[],
): { completed: number; total: number } {
  const todayHabits = getTodayHabits(habits, checkins);
  const completed = todayHabits.filter((h) => h.isCompleted).length;
  return { completed, total: todayHabits.length };
}

/**
 * 计算本周完成率
 * @returns { habitId: { done, total, rate } }
 */
export function getWeeklyCompletion(
  habits: Habit[],
  checkins: CheckIn[],
  date?: Date,
): Map<string, { done: number; total: number; rate: number }> {
  const targetDate = date ?? new Date();
  const dow = getDayOfWeek(targetDate);

  // 本周一（以周一为一周开始）
  const monday = addDays(targetDate, -((dow + 6) % 7));

  const result = new Map<
    string,
    { done: number; total: number; rate: number }
  >();

  const activeHabits = habits.filter((h) => !h.archived);

  for (const habit of activeHabits) {
    let done = 0;
    let total = 0;

    for (let i = 0; i < 7; i++) {
      const day = addDays(monday, i);

      // 跳过未来日期
      if (day > targetDate) continue;

      if (!isHabitDueOn(habit, day)) continue;

      total++;
      const dateStr = formatDate(day);
      const hasCheckin = checkins.some(
        (c) => c.habitId === habit.id && c.date === dateStr,
      );
      if (hasCheckin) done++;
    }

    const rate = total > 0 ? done / total : 0;
    result.set(habit.id, { done, total, rate });
  }

  return result;
}

/**
 * 获取整体鼓励文案
 */
export function getEncouragement(rate: number): string {
  if (rate >= 0.8) return '🎉 太棒了，继续保持！';
  if (rate >= 0.5) return '💪 继续加油，你可以的！';
  return '🌱 今天开始也不晚！';
}
