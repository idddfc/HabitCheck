// 番茄钟数据访问层
import { Paths, Directory, File } from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import { PomodoroSettings, PomodoroRecord } from '../types';
import { getToday } from './storage';

function dataDir(): Directory {
  const dir = new Directory(Paths.document, 'habitcheck');
  if (!dir.exists) dir.create();
  return dir;
}

function settingsFile(): File {
  const f = new File(dataDir(), 'pomodoro_settings.json');
  if (!f.exists) {
    f.create();
    f.write(JSON.stringify({ workDuration: 25, breakDuration: 5, longBreakDuration: 15, sessionsBeforeLongBreak: 4 }));
  }
  return f;
}

function recordsFile(): File {
  const f = new File(dataDir(), 'pomodoro_records.json');
  if (!f.exists) { f.create(); f.write('[]'); }
  return f;
}

function readJSON<T>(file: File, fallback: T): T {
  try {
    const text = file.textSync();
    return text ? (JSON.parse(text) as T) : fallback;
  } catch { return fallback; }
}

function writeJSON<T>(file: File, data: T): void {
  file.write(JSON.stringify(data));
}

export function getSettings(): PomodoroSettings {
  return readJSON<PomodoroSettings>(settingsFile(), { workDuration: 25, breakDuration: 5, longBreakDuration: 15, sessionsBeforeLongBreak: 4 });
}

export function saveSettings(s: PomodoroSettings): void {
  writeJSON(settingsFile(), s);
}

export function getTodayRecord(): PomodoroRecord | null {
  const today = getToday();
  const records = readJSON<PomodoroRecord[]>(recordsFile(), []);
  return records.find(r => r.date === today) || null;
}

export function incrementTodayRecord(): PomodoroRecord {
  const today = getToday();
  const records = readJSON<PomodoroRecord[]>(recordsFile(), []);
  let rec = records.find(r => r.date === today);
  if (rec) {
    rec.completedCount += 1;
  } else {
    rec = { id: randomUUID(), date: today, completedCount: 1 };
    records.push(rec);
  }
  writeJSON(recordsFile(), records);
  return rec;
}
