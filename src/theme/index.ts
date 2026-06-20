// 全局主题常量
// 参见 docs/design-spec.md

export const colors = {
  primary: '#6C63FF',
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6C757D',
  border: '#E9ECEF',
  success: '#4ECDC4',
  danger: '#FF6B6B',
  tabInactive: '#ADB5BD',

  // 习惯颜色盘
  habitColors: [
    '#FF6B6B', // 珊瑚红
    '#4ECDC4', // 青绿
    '#45B7D1', // 天蓝
    '#96CEB4', // 薄荷绿
    '#FFEAA7', // 暖黄
    '#DDA0DD', // 淡紫
    '#98D8C8', // 浅青
    '#F7DC6F', // 金黄
  ] as const,
};

export const fontSizes = {
  h1: 24,
  h2: 20,
  body: 16,
  caption: 14,
  small: 12,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};
