# CLAUDE.md — HabitCheck 项目 AI 助手指引

> 本文件为 GitHub Copilot / Claude 等 AI 助手提供项目上下文、标准文件路径和工作流程说明。
> 最后更新: 2026-07-11（v1.1.1）

---

## 📁 标准文件路径索引

| 文件 | 路径 | 用途 |
|------|------|------|
| 产品需求 | `docs/requirements.md` | 功能列表、用户故事、验收标准 |
| 技术规范 | `docs/tech-spec.md` | 依赖版本、存储方案、配置 |
| 设计规范 | `docs/design-spec.md` | 颜色、字体、间距、组件规范 |
| 架构设计 | `docs/architecture.md` | 组件树、数据流、路由结构 |
| 实施计划 | `docs/implementation-plan.md` | 分步执行计划 |
| 开发日志 | `devlog/YYYY-MM-DD.md` | 每日完成事项与待办 |

---

## 🔧 技术栈（当前版本 v1.1.1）

- **框架**: React Native + Expo (SDK 56)
- **语言**: TypeScript (strict mode)
- **导航**: @react-navigation/native + @react-navigation/bottom-tabs v7
- **存储**: expo-file-system (Paths.document + sync read/write, JSON)
- **UUID**: expo-crypto.randomUUID()
- **通知**: expo-notifications (DAILY + DATE trigger)
- **日历**: react-native-calendars
- **时间选择器**: @react-native-community/datetimepicker 9.1.0
- **动画**: react-native-reanimated
- **触觉**: expo-haptics (打卡 + 番茄钟)
- **SVG**: react-native-svg
- **构建**: EAS Build (preview profile → APK)

---

## � 项目结构

```
src/
├── components/
│   ├── AddEventSheet.tsx   # 日程弹窗
│   ├── AddTaskSheet.tsx    # 习惯弹窗
│   ├── HabitCard.tsx       # 习惯卡片
│   └── RingProgress.tsx    # 环形进度
├── screens/ (Today/Calendar/Stats/Pomodoro/Settings)
├── hooks/ (useTodayHabits, useStats)
├── utils/ (storage, streak, notifications, pomodoro, schedule)
├── theme/index.ts
└── types/index.ts
```

## 📐 命名规范

| 类别 | 规范 | 示例 |
|------|------|------|
| 文件名 | PascalCase（组件）/ camelCase（工具） | `HabitCard.tsx`, `storage.ts` |
| 组件 | PascalCase | `RingProgress`, `AddEventSheet` |
| Hook | `use` 前缀 + camelCase | `useTodayHabits` |
| 类型/接口 | PascalCase | `Habit`, `ScheduleEvent` |
| 数据文件 | kebab-case JSON | `habits.json`, `events.json` |

---

## 🧭 工作流程说明

### 开发前
1. 阅读 `docs/requirements.md` 确认当前任务需求
2. 阅读 `docs/design-spec.md` 确认 UI 参数
3. 查看 `devlog/` 最新日志了解进度和待办

### 开发中
1. 严格遵循 `docs/tech-spec.md` 中的依赖版本和配置
2. 遵循 `docs/architecture.md` 中的数据流和组件树
3. 每个文件只负责单一职责

### 开发后
1. 更新 `devlog/YYYY-MM-DD.md`，记录已完成事项和待办
2. 如有架构/需求变更，同步更新 `docs/` 中对应文档
3. 确保 `npx expo start` 可正常启动

---

## ⚠️ 注意事项

- **不要**直接操作文件系统，通过 `src/utils/` 封装函数
- streak 计算用 `streak.ts`，通知用 `notifications.ts`，日程用 `schedule.ts`，番茄钟用 `pomodoro.ts`
- 颜色/字号/间距用 `theme/index.ts` 常量，禁止硬编码
- 每次数据变更后通过 hook 或 refresh 刷新 UI
- TypeScript strict mode，禁用 `any`
- 删除习惯务必 `await cancelNotification(id)`；删除日程务必 `cancelEventNotification(id)`

---

## 🎯 当前阶段

**v1.1.1 已完成**
- 番茄钟全屏屏保（深色横屏）+ 设置面板 + 跳过按钮
- 日历分区重构（彩色左边条卡片）+ 倒计时全局显示 + 日程编辑 + 日程删除按钮风格统一
