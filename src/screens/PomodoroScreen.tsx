// 番茄钟 Tab
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration, Modal, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../theme';
import { getSettings, getTodayRecord, incrementTodayRecord, saveSettings } from '../utils/pomodoro';

type Phase = 'work' | 'break' | 'longBreak';

export default function PomodoroScreen() {
  const insets = useSafeAreaInsets();
  const [seconds, setSeconds] = useState(25 * 60);
  const [phase, setPhase] = useState<Phase>('work');
  const [running, setRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [todayDone, setTodayDone] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState(getSettings());
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    setRunning(true); setFullscreen(true); setShowControls(true);
    resetHideTimeout();
    timerRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!); timerRef.current = null;
          Vibration.vibrate([0, 500, 200, 500]);
          finishPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetHideTimeout = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowControls(true);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 5000);
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

  const skipPhase = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    finishPhase();
  };

  const finishPhase = () => {
    setRunning(false); setFullscreen(false);
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

  const onSaveSettings = () => {
    saveSettings(settingsDraft);
    settings.current = settingsDraft;
    setShowSettings(false);
    if (!running) { setSeconds(settingsDraft.workDuration * 60); setPhase('work'); setSessionCount(0); }
  };

  const PhaseColors = { work: '#FF6B6B', break: '#4ECDC4', longBreak: '#6C63FF' };
  const phaseLabel = { work: '🍅 专注', break: '☕ 短休', longBreak: '🧘 长休' };
  const progress = phase === 'work'
    ? 1 - seconds / (settings.current.workDuration * 60)
    : phase === 'break'
      ? 1 - seconds / (settings.current.breakDuration * 60)
      : 1 - seconds / (settings.current.longBreakDuration * 60);

  const fmtsettings = (v: number) => `${v} 分钟`;

  const TimerRing = ({ small }: { small?: boolean }) => (
    <View style={styles.ring}>
      <View style={[styles.ringBg, small && styles.ringBgSmall, { borderColor: PhaseColors[phase] + '30' }]}>
        <Text style={[styles.timer, small && styles.timerSmall, { color: PhaseColors[phase] }]}>{fmt(seconds)}</Text>
        <Text style={[styles.phaseLabel, { color: PhaseColors[phase] }]}>{phaseLabel[phase]}</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: PhaseColors[phase] }]} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>番茄钟</Text>
        <TouchableOpacity onPress={() => { setSettingsDraft(settings.current); setShowSettings(true); }}>
          <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>今日已完成 {todayDone} 个番茄</Text>

      <TimerRing />

      <View style={styles.controls}>
        {!running ? (
          <TouchableOpacity style={[styles.btn, { backgroundColor: PhaseColors[phase] }]} onPress={startTimer}>
            <Text style={styles.btnText}>开始</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#FFA500' }]} onPress={pauseTimer}>
              <Text style={styles.btnText}>暂停</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.textSecondary }]} onPress={skipPhase}>
              <Text style={styles.btnText}>跳过</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={styles.btnOutline} onPress={resetTimer}>
          <Text style={styles.btnOutlineText}>重置</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={fullscreen} animationType="fade" transparent={false} statusBarTranslucent>
        <StatusBar hidden />
        <View style={styles.fsContainer}>
          {(() => {
            const { width: W, height: H } = Dimensions.get('window');
            const isLandscape = W > H;
            const longSide = isLandscape ? W : H;
            const shortSide = isLandscape ? H : W;
            return (
              <View style={[styles.fsLandscape, { width: longSide, height: shortSide, transform: isLandscape ? [] : [{ rotate: '90deg' }] }]}>
                <Text style={styles.fsPhaseLabel}>{phaseLabel[phase]}</Text>
                <View style={styles.fsTimerWrap}>
                  <Text style={[styles.fsTimer, { color: PhaseColors[phase] }]}>{fmt(seconds)}</Text>
                </View>
                {showControls && (
                  <View style={styles.fsControls}>
                    <TouchableOpacity style={[styles.fsBtn, { backgroundColor: '#FFA500' }]} onPress={pauseTimer}>
                      <Text style={styles.fsBtnText}>暂停</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.fsBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} onPress={skipPhase}>
                      <Text style={styles.fsBtnText}>跳过</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.fsBtn, { backgroundColor: 'rgba(255,255,255,0.08)' }]} onPress={() => { pauseTimer(); setFullscreen(false); }}>
                      <Text style={styles.fsBtnText}>退出</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })()}
        </View>
      </Modal>

      <Modal visible={showSettings} animationType="slide" transparent>
        <View style={styles.settingsOverlay}>
          <View style={styles.settingsCard}>
            <View style={styles.settingsHeader}>
              <Text style={styles.sheetTitle}>番茄钟设置</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.settingLabel}>工作时长</Text>
              <View style={styles.optionRow}>{[15,20,25,30,45,60].map(v => (
                <TouchableOpacity key={v} style={[styles.option, settingsDraft.workDuration===v && styles.optionActive]} onPress={() => setSettingsDraft({...settingsDraft, workDuration:v})}>
                  <Text style={[styles.optionText, settingsDraft.workDuration===v && styles.optionTextActive]}>{v}分</Text>
                </TouchableOpacity>
              ))}</View>
              <Text style={styles.settingLabel}>短休时长</Text>
              <View style={styles.optionRow}>{[3,5,10,15].map(v => (
                <TouchableOpacity key={v} style={[styles.option, settingsDraft.breakDuration===v && styles.optionActive]} onPress={() => setSettingsDraft({...settingsDraft, breakDuration:v})}>
                  <Text style={[styles.optionText, settingsDraft.breakDuration===v && styles.optionTextActive]}>{v}分</Text>
                </TouchableOpacity>
              ))}</View>
              <Text style={styles.settingLabel}>长休时长</Text>
              <View style={styles.optionRow}>{[10,15,20,30].map(v => (
                <TouchableOpacity key={v} style={[styles.option, settingsDraft.longBreakDuration===v && styles.optionActive]} onPress={() => setSettingsDraft({...settingsDraft, longBreakDuration:v})}>
                  <Text style={[styles.optionText, settingsDraft.longBreakDuration===v && styles.optionTextActive]}>{v}分</Text>
                </TouchableOpacity>
              ))}</View>
              <Text style={styles.settingLabel}>几个番茄后长休</Text>
              <View style={styles.optionRow}>{[2,3,4,5].map(v => (
                <TouchableOpacity key={v} style={[styles.option, settingsDraft.sessionsBeforeLongBreak===v && styles.optionActive]} onPress={() => setSettingsDraft({...settingsDraft, sessionsBeforeLongBreak:v})}>
                  <Text style={[styles.optionText, settingsDraft.sessionsBeforeLongBreak===v && styles.optionTextActive]}>{v}个</Text>
                </TouchableOpacity>
              ))}</View>
            </ScrollView>
            <TouchableOpacity style={styles.saveBtn} onPress={onSaveSettings}>
              <Text style={styles.saveBtnText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', paddingHorizontal: spacing.lg },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg },
  title: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: fontSizes.caption, color: colors.textSecondary, marginTop: spacing.xs },
  ring: { width: 240, alignItems: 'center', marginTop: spacing.xl },
  ringBg: { width: 200, height: 200, borderRadius: 100, borderWidth: 8, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  ringBgSmall: { width: 160, height: 160, borderRadius: 80, borderWidth: 6 },
  timer: { fontSize: 48, fontWeight: '700', fontVariant: ['tabular-nums'] },
  timerSmall: { fontSize: 36 },
  phaseLabel: { fontSize: fontSizes.caption, fontWeight: '600', marginTop: spacing.xs },
  progressBar: { width: '100%', height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  controls: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, flexWrap: 'wrap', justifyContent: 'center' },
  btn: { paddingHorizontal: 32, paddingVertical: spacing.md, borderRadius: borderRadius.full },
  btnText: { color: '#FFF', fontSize: fontSizes.body, fontWeight: '700' },
  btnOutline: { paddingHorizontal: 32, paddingVertical: spacing.md, borderRadius: borderRadius.full, borderWidth: 2, borderColor: colors.primary },
  btnOutlineText: { color: colors.primary, fontSize: fontSizes.body, fontWeight: '700' },
  fullscreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fullControls: { position: 'absolute', bottom: 80, gap: spacing.md },
  fullBtn: { paddingHorizontal: 32, paddingVertical: spacing.md, borderRadius: borderRadius.full, marginTop: spacing.sm },
  fsContainer: { flex: 1, backgroundColor: '#0D0D1A', alignItems: 'center', justifyContent: 'center' },
  fsLandscape: { alignItems: 'center', justifyContent: 'center' },
  fsPhaseLabel: { fontSize: 22, fontWeight: '600', color: '#777', marginBottom: 36, letterSpacing: 3 },
  fsTimerWrap: { marginBottom: 48 },
  fsTimer: { fontSize: 88, fontWeight: '200', fontVariant: ['tabular-nums'], letterSpacing: 6 },
  fsControls: { flexDirection: 'row', gap: spacing.md },
  fsBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: borderRadius.full },
  fsBtnText: { color: '#DDD', fontSize: fontSizes.body, fontWeight: '500' },
  settingsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  settingsCard: { backgroundColor: colors.cardBackground, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, maxHeight: '80%' },
  settingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sheetTitle: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.textPrimary },
  settingLabel: { fontSize: fontSizes.caption, fontWeight: '600', color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: '#F1F3F5' },
  optionActive: { backgroundColor: colors.primary + '20', borderWidth: 1.5, borderColor: colors.primary },
  optionText: { fontSize: fontSizes.caption, color: colors.textSecondary },
  optionTextActive: { color: colors.primary, fontWeight: '600' },
  saveBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.sm, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { color: '#FFF', fontSize: fontSizes.body, fontWeight: '600' },
});
