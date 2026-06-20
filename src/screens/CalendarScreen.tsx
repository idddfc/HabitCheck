// 日历 Tab — 月视图 + 打卡打点 + 日期详情

import React, { useState, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../theme';
import { getHabits, getAllCheckins, getToday } from '../utils/storage';
import { isHabitDueOn } from '../utils/streak';
import type { Habit, CheckIn } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;

const zhLocale = {
  monthNames: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
  monthNamesShort: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
  dayNamesShort: ['日','一','二','三','四','五','六'],
  today: '今天',
};

interface DayDetail {
  date: string;
  completed: Habit[];
  missed: Habit[];
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [selectedDay, setSelectedDay] = useState<DayDetail | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => getToday().slice(0, 7));

  useFocusEffect(
    useCallback(() => {
      loadCalendarData();
    }, []),
  );

  function loadCalendarData() {
    const allHabits = getHabits(true);
    const allCheckins = getAllCheckins();
    const today = getToday();

    const checkinsByDate = new Map<string, CheckIn[]>();
    for (const c of allCheckins) {
      const list = checkinsByDate.get(c.date) || [];
      list.push(c);
      checkinsByDate.set(c.date, list);
    }

    const habitMap = new Map<string, Habit>();
    for (const h of allHabits) habitMap.set(h.id, h);

    const marks: Record<string, any> = {};
    for (const [date, checkins] of checkinsByDate) {
      const dots = checkins.map((c) => {
        const habit = habitMap.get(c.habitId);
        return { color: habit?.color || colors.primary };
      });
      marks[date] = { dots };
    }

    if (!marks[today]) {
      marks[today] = { selected: true, selectedColor: colors.primary + '20', selectedTextColor: colors.primary };
    } else {
      marks[today] = { ...marks[today], selected: true, selectedColor: colors.primary + '20', selectedTextColor: colors.primary };
    }

    setMarkedDates(marks);
  }

  function handleDayPress(day: DateData) {
    const dateStr = day.dateString;
    const allHabits = getHabits(true);
    const allCheckins = getAllCheckins();
    const habitMap = new Map(allHabits.map((h) => [h.id, h]));

    const dayCheckins = allCheckins.filter((c) => c.date === dateStr);
    const completedIds = new Set(dayCheckins.map((c) => c.habitId));

    const completed: Habit[] = [];
    const missed: Habit[] = [];
    const dateObj = new Date(dateStr + 'T00:00:00');

    for (const habit of allHabits) {
      if (habit.archived) continue;
      if (!isHabitDueOn(habit, dateObj)) continue;
      if (completedIds.has(habit.id)) completed.push(habit);
      else missed.push(habit);
    }

    setSelectedDay({ date: dateStr, completed, missed });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Calendar
        current={currentMonth}
        onMonthChange={(m: DateData) => setCurrentMonth(m.dateString.slice(0, 7))}
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={calendarTheme}
        firstDay={1}
        enableSwipeMonths
        {...zhLocale}
      />

      <Modal visible={selectedDay !== null} transparent animationType="fade" onRequestClose={() => setSelectedDay(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedDay(null)}>
          <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
            <Text style={styles.modalTitle}>{selectedDay?.date}</Text>

            {selectedDay && selectedDay.completed.length === 0 && selectedDay.missed.length === 0 ? (
              <Text style={styles.noData}>当天无任务</Text>
            ) : (
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {selectedDay && selectedDay.completed.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>✅ 已完成</Text>
                    {selectedDay.completed.map((h) => (
                      <View key={h.id} style={styles.habitRow}>
                        <Text style={styles.habitEmoji}>{h.emoji}</Text>
                        <Text style={styles.habitName}>{h.name}</Text>
                      </View>
                    ))}
                  </>
                )}
                {selectedDay && selectedDay.missed.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>❌ 未完成</Text>
                    {selectedDay.missed.map((h) => (
                      <View key={h.id} style={styles.habitRow}>
                        <Text style={styles.habitEmoji}>{h.emoji}</Text>
                        <Text style={styles.habitName}>{h.name}</Text>
                      </View>
                    ))}
                  </>
                )}
              </ScrollView>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const calendarTheme = {
  backgroundColor: colors.background,
  calendarBackground: colors.background,
  selectedDayBackgroundColor: colors.primary,
  selectedDayTextColor: '#FFFFFF',
  todayTextColor: colors.primary,
  dayTextColor: colors.textPrimary,
  textDisabledColor: '#D0D5DD',
  monthTextColor: colors.textPrimary,
  textMonthFontWeight: '700' as const,
  textMonthFontSize: fontSizes.h2,
  textDayFontSize: fontSizes.body - 1,
  textDayHeaderFontSize: fontSizes.caption,
  arrowColor: colors.primary,
  dotColor: colors.primary,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    backgroundColor: colors.cardBackground, borderRadius: borderRadius.lg,
    width: SCREEN_WIDTH - spacing.xl * 2, maxHeight: 360, padding: spacing.lg, ...shadows.card,
  },
  modalScroll: { maxHeight: 240 },
  modalTitle: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, textAlign: 'center' },
  noData: { fontSize: fontSizes.body, color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.lg },
  sectionTitle: { fontSize: fontSizes.caption, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.sm },
  habitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs + 2 },
  habitEmoji: { fontSize: 20, marginRight: spacing.sm },
  habitName: { fontSize: fontSizes.body, color: colors.textPrimary },
});
