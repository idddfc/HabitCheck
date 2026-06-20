// 统计数据 Hook

import { useState, useEffect, useCallback } from 'react';
import { getHabits, getAllCheckins } from '../utils/storage';
import { getStreak, getLongestStreak, getWeeklyCompletion, getEncouragement } from '../utils/streak';
import type { Habit } from '../types';

export interface HabitStat {
  habit: Habit;
  streak: number;
  longestStreak: number;
  weeklyDone: number;
  weeklyTotal: number;
  weeklyRate: number; // 0-1
}

export function useStats() {
  const [stats, setStats] = useState<HabitStat[]>([]);
  const [overallRate, setOverallRate] = useState(0);
  const [encouragement, setEncouragement] = useState('');

  const loadStats = useCallback(() => {
    const habits = getHabits(); // 仅活跃
    const checkins = getAllCheckins();

    const statList: HabitStat[] = habits.map((habit) => {
      const streak = getStreak(checkins, habit.id);
      const longestStreak = getLongestStreak(checkins, habit.id);
      const weekData = getWeeklyCompletion(habits, checkins);
      const wk = weekData.get(habit.id) || { done: 0, total: 0, rate: 0 };

      return {
        habit,
        streak,
        longestStreak,
        weeklyDone: wk.done,
        weeklyTotal: wk.total,
        weeklyRate: wk.rate,
      };
    });

    // 全局完成率
    let totalDone = 0;
    let totalAll = 0;
    for (const s of statList) {
      totalDone += s.weeklyDone;
      totalAll += s.weeklyTotal;
    }
    const rate = totalAll > 0 ? totalDone / totalAll : 0;

    setStats(statList);
    setOverallRate(rate);
    setEncouragement(getEncouragement(rate));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, overallRate, encouragement, refresh: loadStats };
}
