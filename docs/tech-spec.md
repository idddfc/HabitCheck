# 技术规范 — HabitCheck

## 1. 运行环境

| 项目 | 版本/要求 |
|------|-----------|
| Node.js | ≥ 18.x |
| Expo SDK | 52+ |
| React Native | 0.76+ (随 Expo SDK) |
| TypeScript | 5.x (strict mode) |
| 目标 OS | Android 12+ (HyperOS) |

---

## 2. 依赖清单

### 2.1 生产依赖

```json
{
  "@react-navigation/native": "^7.x",
  "@react-navigation/bottom-tabs": "^7.x",
  "react-native-screens": "~4.x",
  "react-native-safe-area-context": "~5.x",
  "@react-native-async-storage/async-storage": "~2.x",
  "expo-notifications": "~0.29.x",
  "expo-haptics": "~14.x",
  "react-native-calendars": "^1.1307.x",
  "react-native-reanimated": "~3.x",
  "react-native-svg": "~15.x",
  "uuid": "^10.x",
  "react-native-gesture-handler": "~2.x"
}
```

### 2.2 开发依赖

```json
{
  "@types/uuid": "^10.x",
  "typescript": "~5.x"
}
```

---

## 3. TypeScript 配置

`tsconfig.json` 关键配置：

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## 4. 存储方案

使用 `expo-file-system` (new API: Paths / Directory / File)，替代原先的 AsyncStorage。所有读写为**同步操作**。

| 文件 | 路径 | 说明 |
|------|------|------|
| 数据目录 | `Paths.document/habitcheck/` | 应用文档目录下的数据文件夹 |
| 习惯数据 | `habits.json` | Habit[] |
| 打卡数据 | `checkins.json` | CheckIn[] |
| 初始化标记 | `initialized` | 空文件，存在即已初始化 |

### 4.2 数据格式

**Habit:**
```typescript
interface Habit {
  id: string;           // uuid v4
  name: string;         // 任务名
  emoji: string;        // emoji 字符
  color: string;        // hex 颜色，如 "#FF6B6B"
  repeatType: 'daily' | 'weekdays' | 'custom';
  repeatDays: number[]; // 0=Sun ~ 6=Sat，仅 custom 时有效
  reminderTime: string | null; // "HH:mm" 格式，null=不提醒
  archived: boolean;
  createdAt: string;    // ISO 8601
}
```

**CheckIn:**
```typescript
interface CheckIn {
  id: string;        // uuid v4
  habitId: string;   // 关联 Habit.id
  date: string;      // "YYYY-MM-DD"
  completedAt: string; // ISO 8601
}
```

### 4.3 数据操作

所有读写必须通过 `src/utils/storage.ts` 中封装的函数：

| 函数 | 说明 |
|------|------|
| `initStorage()` | 首次启动写入示例数据 |
| `getHabits(includeArchived?)` | 获取习惯列表 |
| `addHabit(habit)` | 添加习惯 |
| `updateHabit(id, updates)` | 更新习惯 |
| `deleteHabit(id)` | 删除习惯及关联打卡 |
| `getCheckins(habitId?, date?)` | 获取打卡记录 |
| `addCheckin(checkin)` | 添加打卡记录 |
| `deleteCheckinsByHabitId(habitId)` | 删除某习惯所有打卡 |

---

## 5. 通知方案

使用 `expo-notifications` 本地通知：

- **权限**: 启动时请求 `NOTIFICATION` 权限
- **调度**: `scheduleNotificationAsync({ content, trigger })`
- **取消**: `cancelScheduledNotificationAsync(identifier)`
- **触发方式**: `DailyTriggerInput` 按每天指定时间触发
- **通知 ID**: 使用 `habitId` 作为 identifier，保证唯一
- **点击处理**: 监听 `addNotificationResponseReceivedListener`，跳转今日 Tab

---

## 6. 日历组件

使用 `react-native-calendars` 的 `Calendar` 组件：

- **Locale**: `zh-cn`
- **标记**: `markedDates` 使用 multi-dot 模式，每点对应一个 habit 的颜色
- **交互**: `onDayPress` 触发日期详情

---

## 7. 动画方案

使用 `react-native-reanimated`：

- **打卡动画**: `Animated.spring` 缩放（0.8 → 1.0），duration ~200ms
- **弹窗动画**: `Animated.timing` 底部滑入（translateY: 300 → 0），duration ~300ms

---

## 8. 目录结构

```
src/
├── types/index.ts        # 类型定义
├── utils/
│   ├── storage.ts        # AsyncStorage 封装
│   ├── streak.ts         # streak/完成率计算
│   └── notifications.ts  # 通知调度
├── hooks/
│   ├── useTodayHabits.ts # 今日任务数据
│   └── useStats.ts       # 统计数据
├── components/
│   ├── RingProgress.tsx  # 环形进度条
│   ├── HabitCard.tsx     # 任务卡片
│   ├── AddTaskSheet.tsx  # 添加任务弹窗
│   ├── EmojiPicker.tsx   # emoji 选择器
│   └── ColorPicker.tsx   # 颜色选择器
├── screens/
│   ├── TodayScreen.tsx   # 今日 Tab
│   ├── CalendarScreen.tsx# 日历 Tab
│   ├── StatsScreen.tsx   # 统计 Tab
│   └── SettingsScreen.tsx# 设置 Tab
└── theme/index.ts        # 主题常量
```
