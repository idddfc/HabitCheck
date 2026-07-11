// 日程事件数据访问层
import { Paths, Directory, File } from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import { ScheduleEvent } from '../types';

function dataDir(): Directory {
  const dir = new Directory(Paths.document, 'habitcheck');
  if (!dir.exists) dir.create();
  return dir;
}

function eventsFile(): File {
  const f = new File(dataDir(), 'events.json');
  if (!f.exists) { f.create(); f.write('[]'); }
  return f;
}

function readEvents(): ScheduleEvent[] {
  try {
    const text = eventsFile().textSync();
    return text ? (JSON.parse(text) as ScheduleEvent[]) : [];
  } catch { return []; }
}

function writeEvents(list: ScheduleEvent[]): void {
  eventsFile().write(JSON.stringify(list));
}

export function getEvents(date?: string): ScheduleEvent[] {
  let list = readEvents();
  if (date) list = list.filter(e => e.date === date);
  list.sort((a, b) => a.time.localeCompare(b.time));
  return list;
}

export function addEvent(event: Omit<ScheduleEvent, 'id' | 'createdAt'>): ScheduleEvent {
  const e: ScheduleEvent = { ...event, id: randomUUID(), createdAt: new Date().toISOString() };
  const all = readEvents();
  all.push(e);
  writeEvents(all);
  return e;
}

export function updateEvent(id: string, updates: Partial<Omit<ScheduleEvent, 'id' | 'createdAt'>>): ScheduleEvent | null {
  const all = readEvents();
  const i = all.findIndex(e => e.id === id);
  if (i === -1) return null;
  all[i] = { ...all[i], ...updates };
  writeEvents(all);
  return all[i];
}

export function deleteEvent(id: string): void {
  writeEvents(readEvents().filter(e => e.id !== id));
}
