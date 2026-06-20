// Emoji 选择器 — 3 列网格

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

const EMOJIS = [
  '🏃', '🚶', '🏋️', '🧘', '🚴', '🏊', '⚽', '🏀',
  '📖', '✍️', '🎨', '🎸', '🎹', '🎧', '📝', '💻',
  '🧹', '🍳', '🛒', '🧺', '🪴', '🐕', '🐈', '💊',
  '💧', '🍎', '🥗', '😴', '🌅', '🙏', '❤️', '⭐',
];

interface EmojiPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ selected, onSelect }: EmojiPickerProps) {
  return (
    <View style={styles.grid}>
      {EMOJIS.map((emoji) => (
        <TouchableOpacity
          key={emoji}
          style={[styles.cell, selected === emoji && styles.cellSelected]}
          onPress={() => onSelect(emoji)}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  cell: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    margin: 3,
  },
  cellSelected: {
    backgroundColor: colors.primary + '20',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 24,
  },
});
