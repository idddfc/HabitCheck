// 添加日程事件底部弹窗
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, Switch,
  Animated, StyleSheet, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, fontSizes, spacing, borderRadius } from '../theme';
import { addEvent, updateEvent } from '../utils/schedule';
import { scheduleOneTimeNotification, cancelEventNotification } from '../utils/notifications';
import { getToday } from '../utils/storage';
import type { ScheduleEvent } from '../types';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialDate?: string;
  editEvent?: ScheduleEvent;
}

export default function AddEventSheet({ visible, onClose, onSaved, initialDate, editEvent }: Props) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getToday());
  const [time, setTime] = useState('12:00');
  const [note, setNote] = useState('');
  const [remindOn, setRemindOn] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (!visible) { slideAnim.setValue(SCREEN_HEIGHT); return; }
    if (editEvent) {
      setTitle(editEvent.title); setDate(editEvent.date); setTime(editEvent.time);
      setNote(editEvent.note || ''); setRemindOn(!!editEvent.remindBefore);
    } else {
      setTitle(''); setDate(initialDate || getToday()); setTime('12:00');
      setNote(''); setRemindOn(false);
    }
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, stiffness: 300, damping: 30 }).start();
  }, [visible, initialDate, editEvent]);

  const handleClose = () =>
    Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }).start(onClose);

  const handleSave = async () => {
    if (!title.trim()) return;
    if (editEvent) {
      updateEvent(editEvent.id, { title: title.trim(), date, time, note: note.trim() || undefined, remindBefore: remindOn ? 10 : undefined });
      await cancelEventNotification(editEvent.id);
      if (remindOn) await scheduleOneTimeNotification(editEvent.id, title.trim(), date, time, 10);
    } else {
      const event = addEvent({ title: title.trim(), date, time, note: note.trim() || undefined, remindBefore: remindOn ? 10 : undefined });
      if (remindOn) await scheduleOneTimeNotification(event.id, event.title, date, time, event.remindBefore || 0);
    }
    onSaved();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.handleBar} />
          <Text style={styles.sheetTitle}>{editEvent ? '编辑日程' : '添加日程'}</Text>
          <View style={styles.body}>
            <Text style={styles.label}>标题</Text>
            <TextInput style={styles.input} placeholder="例如：团队周会" placeholderTextColor={colors.textSecondary} value={title} onChangeText={setTitle} />

            <Text style={styles.label}>日期</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.pickerText}>{date}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker value={new Date(date + 'T00:00:00')} mode="date"
                onChange={(_e, d) => { setShowDatePicker(false); if (d) { const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); setDate(`${y}-${m}-${day}`); } }} />
            )}

            <Text style={styles.label}>时间</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.pickerText}>{time}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker value={(() => { const [h,m]=time.split(':').map(Number); const d=new Date(); d.setHours(h||0,m||0,0,0); return d; })()} mode="time" is24Hour
                onChange={(_e, d) => { setShowTimePicker(false); if (d) setTime(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`); }} />
            )}

            <Text style={styles.label}>备注</Text>
            <TextInput style={styles.input} placeholder="（可选）" placeholderTextColor={colors.textSecondary} value={note} onChangeText={setNote} />

            <View style={styles.reminderRow}>
              <Text style={styles.label}>提前10分钟提醒</Text>
              <Switch value={remindOn} onValueChange={setRemindOn} trackColor={{ false: colors.border, true: colors.primary + '60' }} thumbColor={remindOn ? colors.primary : '#f4f3f4'} />
            </View>

            <TouchableOpacity style={[styles.saveBtn, !title.trim() && { opacity: 0.4 }]} onPress={handleSave} disabled={!title.trim()}>
              <Text style={styles.saveText}>保存</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: colors.cardBackground, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: SCREEN_HEIGHT * 0.75, paddingBottom: 34 },
  handleBar: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: spacing.sm },
  sheetTitle: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm, marginTop: spacing.sm },
  body: { paddingHorizontal: spacing.lg },
  label: { fontSize: fontSizes.caption, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: fontSizes.body, color: colors.textPrimary },
  pickerBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4 },
  pickerText: { fontSize: fontSizes.body, color: colors.textPrimary },
  reminderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saveBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.sm, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  saveText: { color: '#FFF', fontSize: fontSizes.body, fontWeight: '600' },
});
