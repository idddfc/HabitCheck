// 滚轮式时间选择器（Modal 包裹版）
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../theme';

const ITEM_H = 44;
const PICKER_H = ITEM_H * 5;
const PAD = ITEM_H * 2;
const SCREEN_W = Dimensions.get('window').width;

interface Props { visible: boolean; initialTime: string; onConfirm: (t: string) => void; onCancel: () => void; }

export default function SlotTimePicker({ visible, initialTime, onConfirm, onCancel }: Props) {
  const [h, m] = initialTime.split(':').map(Number);
  const [hour, setHour] = useState(Number.isNaN(h) ? 8 : h);
  const [minute, setMinute] = useState(Number.isNaN(m) ? 0 : m);
  const hRef = useRef<FlatList>(null) as any;
  const mRef = useRef<FlatList>(null) as any;

  useEffect(() => {
    if (!visible) return;
    const hi = Number.isNaN(h) ? 8 : h;
    const mi = Number.isNaN(m) ? 0 : m;
    setHour(hi); setMinute(mi);
    setTimeout(() => {
      hRef.current?.scrollToIndex({ index: hi, animated: false, viewPosition: 0.5 });
      mRef.current?.scrollToIndex({ index: mi, animated: false, viewPosition: 0.5 });
    }, 80);
  }, [visible, initialTime]);

  const onEnd = (e: any, setter: (v: number) => void, ref: any, max: number) => {
    const idx = Math.round((e.nativeEvent.contentOffset.y - PAD) / ITEM_H);
    const clamped = Math.max(0, Math.min(max - 1, idx));
    ref.current?.scrollToIndex({ index: clamped, animated: true, viewPosition: 0.5 });
    setter(clamped);
  };

  const col = (data: string[], val: number, setter: any, ref: any, max: number) => (
    <View style={s.col}>
      <FlatList
        ref={ref} data={data} keyExtractor={k => k} showsVerticalScrollIndicator={false}
        style={{ height: PICKER_H }}
        nestedScrollEnabled
        ListHeaderComponent={<View style={{ height: PAD }} />}
        ListFooterComponent={<View style={{ height: PAD }} />}
        snapToOffsets={Array.from({ length: data.length }, (_, i) => PAD + ITEM_H * i)}
        decelerationRate="fast"
        onMomentumScrollEnd={e => onEnd(e, setter, ref, max)}
        getItemLayout={(_, i) => ({ length: ITEM_H, offset: PAD + ITEM_H * i, index: i })}
        initialNumToRender={10} maxToRenderPerBatch={10} windowSize={5}
        renderItem={({ item, index }) => (
          <View style={s.row}>
            <Text style={[s.text, index === val && s.active]}>{item}</Text>
          </View>
        )}
      />
    </View>
  );

  return (
    <Pressable style={s.overlay} onPress={onCancel}>
      <Pressable style={s.box}>
        <Text style={s.title}>选择时间</Text>
        <View style={s.cols}>
          {col(Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')), hour, setHour, hRef, 24)}
          <Text style={s.colon}>:</Text>
          {col(Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')), minute, setMinute, mRef, 60)}
        </View>
        <View style={s.btns}>
          <TouchableOpacity style={s.cBtn} onPress={onCancel}><Text style={s.cTxt}>取消</Text></TouchableOpacity>
          <TouchableOpacity style={s.fBtn} onPress={() => onConfirm(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)}>
            <Text style={s.fTxt}>确定</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  box: { backgroundColor: colors.cardBackground, borderRadius: borderRadius.lg, width: SCREEN_W - spacing.xl * 2, padding: spacing.lg, alignItems: 'center' },
  title: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  cols: { flexDirection: 'row', alignItems: 'center', height: PICKER_H },
  col: { flex: 1 },
  colon: { fontSize: fontSizes.h1, fontWeight: '700', color: colors.textPrimary, marginHorizontal: spacing.sm },
  row: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: fontSizes.body, color: colors.border },
  active: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.primary },
  btns: { flexDirection: 'row', marginTop: spacing.lg, gap: spacing.md },
  cBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm + 2, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.border },
  cTxt: { fontSize: fontSizes.body, color: colors.textSecondary },
  fBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm + 2, borderRadius: borderRadius.sm, backgroundColor: colors.primary },
  fTxt: { fontSize: fontSizes.body, color: '#FFFFFF', fontWeight: '600' },
});
