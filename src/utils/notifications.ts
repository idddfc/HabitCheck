// 本地通知工具 — 环境检测版
// Expo Go 中静默跳过，独立 APK 中正常使用

import { Platform } from 'react-native';

// 判断是否在 Expo Go 中运行
let _isExpoGo = true; // 默认安全降级
let _mod: any = null;

async function init() {
  try {
    const Constants = await import('expo-constants');
    const execEnv = Constants.default.executionEnvironment;
    // 'storeClient' = Expo Go
    if (execEnv === 'storeClient') return;
    _isExpoGo = false;
    _mod = await import('expo-notifications');
    _mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true, shouldPlaySound: true,
        shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true,
      }),
    });
    // Android 8.0+ 必须创建通知频道才能显示通知
    if (Platform.OS === 'android') {
      await _mod.setNotificationChannelAsync('habit-reminder', {
        name: '习惯提醒',
        description: '每日习惯打卡提醒',
        importance: _mod.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6C63FF',
      });
    }
  } catch {
    _isExpoGo = true;
    _mod = null;
  }
}

// 启动时检测
init();

export async function requestPermission(): Promise<boolean> {
  if (_isExpoGo || !_mod) return false;
  try {
    const { status } = await _mod.requestPermissionsAsync();
    return status === 'granted';
  } catch { return false; }
}

export async function scheduleNotification(
  habitId: string, name: string, emoji: string, time: string,
): Promise<void> {
  if (_isExpoGo || !_mod) return;
  try {
    const [hour, minute] = time.split(':').map(Number);
    await _mod.scheduleNotificationAsync({
      identifier: habitId,
      content: {
        title: '⏰ 别忘了打卡',
        body: `${emoji} ${name}`,
        data: { habitId },
        sound: true,
        ...(Platform.OS === 'android' ? { channelId: 'habit-reminder' } : {}),
      },
      trigger: { type: _mod.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
  } catch {}
}

export async function cancelNotification(habitId: string): Promise<void> {
  if (_isExpoGo || !_mod) return;
  try { await _mod.cancelScheduledNotificationAsync(habitId); } catch {}
}

export async function updateNotification(
  habitId: string, name: string, emoji: string, reminderTime: string | null,
): Promise<void> {
  await cancelNotification(habitId);
  if (reminderTime) await scheduleNotification(habitId, name, emoji, reminderTime);
}

export function setNotificationHandler(onPress?: () => void): void {
  if (_isExpoGo || !_mod || !onPress) return;
  try { _mod.addNotificationResponseReceivedListener(() => onPress()); } catch {}
}

/** 启动时恢复所有习惯的通知调度（用于首次安装 / 重启后恢复） */
export async function rescheduleAllNotifications(
  habits: { id: string; name: string; emoji: string; reminderTime: string | null }[],
): Promise<void> {
  if (_isExpoGo || !_mod) return;
  for (const h of habits) {
    if (h.reminderTime) {
      try {
        // 先取消旧的通知
        await _mod.cancelScheduledNotificationAsync(h.id);
        // 重新调度
        const [hour, minute] = h.reminderTime.split(':').map(Number);
        await _mod.scheduleNotificationAsync({
          identifier: h.id,
          content: {
            title: '⏰ 别忘了打卡',
            body: `${h.emoji} ${h.name}`,
            data: { habitId: h.id },
            sound: true,
            ...(Platform.OS === 'android' ? { channelId: 'habit-reminder' } : {}),
          },
          trigger: { type: _mod.SchedulableTriggerInputTypes.DAILY, hour, minute },
        });
      } catch {}
    }
  }
}
