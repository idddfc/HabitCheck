// 番茄钟 Tab
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSizes, spacing, borderRadius } from '../theme';
import { getSettings, getTodayRecord, incrementTodayRecord, saveSettings } from '../utils/pomodoro';
import CustomWheelPicker from '../components/CustomWheelPicker';

type Phase = 'work' | 'break' | 'longBreak';

// 步骤定义
type Step = 'workDuration' | 'breakDuration' | 'longBreakDuration' | 'sessions';

const STEP_ORDER: Step[] = ['workDuration', 'breakDuration', 'longBreakDuration', 'sessions'];

// 每个步骤对应的图标和标签
const STEP_CONFIG: Record<Step, { icon: string; label: string; options: string[] }> = {
  workDuration: {
    icon: '🍅',
    label: '工作时长',
    options: Array.from({ length: 60 }, (_, i) => `${i + 1} 分钟`),
  },
  breakDuration: {
    icon: '☕',
    label: '短休时长',
    options: Array.from({ length: 30 }, (_, i) => `${i + 1} 分钟`),
  },
  longBreakDuration: {
    icon: '🧘',
    label: '长休时长',
    options: Array.from({ length: 60 }, (_, i) => `${i + 1} 分钟`),
  },
  sessions: {
    icon: '🔢',
    label: '番茄次数',
    options: Array.from({ length: 10 }, (_, i) => `${i + 1} 个`),
  },
};

// 获取某个步骤对应的当前值（从 settingsDraft 中读取）
const getStepValue = (step: Step, settings: any): number => {
  switch (step) {
    case 'workDuration':
      return settings.workDuration;
    case 'breakDuration':
      return settings.breakDuration;
    case 'longBreakDuration':
      return settings.longBreakDuration;
    case 'sessions':
      return settings.sessionsBeforeLongBreak;
  }
};

// 更新 settingsDraft 中某个步骤的值
const setStepValue = (step: Step, settings: any, value: number): any => {
  switch (step) {
    case 'workDuration':
      return { ...settings, workDuration: value };
    case 'breakDuration':
      return { ...settings, breakDuration: value };
    case 'longBreakDuration':
      return { ...settings, longBreakDuration: value };
    case 'sessions':
      return { ...settings, sessionsBeforeLongBreak: value };
  }
};

export default function PomodoroScreen() {
  const insets = useSafeAreaInsets();
  const [seconds, setSeconds] = useState(25 * 60);
  const [phase, setPhase] = useState<Phase>('work');
  const [running, setRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [todayDone, setTodayDone] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // 设置面板相关状态
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState(getSettings());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // 缩放动画
  const scaleAnim = useRef(new Animated.Value(0)).current;
  
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

  // 打开设置选择器
  const openPickerModal = () => {
    setSettingsDraft(settings.current);
    setCurrentStepIndex(0);
    setShowPickerModal(true);
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // 关闭选择器（不保存）
  const closePickerModal = () => {
    Animated.spring(scaleAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      setShowPickerModal(false);
    });
  };

  // 保存并关闭
  const saveAndClose = () => {
    saveSettings(settingsDraft);
    settings.current = settingsDraft;
    if (!running) {
      setSeconds(settingsDraft.workDuration * 60);
      setPhase('work');
      setSessionCount(0);
    }
    closePickerModal();
  };

  // 下一步
  const goToNextStep = () => {
    if (currentStepIndex < STEP_ORDER.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      saveAndClose();
    }
  };

  // 返回上一步
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const currentStep = STEP_ORDER[currentStepIndex];
  const currentConfig = STEP_CONFIG[currentStep];
  const currentValue = getStepValue(currentStep, settingsDraft);
  const currentOptions = currentConfig.options;
  const currentIndex = Math.max(0, Math.min(currentValue - 1, currentOptions.length - 1));

  const PhaseColors = { work: '#FF6B6B', break: '#4ECDC4', longBreak: '#6C63FF' };
  const phaseLabel = { work: '🍅 专注', break: '☕ 短休', longBreak: '🧘 长休' };
  const progress = phase === 'work'
    ? 1 - seconds / (settings.current.workDuration * 60)
    : phase === 'break'
      ? 1 - seconds / (settings.current.breakDuration * 60)
      : 1 - seconds / (settings.current.longBreakDuration * 60);

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
  <TouchableOpacity onPress={openPickerModal}>
    <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
  </TouchableOpacity>
</View>
      <Text style={styles.subtitle}>今日已完成 {todayDone} 个番茄</Text>

      <TouchableOpacity onPress={openPickerModal} activeOpacity={0.7}>
        <TimerRing />
      </TouchableOpacity>

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

      {/* 放大选择器 Modal */}
      <Modal visible={showPickerModal} transparent={true} animationType="none" statusBarTranslucent>
  <View style={styles.pickerOverlay}>
    {/* 背景层：点击关闭（但不拦截内容手势） */}
    <TouchableWithoutFeedback onPress={closePickerModal}>
      <View style={StyleSheet.absoluteFill} />
    </TouchableWithoutFeedback>

    {/* 内容层：不受背景点击影响，内部 FlatList 可正常滚动 */}
    <Animated.View
      style={[
        styles.pickerContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}
      pointerEvents="auto"
    >
      {/* 顶部：步骤标题 + 关闭按钮 */}
      <View style={styles.pickerHeader}>
        <Text style={styles.pickerTitle}>{currentConfig.label}</Text>
        <TouchableOpacity onPress={closePickerModal} style={styles.pickerCloseBtn}>
          <Ionicons name="close" size={28} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* 中间：自定义滚轮 */}
      <View style={styles.pickerWheelWrapper}>
        <CustomWheelPicker
          options={currentOptions}
          selectedIndex={currentIndex}
          onChange={(index) => {
            const newValue = index + 1;
            setSettingsDraft(setStepValue(currentStep, settingsDraft, newValue));
          }}
          itemHeight={50}
          height={250}
          containerStyle={styles.pickerWheel}
          selectedIndicatorStyle={styles.pickerSelectedIndicator}
          itemTextStyle={styles.pickerWheelText}
          selectedItemTextStyle={styles.pickerWheelSelectedText}
        />
        {currentStepIndex > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={goToPreviousStep}>
            <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 底部：四个进度图标 */}
      <View style={styles.stepIndicators}>
        {STEP_ORDER.map((step, index) => {
          const config = STEP_CONFIG[step];
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          return (
            <View key={step} style={styles.stepIndicatorItem}>
              <View
                style={[
                  styles.stepIconCircle,
                  isActive && styles.stepIconActive,
                  isCompleted && styles.stepIconCompleted,
                ]}
              >
                <Text style={[
                  styles.stepIconText,
                  isActive && styles.stepIconTextActive,
                  isCompleted && styles.stepIconTextCompleted,
                ]}>
                  {config.icon}
                </Text>
              </View>
              <Text style={[
                styles.stepLabel,
                isActive && styles.stepLabelActive,
                isCompleted && styles.stepLabelCompleted,
              ]}>
                {config.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 底部按钮 */}
      <TouchableOpacity style={styles.pickerNextBtn} onPress={goToNextStep}>
        <Text style={styles.pickerNextBtnText}>
          {currentStepIndex === STEP_ORDER.length - 1 ? '完成' : '下一步'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
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
  fsContainer: { flex: 1, backgroundColor: '#0D0D1A', alignItems: 'center', justifyContent: 'center' },
  fsLandscape: { alignItems: 'center', justifyContent: 'center' },
  fsPhaseLabel: { fontSize: 22, fontWeight: '600', color: '#777', marginBottom: 36, letterSpacing: 3 },
  fsTimerWrap: { marginBottom: 48 },
  fsTimer: { fontSize: 88, fontWeight: '200', fontVariant: ['tabular-nums'], letterSpacing: 6 },
  fsControls: { flexDirection: 'row', gap: spacing.md },
  fsBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: borderRadius.full },
  fsBtnText: { color: '#DDD', fontSize: fontSizes.body, fontWeight: '500' },

  pickerOverlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)',
},
  pickerContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: spacing.lg,
    width: '92%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 10,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pickerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pickerCloseBtn: {
    padding: 4,
  },
  pickerWheelWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerWheel: {
    height: 250,
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  pickerSelectedIndicator: {
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.sm,
    marginHorizontal: 8,
  },
  pickerWheelText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  pickerWheelSelectedText: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: '700',
  },
  backButton: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  stepIndicatorItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stepIconActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  stepIconCompleted: {
    backgroundColor: colors.primary + '10',
  },
  stepIconText: {
    fontSize: 20,
    opacity: 0.4,
  },
  stepIconTextActive: {
    opacity: 1,
  },
  stepIconTextCompleted: {
    opacity: 0.7,
  },
  stepLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    opacity: 0.5,
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '600',
    opacity: 1,
  },
  stepLabelCompleted: {
    opacity: 0.7,
  },
  pickerNextBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  pickerNextBtnText: {
    color: '#FFF',
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
});