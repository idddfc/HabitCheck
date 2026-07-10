// 番茄钟 Tab
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../theme';
import { getSettings, getTodayRecord, incrementTodayRecord } from '../utils/pomodoro';

type Phase = 'work' | 'break' | 'longBreak';

export default function PomodoroScreen() {
  const insets = useSafeAreaInsets();
  const [seconds, setSeconds] = useState(25 * 60);
  const [phase, setPhase] = useState<Phase>('work');
  const [running, setRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [todayDone, setTodayDone] = useState(0);
  const settings = useRef(getSettings());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useFocusEffect(useCallback(() => {
    settings.current = getSettings();
    setSeconds(settings.current.workDuration * 60);
    setPhase('work');
    const rec = getTodayRecord();
    setTodayDone(rec?.completedCount || 0);
  }, []));

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const startTimer = () => {
    if (running) return;
    setRunning(true);
    timerRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          Vibration.vibrate([0, 500, 200, 500]);
          finishPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setRunning(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const resetTimer = () => {
    pauseTimer();
    setSeconds(settings.current.workDuration * 60);
    setPhase('work');
    setSessionCount(0);
  };

  const finishPhase = () => {
    setRunning(false);
    if (phase === 'work') {
      incrementTodayRecord();
      setTodayDone(prev => prev + 1);
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      if (newCount >= settings.current.sessionsBeforeLongBreak) {
        setPhase('longBreak');
        setSeconds(settings.current.longBreakDuration * 60);
        setSessionCount(0);
      } else {
        setPhase('break');
        setSeconds(settings.current.breakDuration * 60);
      }
    } else {
      setPhase('work');
      setSeconds(settings.current.workDuration * 60);
    }
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const phaseLabel = { work: '🍅 专注', break: '☕ 短休', longBreak: '🧘 长休' };
  const phaseColor = { work: colors.danger, break: colors.success, longBreak: colors.primary };
  const progress = phase === 'work'
    ? 1 - seconds / (settings.current.workDuration * 60)
    : phase === 'break'
      ? 1 - seconds / (settings.current.breakDuration * 60)
      : 1 - seconds / (settings.current.longBreakDuration * 60);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>番茄钟</Text>
      <Text style={styles.subtitle}>今日已完成 {todayDone} 个番茄</Text>

      <View style={styles.ring}>
        <View style={[styles.ringBg, { borderColor: phaseColor[phase] + '30' }]}>
          <Text style={[styles.timer, { color: phaseColor[phase] }]}>{fmt(seconds)}</Text>
          <Text style={[styles.phaseLabel, { color: phaseColor[phase] }]}>{phaseLabel[phase]}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: phaseColor[phase] }]} />
        </View>
      </View>

      <View style={styles.controls}>
        {!running ? (
          <TouchableOpacity style={[styles.btn, { backgroundColor: phaseColor[phase] }]} onPress={startTimer}>
            <Text style={styles.btnText}>开始</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.pauseBtn]} onPress={pauseTimer}>
            <Text style={styles.btnText}>暂停</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.btnOutline} onPress={resetTimer}>
          <Text style={styles.btnOutlineText}>重置</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', paddingHorizontal: spacing.lg },
  title: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.lg },
  subtitle: { fontSize: fontSizes.caption, color: colors.textSecondary, marginTop: spacing.xs },
  ring: { width: 240, alignItems: 'center', marginTop: spacing.xl },
  ringBg: { width: 200, height: 200, borderRadius: 100, borderWidth: 8, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  timer: { fontSize: 48, fontWeight: '700', fontVariant: ['tabular-nums'] },
  phaseLabel: { fontSize: fontSizes.caption, fontWeight: '600', marginTop: spacing.xs },
  progressBar: { width: '100%', height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  controls: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  btn: { paddingHorizontal: 40, paddingVertical: spacing.md, borderRadius: borderRadius.full },
  pauseBtn: { backgroundColor: '#FFA500' },
  btnText: { color: '#FFF', fontSize: fontSizes.body, fontWeight: '700' },
  btnOutline: { paddingHorizontal: 40, paddingVertical: spacing.md, borderRadius: borderRadius.full, borderWidth: 2, borderColor: colors.primary },
  btnOutlineText: { color: colors.primary, fontSize: fontSizes.body, fontWeight: '700' },
});
