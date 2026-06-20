// 今日任务数据 Hook
// 从 storage 加载数据，通过 streak 工具计算今日任务

import { useState, useEffect, useCallback } from 'react';
import { getHabits, getAllCheckins, addCheckin } from '../utils/storage';
import { getTodayHabits, getTodayCompletion } from '../utils/streak';
import type { HabitWithStatus } from '../types';

interface UseTodayHabitsReturn {
  habits: HabitWithStatus[];
  completed: number;
  total: number;
  loading: boolean;
  checkIn: (habitId: string) => void;
  refresh: () => void;
}

export function useTodayHabits(): UseTodayHabitsReturn {
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // 从 storage 加载并计算今日数据
  const loadData = useCallback(() => {
    const allHabits = getHabits();
    const allCheckins = getAllCheckins();

    const todayHabits = getTodayHabits(allHabits, allCheckins);
    const { completed: done, total: all } = getTodayCompletion(allHabits, allCheckins);

    setHabits(todayHabits);
    setCompleted(done);
    setTotal(all);
    setLoading(false);
  }, []);

  // 初次加载
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 打卡操作：写入 storage 后刷新 UI
  const checkIn = useCallback((habitId: string) => {
    addCheckin(habitId);
    loadData();
  }, [loadData]);

  return { habits, completed, total, loading, checkIn, refresh: loadData };
}
