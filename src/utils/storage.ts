// expo-file-system 数据访问层（惰性初始化）
// 避免在模块顶层访问 Paths.document 导致原生模块未就绪

import { Paths, Directory, File } from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import { Habit, CheckIn } from '../types';
import { cancelNotification } from './notifications';

// --- 惰性获取数据目录和文件 ---
let _dataDir: Directory | null = null;
let _habitsFile: File | null = null;
let _checkinsFile: File | null = null;
let _initFile: File | null = null;

function dataDir(): Directory {
  if (!_dataDir) _dataDir = new Directory(Paths.document, 'habitcheck');
  return _dataDir;
}
function habitsFile(): File {
  if (!_habitsFile) _habitsFile = new File(dataDir(), 'habits.json');
  return _habitsFile;
}
function checkinsFile(): File {
  if (!_checkinsFile) _checkinsFile = new File(dataDir(), 'checkins.json');
  return _checkinsFile;
}
function initFile(): File {
  if (!_initFile) _initFile = new File(dataDir(), 'initialized');
  return _initFile;
}

function ensureDir(): void {
  const dir = dataDir();
  if (!dir.exists) dir.create();
}

// --- JSON 读写 ---
function readJSON<T>(file: File, fallback: T): T {
  try {
    if (!file.exists) return fallback;
    const text = file.textSync();
    return text ? (JSON.parse(text) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(file: File, data: T): void {
  try {
    if (!file.exists) file.create();
    file.write(JSON.stringify(data));
  } catch {
    file.create();
    file.write(JSON.stringify(data));
  }
}

// --- 工具 ---
export function getToday(): string {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

// --- 初始化 ---
export function initStorage(): void {
  ensureDir();
  if (initFile().exists) return;

  const sample: Habit[] = [
    { id: randomUUID(), name: '晨跑', emoji: '🏃', color: '#4ECDC4', repeatType: 'daily', repeatDays: [], reminderTime: '07:00', archived: false, createdAt: new Date().toISOString() },
    { id: randomUUID(), name: '阅读', emoji: '📖', color: '#45B7D1', repeatType: 'daily', repeatDays: [], reminderTime: '21:00', archived: false, createdAt: new Date().toISOString() },
    { id: randomUUID(), name: '冥想', emoji: '🧘', color: '#DDA0DD', repeatType: 'weekdays', repeatDays: [], reminderTime: '08:00', archived: false, createdAt: new Date().toISOString() },
  ];
  writeJSON(habitsFile(), sample);
  writeJSON(checkinsFile(), []);
  initFile().create();
}

// --- Habits CRUD ---
export function getHabits(includeArchived = false): Habit[] {
  ensureDir();
  const habits = readJSON<Habit[]>(habitsFile(), []);
  return includeArchived ? habits : habits.filter(h => !h.archived);
}

export function addHabit(habit: Omit<Habit, 'id' | 'archived' | 'createdAt'>): Habit {
  const h: Habit = { ...habit, id: randomUUID(), archived: false, createdAt: new Date().toISOString() };
  const all = getHabits(true);
  all.push(h);
  writeJSON(habitsFile(), all);
  return h;
}

export function updateHabit(id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>): Habit | null {
  const all = getHabits(true);
  const i = all.findIndex(h => h.id === id);
  if (i === -1) return null;
  all[i] = { ...all[i], ...updates };
  writeJSON(habitsFile(), all);
  return all[i];
}

export function deleteHabit(id: string): void {
  writeJSON(habitsFile(), getHabits(true).filter(h => h.id !== id));
  deleteCheckinsByHabitId(id);
  cancelNotification(id);
}

// --- CheckIns CRUD ---
export function getCheckins(habitId?: string, date?: string): CheckIn[] {
  ensureDir();
  let list = readJSON<CheckIn[]>(checkinsFile(), []);
  if (habitId) list = list.filter(c => c.habitId === habitId);
  if (date) list = list.filter(c => c.date === date);
  return list;
}

export function addCheckin(habitId: string, date?: string): CheckIn | null {
  const targetDate = date || getToday();
  if (getCheckins(habitId, targetDate).length > 0) return null;
  const c: CheckIn = { id: randomUUID(), habitId, date: targetDate, completedAt: new Date().toISOString() };
  const all = getCheckins();
  all.push(c);
  writeJSON(checkinsFile(), all);
  return c;
}

export function deleteCheckinsByHabitId(habitId: string): void {
  writeJSON(checkinsFile(), getCheckins().filter(c => c.habitId !== habitId));
}

export function getAllCheckins(): CheckIn[] {
  return getCheckins();
}
