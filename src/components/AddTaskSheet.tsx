// 任务表单底部弹窗（添加/编辑）
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, TextInput, ScrollView, TouchableOpacity, Switch,
  Animated, StyleSheet, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../theme';
import EmojiPicker from './EmojiPicker';
import ColorPicker from './ColorPicker';
import { addHabit, updateHabit, getHabits } from '../utils/storage';
import { scheduleNotification, cancelNotification } from '../utils/notifications';
import type { Habit } from '../types';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  editHabit?: Habit;
}

export default function AddTaskSheet({ visible, onClose, onSaved, editHabit }: AddTaskSheetProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const isEdit = !!editHabit;

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📋');
  const [color, setColor] = useState<string>(colors.habitColors[0]);
  const [repeatType, setRepeatType] = useState<Habit['repeatType']>('daily');
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [timePickerKey, setTimePickerKey] = useState(0);
  const timeValueRef = useRef(new Date());
  const savedTimeRef = useRef('08:00');

  useEffect(() => {
    if (!visible) {
      slideAnim.setValue(SCREEN_HEIGHT);
      setTimePickerKey(0);
      return;
    }
    if (editHabit) {
      // 从 storage 重新读取最新数据，避免同步写入尚未落盘的问题
      const latest = getHabits(true).find(h => h.id === editHabit.id) || editHabit;
      setName(latest.name);
      setEmoji(latest.emoji);
      setColor(latest.color);
      setRepeatType(latest.repeatType);
      setRepeatDays(latest.repeatDays);
      const hasReminder = !!latest.reminderTime;
      const rt = latest.reminderTime || '08:00';
      setReminderOn(hasReminder);
      setReminderTime(rt);
      savedTimeRef.current = rt;
    } else {
      setName(''); setEmoji('📋'); setColor(colors.habitColors[0]);
      setRepeatType('daily'); setRepeatDays([]);
      setReminderOn(false); setReminderTime('08:00');
      savedTimeRef.current = '08:00';
    }
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, stiffness: 300, damping: 30 }).start();
  }, [visible, editHabit]);

  const toggleDay = (day: number) =>
    setRepeatDays(p => p.includes(day) ? p.filter(d => d !== day) : [...p, day]);

  const handleSave = async () => {
    if (!name.trim()) return;
    const data = {
      name: name.trim(), emoji, color,
      repeatType,
      repeatDays: repeatType === 'custom' ? repeatDays : [],
      reminderTime: reminderOn ? savedTimeRef.current : null,
    };
    if (isEdit && editHabit) {
      const oldReminder = editHabit.reminderTime;
      await cancelNotification(editHabit.id);
      updateHabit(editHabit.id, data);
      if (reminderOn) await scheduleNotification(editHabit.id, data.name, data.emoji, savedTimeRef.current);
    } else {
      const habit = addHabit(data);
      if (reminderOn) await scheduleNotification(habit.id, habit.name, habit.emoji, savedTimeRef.current);
    }
    onSaved();
    onClose();
  };

  const handleClose = () =>
    Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }).start(onClose);

  const isValid = name.trim().length > 0 && (repeatType !== 'custom' || repeatDays.length > 0);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.handleBar} />
          <Text style={styles.sheetTitle}>{isEdit ? '编辑任务' : '添加任务'}</Text>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>任务名</Text>
            <TextInput style={styles.input} placeholder="例如：晨跑" placeholderTextColor={colors.textSecondary}
              value={name} onChangeText={setName} />

            <Text style={styles.label}>Emoji</Text>
            <EmojiPicker selected={emoji} onSelect={setEmoji} />

            <Text style={styles.label}>颜色</Text>
            <ColorPicker selected={color} onSelect={setColor} />

            <Text style={styles.label}>重复</Text>
            <View style={styles.chipRow}>
              {(['daily', 'weekdays', 'custom'] as const).map((type) => (
                <TouchableOpacity key={type} style={[styles.chip, repeatType === type && styles.chipActive]}
                  onPress={() => setRepeatType(type)}>
                  <Text style={[styles.chipText, repeatType === type && styles.chipTextActive]}>
                    {type === 'daily' ? '每日' : type === 'weekdays' ? '工作日' : '自定义'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {repeatType === 'custom' && (
              <View style={styles.chipRow}>
                {WEEKDAYS.map((label, idx) => (
                  <TouchableOpacity key={idx} style={[styles.dayChip, repeatDays.includes(idx) && styles.dayChipActive]}
                    onPress={() => toggleDay(idx)}>
                    <Text style={[styles.dayChipText, repeatDays.includes(idx) && styles.dayChipTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.reminderRow}>
              <Text style={styles.label}>提醒</Text>
              <Switch value={reminderOn} onValueChange={setReminderOn}
                trackColor={{ false: colors.border, true: colors.primary + '60' }}
                thumbColor={reminderOn ? colors.primary : '#f4f3f4'} />
            </View>
            {reminderOn && (
              <TouchableOpacity style={styles.timeBtn} onPress={() => {
                const [hh, mm] = reminderTime.split(':').map(Number);
                timeValueRef.current.setHours(hh || 0, mm || 0, 0, 0);
                setTimePickerKey(prev => prev + 1);
              }}>
                <Text style={styles.timeBtnText}>{reminderTime}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
              onPress={handleSave} disabled={!isValid} activeOpacity={0.8}>
              <Text style={styles.saveText}>{isEdit ? '保存修改' : '保存'}</Text>
            </TouchableOpacity>
            {timePickerKey > 0 && (
              <DateTimePicker
                key={timePickerKey}
                value={timeValueRef.current}
                mode="time" is24Hour
                onValueChange={(_e, d) => {
                  if (d) {
                    const t = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                    savedTimeRef.current = t;
                    setReminderTime(t);
                    setTimePickerKey(0);
                  }
                }}
                onDismiss={() => setTimePickerKey(0)}
              />
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: colors.cardBackground, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: SCREEN_HEIGHT * 0.8, paddingBottom: 34 },
  handleBar: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: spacing.sm },
  scroll: { flexGrow: 0 },
  scrollContent: { padding: spacing.lg, paddingTop: spacing.md },
  sheetTitle: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm, marginTop: spacing.sm },
  label: { fontSize: fontSizes.caption, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: fontSizes.body, color: colors.textPrimary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: '#F1F3F5' },
  chipActive: { backgroundColor: colors.primary + '20', borderWidth: 1.5, borderColor: colors.primary },
  chipText: { fontSize: fontSizes.caption, color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
  dayChip: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F3F5', alignItems: 'center', justifyContent: 'center' },
  dayChipActive: { backgroundColor: colors.primary + '20', borderWidth: 1.5, borderColor: colors.primary },
  dayChipText: { fontSize: fontSizes.small, color: colors.textSecondary },
  dayChipTextActive: { color: colors.primary, fontWeight: '600' },
  reminderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  timeBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, width: 100, marginTop: spacing.sm },
  timeBtnText: { fontSize: fontSizes.body, color: colors.textPrimary, textAlign: 'center' },
  saveButton: { backgroundColor: colors.primary, borderRadius: borderRadius.sm, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  saveButtonDisabled: { opacity: 0.4 },
  saveText: { fontSize: fontSizes.body, fontWeight: '600', color: '#FFFFFF' },
});
