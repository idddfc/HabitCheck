// 环形进度条组件 — SVG 实现
// 显示"今日已完成 / 今日总数"

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fontSizes } from '../theme';

interface RingProgressProps {
  completed: number;
  total: number;
}

const SIZE = 160;
const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

export default function RingProgress({ completed, total }: RingProgressProps) {
  const progress = total > 0 ? completed / total : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* 背景弧 */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={colors.border}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* 进度弧 */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={colors.primary}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${CENTER}, ${CENTER}`}
        />
      </Svg>
      {/* 中心文字 */}
      <View style={styles.centerText}>
        <Text style={styles.completed}>{completed}</Text>
        <Text style={styles.total}>/ {total}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  completed: {
    fontSize: fontSizes.h1,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  total: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
  },
});
