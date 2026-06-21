# HabitCheck ✅ — 每日习惯打卡 App

> 一个简洁、优雅的 Android 每日习惯打卡应用，帮助您追踪和管理日常习惯。

## ✨ 功能

| 功能 | 描述 |
|------|------|
| 📋 **今日任务** | 每日自动展示今日需打卡的任务列表，环形进度一目了然 |
| ✅ **一键打卡** | 点击即打卡，弹跳动画 + 震动反馈，体验流畅愉悦 |
| ➕ **添加任务** | 支持 Emoji、颜色、重复规则（每日/工作日/自定义）、提醒时间 |
| ✏️ **编辑任务** | 长按任务可编辑或删除，灵活管理 |
| 📅 **日历视图** | 月历上显示打卡记录，点击日期查看详情 |
| 📊 **统计页面** | 连续打卡天数、最长 streak、周完成率、鼓励文案 |
| 🔔 **本地通知** | 按时提醒打卡，不再忘记 |
| 📦 **归档管理** | 归档不再需要的任务，随时可恢复 |

## 🖼️ 截图

_(项目开发中，截图待补充)_

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- Android 设备或模拟器

### 安装与运行

```bash
# 克隆项目
git clone git@github.com:idddfc/HabitCheck.git
cd HabitCheck

# 安装依赖
npm install

# 启动开发服务器
npx expo start --clear
```

使用 **Expo Go** 扫码或在终端中输入 URL 即可在手机上预览。

> 如果使用 USB 连接（推荐），先连接手机并执行：
> ```
> adb reverse tcp:8081 tcp:8081
> ```

### 构建 APK

```bash
# 需要 EAS 账号，已配置
npx eas build --platform android --profile preview
```

构建完成后会生成 APK 下载链接。

## 🏗️ 技术栈

| 技术 | 用途 |
|------|------|
| **React Native** (0.85) | 跨平台移动框架 |
| **Expo SDK 56** | 开发工具链与原生模块 |
| **TypeScript** (strict) | 类型安全 |
| **@react-navigation/bottom-tabs** | 底部 Tab 导航 |
| **react-native-calendars** | 日历组件 |
| **react-native-reanimated** | 动画引擎 |
| **@react-native-community/datetimepicker** | 时间选择器 |
| **expo-notifications** | 本地通知 |
| **expo-file-system** | 本地数据持久化 |
| **expo-haptics** | 触觉反馈 |
| **react-native-svg** | 环形进度条 SVG |

## 📁 项目结构

```
HabitCheck/
├── App.tsx                  # 入口 + Tab 导航
├── src/
│   ├── components/          # UI 组件
│   │   ├── AddTaskSheet.tsx # 添加/编辑任务弹窗
│   │   ├── HabitCard.tsx    # 任务卡片
│   │   ├── RingProgress.tsx # 环形进度条
│   │   ├── EmojiPicker.tsx  # Emoji 选择器
│   │   └── ColorPicker.tsx  # 颜色选择器
│   ├── screens/             # 页面
│   │   ├── TodayScreen.tsx  # 今日任务
│   │   ├── CalendarScreen.tsx # 日历
│   │   ├── StatsScreen.tsx  # 统计
│   │   └── SettingsScreen.tsx # 设置
│   ├── hooks/               # 自定义 Hook
│   ├── utils/               # 工具函数
│   │   ├── storage.ts       # 数据持久化
│   │   ├── streak.ts        # Streak 计算
│   │   └── notifications.ts # 通知管理
│   ├── theme/               # 主题常量
│   └── types/               # TypeScript 类型
├── docs/                    # 设计文档
├── devlog/                  # 开发日志
└── eas.json                 # EAS Build 配置
```

## 📱 下载

APK 可通过 EAS Build 生成，最新构建请查看项目的 [GitHub Actions](https://github.com/idddfc/HabitCheck/actions) 或运行 `npx eas build` 自行构建。

## 📄 文档

- [产品需求](docs/requirements.md)
- [技术规范](docs/tech-spec.md)
- [设计规范](docs/design-spec.md)
- [架构设计](docs/architecture.md)
- [实施计划](docs/implementation-plan.md)
- [开发日志](devlog/)

## 🤝 贡献

本项目为个人项目，欢迎提 Issue 和 PR。

## 📜 许可证

MIT
