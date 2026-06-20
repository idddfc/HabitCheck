// HabitCheck 类型定义
// 参见 docs/tech-spec.md 中的数据模型说明

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  repeatType: 'daily' | 'weekdays' | 'custom';
  repeatDays: number[]; // 0=Sun ~ 6=Sat
  reminderTime: string | null; // "HH:mm" or null
  archived: boolean;
  createdAt: string; // ISO 8601
}

export interface CheckIn {
  id: string;
  habitId: string;
  date: string; // "YYYY-MM-DD"
  completedAt: string; // ISO 8601
}

/** 今日任务（Habit + 当日完成状态 + streak） */
export interface HabitWithStatus extends Habit {
  isCompleted: boolean;
  streak: number;
}
