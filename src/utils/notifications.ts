// 本地通知工具 — Expo Go 安全降级版
// expo-notifications 在 Expo Go (SDK 53+) 中不可用
// 通知功能需打包为 development build 后生效

const NOT_AVAILABLE = 'Notifications require a development build (not Expo Go)';

export async function requestPermission(): Promise<boolean> {
  console.log(NOT_AVAILABLE);
  return false;
}

export async function scheduleNotification(
  _habitId: string, _name: string, _emoji: string, _time: string,
): Promise<void> {
  console.log(NOT_AVAILABLE);
}

export async function cancelNotification(_habitId: string): Promise<void> {
  // no-op
}

export async function updateNotification(
  _habitId: string, _name: string, _emoji: string, _reminderTime: string | null,
): Promise<void> {
  // no-op
}

export function setNotificationHandler(_onPress?: () => void): void {
  // no-op in Expo Go
}
