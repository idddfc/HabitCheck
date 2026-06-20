// 添加任务底部弹窗

import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../theme';
import EmojiPicker from './EmojiPicker';
import ColorPicker from './ColorPicker';
import { addHabit } from '../utils/storage';
import { scheduleNotification } from '../utils/notifications';
import type { Habit } from '../types';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddTaskSheet({ visible, onClose, onSaved }: AddTaskSheetProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // 表单状态
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📋');
  const [color, setColor] = useState<string>(colors.habitColors[0]);
  const [repeatType, setRepeatType] = useState<Habit['repeatType']>('daily');
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');

  // 弹窗动画
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        stiffness: 300,
        damping: 30,
      }).start();
      // 重置表单
      setName('');
      setEmoji('📋');
      setColor(colors.habitColors[0]);
      setRepeatType('daily');
      setRepeatDays([]);
      setReminderOn(false);
      setReminderTime('08:00');
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, slideAnim]);

  // 星期多选
  const toggleDay = (day: number) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  // 保存
  const handleSave = async () => {
    if (!name.trim()) return;
    const habit = addHabit({
      name: name.trim(),
      emoji,
      color,
      repeatType,
      repeatDays: repeatType === 'custom' ? repeatDays : [],
      reminderTime: reminderOn ? reminderTime : null,
    });
    // 调度通知
    if (reminderOn) {
      await scheduleNotification(habit.id, habit.name, habit.emoji, reminderTime);
    }
    onSaved();
    onClose();
  };

  // 关闭
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(onClose);
  };

  const isValid = name.trim().length > 0 && (repeatType !== 'custom' || repeatDays.length > 0);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* 拖拽条 */}
          <View style={styles.handleBar} />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 任务名 */}
            <Text style={styles.label}>任务名</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：晨跑"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoFocus
            />

            {/* Emoji */}
            <Text style={styles.label}>Emoji</Text>
            <EmojiPicker selected={emoji} onSelect={setEmoji} />

            {/* 颜色 */}
            <Text style={styles.label}>颜色</Text>
            <ColorPicker selected={color} onSelect={setColor} />

            {/* 重复规则 */}
            <Text style={styles.label}>重复</Text>
            <View style={styles.chipRow}>
              {(['daily', 'weekdays', 'custom'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.chip, repeatType === type && styles.chipActive]}
                  onPress={() => setRepeatType(type)}
                >
                  <Text style={[styles.chipText, repeatType === type && styles.chipTextActive]}>
                    {type === 'daily' ? '每日' : type === 'weekdays' ? '工作日' : '自定义'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 自定义星期 */}
            {repeatType === 'custom' && (
              <View style={styles.chipRow}>
                {WEEKDAYS.map((label, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.dayChip, repeatDays.includes(idx) && styles.dayChipActive]}
                    onPress={() => toggleDay(idx)}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        repeatDays.includes(idx) && styles.dayChipTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 提醒时间 */}
            <View style={styles.reminderRow}>
              <Text style={styles.label}>提醒</Text>
              <Switch
                value={reminderOn}
                onValueChange={setReminderOn}
                trackColor={{ false: colors.border, true: colors.primary + '60' }}
                thumbColor={reminderOn ? colors.primary : '#f4f3f4'}
              />
            </View>
            {reminderOn && (
              <TextInput
                style={styles.timeInput}
                placeholder="08:00"
                placeholderTextColor={colors.textSecondary}
                value={reminderTime}
                onChangeText={setReminderTime}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            )}

            {/* 保存按钮 */}
            <TouchableOpacity
              style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!isValid}
              activeOpacity={0.8}
            >
              <Text style={styles.saveText}>保存</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
    paddingBottom: 34, // safe area
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  label: {
    fontSize: fontSizes.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: fontSizes.body,
    color: colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: '#F1F3F5',
  },
  chipActive: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  dayChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  dayChipText: {
    fontSize: fontSizes.small,
    color: colors.textSecondary,
  },
  dayChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.body,
    color: colors.textPrimary,
    width: 100,
    marginTop: spacing.sm,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveText: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
