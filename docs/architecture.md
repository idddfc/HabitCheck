# 架构设计 — HabitCheck

## 1. 组件树

```
App.tsx
└── NavigationContainer
    └── BottomTabNavigator
        ├── TodayScreen
        │   ├── RingProgress          (SVG 环形进度)
        │   ├── FlatList
        │   │   └── HabitCard[]       (每个任务卡片)
        │   ├── EmptyState            (空状态提示)
        │   ├── FAB                   (添加按钮)
        │   └── AddTaskSheet (Modal)  (底部弹窗表单)
        │       ├── TextInput         (任务名)
        │       ├── EmojiPicker       (emoji 网格)
        │       ├── ColorPicker       (颜色圆钮)
        │       ├── RepeatRuleChips   (重复规则)
        │       ├── WeekdayPicker     (自定义星期)
        │       └── ReminderToggle    (提醒时间)
        ├── CalendarScreen
        │   ├── Calendar             (月视图)
        │   └── DayDetailModal       (日期详情)
        ├── StatsScreen
        │   ├── EncouragementBanner  (鼓励文案)
        │   └── FlatList
        │       └── StatRow[]        (每任务统计)
        └── SettingsScreen
            ├── AboutSection
            └── ArchivedList
```

---

## 2. 数据流

```
┌─────────────────────────────────────────────────┐
│                   AsyncStorage                    │
│  @habits: Habit[]    @checkins: CheckIn[]        │
└──────────┬──────────────────┬───────────────────┘
           │                  │
     storage.ts          storage.ts
     (读写 habits)       (读写 checkins)
           │                  │
           └────────┬─────────┘
                    │
            streak.ts (纯函数)
            - getTodayHabits()
            - getStreak()
            - getLongestStreak()
            - getWeeklyCompletion()
                    │
           ┌────────┴────────┐
           │                 │
    useTodayHabits     useStats
    (今日任务 hook)    (统计 hook)
           │                 │
    TodayScreen        StatsScreen
           │
    CalendarScreen (直接读 checkins)
```

---

## 3. 路由结构

```
Tab Navigator
├── Today     (TodayScreen)
├── Calendar  (CalendarScreen)
├── Stats     (StatsScreen)
└── Settings  (SettingsScreen)
```

- 无需 Stack Navigator，所有交互通过 Modal 和底部弹窗实现
- 通知点击通过 `navigation.navigate('Today')` 跳转

---

## 4. 数据流原则

1. **单向数据流**: AsyncStorage → utils → hooks → screens → components
2. **状态提升**: 今日打卡状态由 `useTodayHabits` hook 统一管理
3. **乐观更新**: 打卡操作先更新 UI，再写入存储；失败时回滚
4. **不可变更新**: 所有数据修改通过展开运算符创建新对象/数组

---

## 5. 关键计算逻辑

### 5.1 今日任务过滤

```
habit 出现在今天 ← 
  habit.archived === false 
  AND (
    habit.repeatType === 'daily' 
    OR (habit.repeatType === 'weekdays' AND today ∈ [Mon-Fri])
    OR (habit.repeatType === 'custom' AND today.weekday ∈ habit.repeatDays)
  )
```

### 5.2 Streak 计算

从今天往回数连续打卡天数，直到遇到中断：

```
streak = 0
for day from today backwards:
  if checkin exists for day:
    streak++
  else:
    break
```

### 5.3 本周完成率

```
completionRate = 本周已完成次数 / (本周应有任务天数 × 活跃任务数)
```
