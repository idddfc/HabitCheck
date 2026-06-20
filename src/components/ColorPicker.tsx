// 颜色选择器 — 8 色圆形按钮

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

interface ColorPickerProps {
  selected: string;
  onSelect: (color: string) => void;
}

export default function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <View style={styles.row}>
      {colors.habitColors.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.dot,
            { backgroundColor: color },
            selected === color && styles.dotSelected,
          ]}
          onPress={() => onSelect(color)}
        />
      ))}
    </View>
  );
}

const DOT_SIZE = 36;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  dotSelected: {
    borderWidth: 3,
    borderColor: colors.primary,
    transform: [{ scale: 1.15 }],
  },
});
