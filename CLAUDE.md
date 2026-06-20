# CLAUDE.md — HabitCheck 项目 AI 助手指引

> 本文件为 GitHub Copilot / Claude 等 AI 助手提供项目上下文、标准文件路径和工作流程说明。

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

## 🔧 技术栈

- **框架**: React Native + Expo (SDK 52+)
- **语言**: TypeScript (strict mode)
- **导航**: @react-navigation/native + @react-navigation/bottom-tabs
- **存储**: @react-native-async-storage/async-storage
- **通知**: expo-notifications (本地通知)
- **日历**: react-native-calendars
- **动画**: react-native-reanimated
- **触觉**: expo-haptics
- **SVG**: react-native-svg
- **ID**: uuid (v4)

---

## 📐 命名规范

| 类别 | 规范 | 示例 |
|------|------|------|
| 文件名 | PascalCase（组件）/ camelCase（工具/hook） | `HabitCard.tsx`, `storage.ts`, `useStats.ts` |
| 组件 | PascalCase | `RingProgress`, `AddTaskSheet` |
| Hook | `use` 前缀 + camelCase | `useTodayHabits`, `useStats` |
| 类型/接口 | PascalCase, `I` 前缀（接口） | `Habit`, `ICheckIn` |
| 常量 | UPPER_SNAKE_CASE（主题）/ camelCase | `PRIMARY_COLOR`, `fontSizes` |
| AsyncStorage Key | `@` 前缀 + kebab-case | `@habits`, `@checkins` |

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

- **不要**修改 `@react-navigation` 的核心配置文件，除非明确需要
- **不要**直接操作 AsyncStorage，必须通过 `src/utils/storage.ts` 封装函数
- **不要**在组件中直接计算 streak/完成率，使用 `src/utils/streak.ts` 工具函数
- 所有颜色、字号、间距使用 `src/theme/index.ts` 中的常量，禁止硬编码
- 通知相关操作统一使用 `src/utils/notifications.ts`
- 每次数据变更后，通过 hook 刷新 UI，不要手动 setState
- 保持 TypeScript strict mode，禁止 `any` 类型

---

## 🎯 当前阶段

参考 `docs/implementation-plan.md` 中的当前执行步骤。
