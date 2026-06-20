# 实施计划 — HabitCheck

> 采用小步迭代、每步可独立验证的安全推进策略。每一步有明确的输入、产出和验证方法。

---

## 第 0 步：工程骨架搭建

**状态**: � 基本完成（待启动验证）

**产出**:
- [x] `docs/requirements.md` — 产品需求文档
- [x] `docs/tech-spec.md` — 技术规范
- [x] `docs/design-spec.md` — UI 设计规范
- [x] `docs/architecture.md` — 架构设计
- [x] `docs/implementation-plan.md` — 本文件
- [x] `CLAUDE.md` — AI 助手指引
- [x] `devlog/2026-06-20.md` — 开发日志
- [x] Expo 项目初始化（package.json / tsconfig.json / app.json / App.tsx）
- [x] 安装全部依赖（541 packages，npmmirror 镜像）
- [x] 创建 `src/` 完整目录结构（types/utils/hooks/components/screens/theme）
- [ ] `npx expo start` 启动验证

**验证**: `npx expo start` 可启动空白 App

---

## 第 1 步：数据层 + 类型定义

**状态**: 🟢 已完成

**产出**:
- `src/types/index.ts` — Habit / CheckIn / HabitWithStatus
- `src/utils/storage.ts` — AsyncStorage CRUD（initStorage 含示例数据、getHabits、addHabit、updateHabit、deleteHabit、getCheckins、addCheckin、deleteCheckinsByHabitId、getCheckinMap）
- `src/utils/streak.ts` — isHabitDueOn / getTodayHabits / getStreak / getLongestStreak / getWeeklyCompletion / getTodayCompletion / getEncouragement

**验证**: TypeScript strict 模式编译零错误 ✅

---

## 第 2 步：主题 + 导航骨架

**状态**: 🟢 已完成

**产出**:
- `src/theme/index.ts` — 完整主题常量（颜色/字号/间距/圆角/阴影）
- `App.tsx` — BottomTabNavigator + Ionicons 图标 + 主题常量引用
- `src/screens/TodayScreen.tsx` — 今日 Tab 占位
- `src/screens/CalendarScreen.tsx` — 日历 Tab 占位
- `src/screens/StatsScreen.tsx` — 统计 Tab 占位
- `src/screens/SettingsScreen.tsx` — 设置 Tab 占位
- 安装 `@expo/vector-icons`

**验证**: `npx expo start` 成功，Metro Bundler 运行，Expo Go 可扫码加载，4 Tab 可切换 ✅

---

## 第 3 步：今日 Tab — 静态 UI

**状态**: 🟢 已完成

**产出**:
- `src/components/RingProgress.tsx` — SVG 环形进度条（160×160，背景弧 #E9ECEF + 进度弧 #6C63FF + 中心数字）
- `src/components/HabitCard.tsx` — 任务卡片静态版（emoji + 任务名 + streak + 打卡按钮样式）
- `src/screens/TodayScreen.tsx` — 完整组装：FlatList + RingProgress header + HabitCard + 空状态
- Mock 数据展示 3 条示例任务

**验证**: 今日 Tab 渲染正确，环形进度/卡片/空状态符合设计规范 ✅

---

## 第 4 步：今日 Tab — 接入真实数据

**状态**: 🟢 已完成

**产出**:
- `src/hooks/useTodayHabits.ts` — 从 storage 加载 habits + checkins，通过 streak 工具计算 HabitWithStatus[]，提供 checkIn 函数
- `App.tsx` — useEffect 调用 `initStorage()` 首次启动写入 3 条示例习惯
- `src/screens/TodayScreen.tsx` — 使用 useTodayHabits hook，加载态 ActivityIndicator，打卡后自动刷新 UI

**验证**: 首次启动显示 3 条示例任务，点击打卡写入 AsyncStorage，进度/streak/排序实时更新 ✅

---

## 第 5 步：今日 Tab — 打卡交互

**状态**: 🟢 已完成

**产出**:
- `HabitCard.tsx` — `useSharedValue` + `useAnimatedStyle` + `withSpring` 弹跳动画
- 动画时序：点击 → 0.85 (stiffness 400) → 1.0 (stiffness 400)
- `expo-haptics` `ImpactFeedbackStyle.Light` 震动反馈
- `Animated.createAnimatedComponent(Pressable)` 驱动动画

**验证**: 点击○ → 震动 → 弹跳动画 → ✅ → 进度/streak 实时更新 ✅

---

## 第 6 步：添加任务 — 底部弹窗表单

**状态**: 🟢 已完成

**产出**:
- `EmojiPicker.tsx` — 32 个 emoji 3 列网格，选中态蓝色边框
- `ColorPicker.tsx` — 8 色圆形按钮，选中态放大+边框
- `AddTaskSheet.tsx` — 完整底部弹窗表单
  - 任务名 TextInput / EmojiPicker / ColorPicker
  - 重复规则 Chip 组（每日/工作日/自定义）
  - 自定义星期多选（仅自定义时显示）
  - 提醒开关 + HH:mm 时间输入
  - 表单校验 + 保存至 storage
  - Animated.spring 滑入动画
- `TodayScreen.tsx` — FAB 按钮 + Modal 集成
- `useTodayHabits` — 新增 `refresh()` 方法

**验证**: 点击 FAB → 弹窗滑入 → 填写表单 → 保存 → 今日列表刷新 ✅

---

## 第 7 步：日历 Tab

**状态**: 🟢 已完成

**产出**:
- `CalendarScreen.tsx` — 集成 `react-native-calendars` 月视图
- 中文 locale（月份/星期），周一 firstDay
- `multi-dot` 标记：打卡日显示彩色圆点（habit.color）
- 今日高亮（半透明紫色背景）
- 点击日期 → Modal 弹窗：✅ 已完成 / ❌ 未完成 列表
- 左右滑动切换月份（enableSwipeMonths）
- `useFocusEffect` 自动刷新

**验证**: 日历显示打卡打点，点击日期弹出正确详情 ✅

---

## 第 8 步：统计 Tab

**状态**: 🟢 已完成

**产出**:
- `useStats.ts` — 聚合所有活跃习惯的 streak/最长 streak/周完成率/整体完成率/鼓励文案
- `StatsScreen.tsx` — 顶部鼓励横幅（emoji + 文案 + 完成率%）+ 每任务统计卡片
  - 卡片含：emoji + 任务名 + 当前连续天数 + 最长连续天数 + 本周完成率进度条

**验证**: 统计数据正确，进度条比例准确，文案随数据变化 ✅

---

## 第 9 步：通知系统

**状态**: 🟢 已完成

**产出**:
- `notifications.ts` — `requestPermission` / `scheduleNotification` / `cancelNotification` / `updateNotification` / `setNotificationHandler`
- 使用 `DailyTriggerInput`（每天指定时间触发）
- 通知内容：`⏰ 别忘了打卡` + `[emoji] [name]`
- `AddTaskSheet` 保存时自动调度通知（如果有提醒时间）
- `App.tsx` 启动时请求通知权限，点击通知跳转到今日 Tab

**验证**: 创建带提醒的任务后，通知已调度；关闭提醒后通知取消 ✅

---

## 第 10 步：删除与归档

**状态**: 🟢 已完成

**产出**:
- `HabitCard.tsx` — 长按卡片（400ms）触发 `onLongPress` 回调
- `TodayScreen.tsx` — Alert 菜单：归档（设置 archived=true + 取消通知） / 删除（二次确认 + 清除数据 + 取消通知）
- `SettingsScreen.tsx` — 设置页：App 名称 v1.0.0 / 已归档任务列表 / 每项可恢复
- `getHabits(true)` 可获取含归档的全部习惯

**验证**: 长按 → 归档（列表移除、统计保留） / 删除（数据清除）/ 设置页恢复 ✅

---

## 第 11 步：设置 Tab 与 UI 收尾

**状态**: 🟢 已完成

**产出**:
- `SettingsScreen.tsx` — 最终版：App 名称 v1.0.0 / 已归档任务列表+恢复 / 清除所有数据 / 关于
- 全局 UI 一致性扫描通过
- TypeScript strict 模式零错误

**验证**: 全流程走查通过 ✅

---

## 进度总览

| 步骤 | 名称 | 状态 |
|------|------|------|
| 0 | 工程骨架搭建 | � |
| 1 | 数据层 + 类型定义 | 🟢 |
| 2 | 主题 + 导航骨架 | 🟢 |
| 3 | 今日 Tab 静态 UI | 🟢 |
| 4 | 今日 Tab 真实数据 | 🟢 |
| 5 | 打卡交互 | 🟢 |
| 6 | 添加任务 | 🟢 |
| 7 | 日历 Tab | 🟢 |
| 8 | 统计 Tab | 🟢 |
| 9 | 通知系统 | 🟢 |
| 10 | 删除与归档 | 🟢 |
| 11 | 设置与收尾 | 🟢 |
