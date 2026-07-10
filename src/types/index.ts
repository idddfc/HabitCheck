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

// ====== 番茄钟 v1.1.0 ======

export interface PomodoroSettings {
  workDuration: number;       // 工作时长（分钟），默认 25
  breakDuration: number;      // 短休时长（分钟），默认 5
  longBreakDuration: number;  // 长休时长（分钟），默认 15
  sessionsBeforeLongBreak: number; // 几个番茄后长休，默认 4
}

export interface PomodoroRecord {
  id: string;
  date: string;              // "YYYY-MM-DD"
  completedCount: number;    // 当天完成的番茄数
}

// ====== 日程事件 v1.1.0 ======

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string;              // "YYYY-MM-DD"
  time: string;              // "HH:mm"
  note?: string;
  remindBefore?: number;     // 提前多少分钟提醒，默认 0（准时）
  createdAt: string;         // ISO 8601
}
